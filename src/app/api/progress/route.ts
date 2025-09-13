import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';
import UserProgress from '@/lib/models/progress.model';
import Phase from '@/lib/models/phase.model';
import Week from '@/lib/models/week.model';
import Lesson from '@/lib/models/lesson.model';
import { Types } from 'mongoose';

interface CompletedLesson {
  lessonId: Types.ObjectId;
  completedAt: Date;
  timeSpent: number;
  pointsEarned: number;
}

interface CompletedWeek {
  weekId: Types.ObjectId;
  completedAt: Date;
  timeSpent: number;
  pointsEarned: number;
}

interface CompletedPhase {
  phaseId: Types.ObjectId;
  completedAt: Date;
  timeSpent: number;
  pointsEarned: number;
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find user by clerkId, create if doesn't exist
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      // User doesn't exist, create them
      // This can happen if webhook failed or user signed in before webhook was set up
      console.log('User not found, creating new user for clerkId:', userId);
      
      // We need to get user info from Clerk
      // For now, create with minimal info - this should ideally be handled by webhook
      user = new User({
        clerkId: userId,
        email: 'temp@example.com', // This will be updated by webhook
        firstName: 'User',
        lastName: 'Name',
        photo: '',
      });
      await user.save();
      console.log('Created new user:', user);
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId: user._id })
      .populate('currentPhase')
      .populate('currentWeek')
      .populate('currentLesson');

    if (!userProgress) {
      // Initialize user progress with first phase
      const firstPhase = await Phase.findOne({ isActive: true }).sort({ order: 1 });
      const firstWeek = await Week.findOne({ phaseId: firstPhase?._id, isActive: true }).sort({ weekNumber: 1 });
      const firstLesson = await Lesson.findOne({ weekId: firstWeek?._id, isActive: true }).sort({ order: 1 });

      userProgress = new UserProgress({
        userId: user._id,
        currentPhase: firstPhase?._id,
        currentWeek: firstWeek?._id,
        currentLesson: firstLesson?._id,
        completedResources: [],
      });
      await userProgress.save();
    }

    return NextResponse.json({
      userProgress: {
        currentPhase: userProgress.currentPhase,
        currentWeek: userProgress.currentWeek,
        currentLesson: userProgress.currentLesson,
        completedPhases: userProgress.completedPhases,
        completedWeeks: userProgress.completedWeeks,
        completedLessons: userProgress.completedLessons,
        totalPoints: userProgress.totalPoints,
        currentStreak: userProgress.currentStreak,
        longestStreak: userProgress.longestStreak,
        totalTimeSpent: userProgress.totalTimeSpent,
        achievements: userProgress.achievements,
        completedResources: userProgress.completedResources, // legacy support
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, timeSpent, action } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find user by clerkId, create if doesn't exist
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      // User doesn't exist, create them
      console.log('User not found, creating new user for clerkId:', userId);
      
      user = new User({
        clerkId: userId,
        email: 'temp@example.com', // This will be updated by webhook
        firstName: 'User',
        lastName: 'Name',
        photo: '',
      });
      await user.save();
      console.log('Created new user:', user);
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId: user._id });
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: user._id,
        completedResources: [],
      });
    }

    // Get lesson details
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (action === 'complete') {
      // Check if lesson is already completed
      const isAlreadyCompleted = userProgress.completedLessons.some(
        (completed: CompletedLesson) => completed.lessonId.toString() === lessonId
      );

      if (!isAlreadyCompleted) {
        // Add lesson to completed lessons
        userProgress.completedLessons.push({
          lessonId,
          completedAt: new Date(),
          timeSpent: timeSpent || 0,
          pointsEarned: lesson.points
        });

        // Update total points
        userProgress.totalPoints += lesson.points;
        userProgress.totalTimeSpent += timeSpent || 0;

        // Update streak
        const today = new Date();
        const lastActivity = userProgress.lastActivityDate;
        
        if (!lastActivity || lastActivity.toDateString() !== today.toDateString()) {
          if (lastActivity && lastActivity.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
            userProgress.currentStreak += 1;
          } else {
            userProgress.currentStreak = 1;
          }
          userProgress.lastActivityDate = today;
        }

        // Update longest streak
        if (userProgress.currentStreak > userProgress.longestStreak) {
          userProgress.longestStreak = userProgress.currentStreak;
        }

        // Check if week is completed
        const weekId = lesson.weekId;
        const weekLessons = await Lesson.find({ weekId, isActive: true });
        const completedWeekLessons = userProgress.completedLessons.filter(
          (completed: CompletedLesson) => weekLessons.some(weekLesson => 
            weekLesson._id.toString() === completed.lessonId.toString()
          )
        );

        if (completedWeekLessons.length === weekLessons.length) {
          // Week completed
          const isWeekAlreadyCompleted = userProgress.completedWeeks.some(
            (completed: CompletedWeek) => completed.weekId.toString() === weekId.toString()
          );

          if (!isWeekAlreadyCompleted) {
            userProgress.completedWeeks.push({
              weekId,
              completedAt: new Date()
            });

            // Check if phase is completed
            const week = await Week.findById(weekId);
            if (week) {
              const phaseId = week.phaseId;
              const phaseWeeks = await Week.find({ phaseId, isActive: true });
              const completedPhaseWeeks = userProgress.completedWeeks.filter(
                (completed: CompletedWeek) => phaseWeeks.some(phaseWeek => 
                  phaseWeek._id.toString() === completed.weekId.toString()
                )
              );

              if (completedPhaseWeeks.length === phaseWeeks.length) {
                // Phase completed
                const isPhaseAlreadyCompleted = userProgress.completedPhases.some(
                  (completed: CompletedPhase) => completed.phaseId.toString() === phaseId.toString()
                );

                if (!isPhaseAlreadyCompleted) {
                  userProgress.completedPhases.push({
                    phaseId,
                    completedAt: new Date()
                  });
                }
              }
            }
          }
        }

        // Move to next lesson
        const nextLesson = await Lesson.findOne({
          weekId: lesson.weekId,
          order: { $gt: lesson.order },
          isActive: true
        }).sort({ order: 1 });

        if (nextLesson) {
          userProgress.currentLesson = nextLesson._id;
        } else {
          // Move to next week
          const nextWeek = await Week.findOne({
            phaseId: lesson.weekId,
            weekNumber: { $gt: (await Week.findById(lesson.weekId)).weekNumber },
            isActive: true
          }).sort({ weekNumber: 1 });

          if (nextWeek) {
            const firstLessonOfNextWeek = await Lesson.findOne({
              weekId: nextWeek._id,
              isActive: true
            }).sort({ order: 1 });

            userProgress.currentWeek = nextWeek._id;
            userProgress.currentLesson = firstLessonOfNextWeek?._id;
          } else {
            // Move to next phase
            const currentPhase = await Phase.findById((await Week.findById(lesson.weekId)).phaseId);
            const nextPhase = await Phase.findOne({
              order: { $gt: currentPhase.order },
              isActive: true
            }).sort({ order: 1 });

            if (nextPhase) {
              const firstWeekOfNextPhase = await Week.findOne({
                phaseId: nextPhase._id,
                isActive: true
              }).sort({ weekNumber: 1 });

              const firstLessonOfNextPhase = await Lesson.findOne({
                weekId: firstWeekOfNextPhase._id,
                isActive: true
              }).sort({ order: 1 });

              userProgress.currentPhase = nextPhase._id;
              userProgress.currentWeek = firstWeekOfNextPhase?._id;
              userProgress.currentLesson = firstLessonOfNextPhase?._id;
            }
          }
        }
      }
    }

    await userProgress.save();

    return NextResponse.json({
      success: true,
      userProgress: {
        currentPhase: userProgress.currentPhase,
        currentWeek: userProgress.currentWeek,
        currentLesson: userProgress.currentLesson,
        totalPoints: userProgress.totalPoints,
        currentStreak: userProgress.currentStreak,
        totalTimeSpent: userProgress.totalTimeSpent,
        completedLessons: userProgress.completedLessons.length,
        completedWeeks: userProgress.completedWeeks.length,
        completedPhases: userProgress.completedPhases.length,
      }
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
