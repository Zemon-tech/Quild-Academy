import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';
import UserProgress from '@/lib/models/progress.model';
import Lesson from '@/lib/models/lesson.model';
import Week from '@/lib/models/week.model';
import Phase from '@/lib/models/phase.model';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeSpent, action } = await request.json();

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
      console.log('User not found, creating new user for clerkId:', userId);
      
      user = new User({
        clerkId: userId,
        email: 'temp@example.com',
        firstName: 'User',
        lastName: 'Name',
        photo: '',
      });
      await user.save();
      console.log('Created new user:', user);
    }

    // Get lesson details
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId: user._id });
    if (!userProgress) {
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

    if (action === 'complete') {
      // Check if lesson is already completed
      const isAlreadyCompleted = userProgress.completedLessons.some(
        (completed: CompletedLesson) => completed.lessonId.toString() === lessonId
      );

      if (!isAlreadyCompleted) {
        // Add lesson to completed lessons
        userProgress.completedLessons.push({
          lessonId: lesson._id,
          completedAt: new Date(),
          timeSpent: timeSpent || lesson.duration,
          pointsEarned: lesson.points
        });

        // Update total points
        userProgress.totalPoints += lesson.points;

        // Update total time spent
        userProgress.totalTimeSpent += (timeSpent || lesson.duration);

        // Update streak
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (!userProgress.lastActivityDate) {
          userProgress.currentStreak = 1;
        } else {
          const lastActivity = new Date(userProgress.lastActivityDate);
          const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            userProgress.currentStreak += 1;
          } else if (daysDiff > 1) {
            userProgress.currentStreak = 1;
          }
          // If daysDiff === 0, it's the same day, so don't change streak
        }

        // Update longest streak
        if (userProgress.currentStreak > userProgress.longestStreak) {
          userProgress.longestStreak = userProgress.currentStreak;
        }

        userProgress.lastActivityDate = today;

        // Check if this completes the current week
        const week = await Week.findById(lesson.weekId);
        if (week) {
          const weekLessons = await Lesson.find({ weekId: week._id, isActive: true });
          const completedWeekLessons = userProgress.completedLessons.filter(
            (completed: CompletedLesson) => weekLessons.some(lesson => lesson._id.toString() === completed.lessonId.toString())
          );

          if (completedWeekLessons.length === weekLessons.length) {
            // Week is completed
            const isWeekAlreadyCompleted = userProgress.completedWeeks.some(
              (completed: CompletedWeek) => completed.weekId.toString() === week._id.toString()
            );

            if (!isWeekAlreadyCompleted) {
              userProgress.completedWeeks.push({
                weekId: week._id,
                completedAt: new Date(),
                timeSpent: weekLessons.reduce((total, lesson) => total + lesson.duration, 0),
                pointsEarned: weekLessons.reduce((total, lesson) => total + lesson.points, 0)
              });

              // Check if this completes the current phase
              const phase = await Phase.findById(week.phaseId);
              if (phase) {
                const phaseWeeks = await Week.find({ phaseId: phase._id, isActive: true });
                const completedPhaseWeeks = userProgress.completedWeeks.filter(
                  (completed: CompletedWeek) => phaseWeeks.some(week => week._id.toString() === completed.weekId.toString())
                );

                if (completedPhaseWeeks.length === phaseWeeks.length) {
                  // Phase is completed
                  const isPhaseAlreadyCompleted = userProgress.completedPhases.some(
                    (completed: CompletedPhase) => completed.phaseId.toString() === phase._id.toString()
                  );

                  if (!isPhaseAlreadyCompleted) {
                    userProgress.completedPhases.push({
                      phaseId: phase._id,
                      completedAt: new Date(),
                      timeSpent: phaseWeeks.reduce((total, week) => total + week.duration, 0),
                      pointsEarned: phaseWeeks.reduce((total, week) => total + week.points, 0)
                    });
                  }
                }
              }
            }
          }
        }

        // Update current lesson to next lesson
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
            phaseId: lesson.weekId.phaseId,
            weekNumber: { $gt: week.weekNumber },
            isActive: true
          }).sort({ weekNumber: 1 });

          if (nextWeek) {
            const firstLessonOfNextWeek = await Lesson.findOne({
              weekId: nextWeek._id,
              isActive: true
            }).sort({ order: 1 });

            if (firstLessonOfNextWeek) {
              userProgress.currentWeek = nextWeek._id;
              userProgress.currentLesson = firstLessonOfNextWeek._id;
            }
          } else {
            // Move to next phase
            const currentPhase = await Phase.findById(week.phaseId);
            if (currentPhase) {
              const nextPhase = await Phase.findOne({
                order: { $gt: currentPhase.order },
                isActive: true
              }).sort({ order: 1 });

              if (nextPhase) {
                const firstWeekOfNextPhase = await Week.findOne({
                  phaseId: nextPhase._id,
                  isActive: true
                }).sort({ weekNumber: 1 });

                if (firstWeekOfNextPhase) {
                  const firstLessonOfNextPhase = await Lesson.findOne({
                    weekId: firstWeekOfNextPhase._id,
                    isActive: true
                  }).sort({ order: 1 });

                  if (firstLessonOfNextPhase) {
                    userProgress.currentPhase = nextPhase._id;
                    userProgress.currentWeek = firstWeekOfNextPhase._id;
                    userProgress.currentLesson = firstLessonOfNextPhase._id;
                  }
                }
              }
            }
          }
        }

        await userProgress.save();

        return NextResponse.json({
          success: true,
          message: 'Lesson completed successfully!',
          data: {
            pointsEarned: lesson.points,
            newTotalPoints: userProgress.totalPoints,
            newStreak: userProgress.currentStreak,
            nextLesson: nextLesson ? {
              id: nextLesson._id,
              title: nextLesson.title
            } : null
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Lesson already completed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Action processed successfully'
    });

  } catch (error) {
    console.error('Error processing lesson action:', error);
    return NextResponse.json(
      { error: 'Failed to process lesson action' },
      { status: 500 }
    );
  }
}
