import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  Play, 
  ChevronRight,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';
import UserProgress from '@/lib/models/progress.model';
import Phase from '@/lib/models/phase.model';
import Week from '@/lib/models/week.model';
import Lesson from '@/lib/models/lesson.model';

async function getDashboardData() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        userProgress: null,
        leaderboard: []
      };
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

    // Get user progress
    let userProgress = await UserProgress.findOne({ userId: user._id })
      .populate('currentPhase')
      .populate('currentWeek')
      .populate('currentLesson');

    if (!userProgress) {
      // Initialize user with first lesson
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
      
      // Populate the saved progress
      userProgress = await UserProgress.findOne({ userId: user._id })
        .populate('currentPhase')
        .populate('currentWeek')
        .populate('currentLesson');
    }

    // Get leaderboard data
    const leaderboard = await UserProgress.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'phases',
          localField: 'currentPhase',
          foreignField: '_id',
          as: 'currentPhaseDetails'
        }
      },
      {
        $unwind: {
          path: '$currentPhaseDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'weeks',
          localField: 'currentWeek',
          foreignField: '_id',
          as: 'currentWeekDetails'
        }
      },
      {
        $unwind: {
          path: '$currentWeekDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          clerkId: '$user.clerkId',
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          photo: '$user.photo',
          totalPoints: '$totalPoints',
          currentStreak: '$currentStreak',
          currentPhase: '$currentPhaseDetails',
          currentWeek: '$currentWeekDetails',
        }
      },
      {
        $sort: { totalPoints: -1, currentStreak: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const currentUserClerkId = userId;
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.clerkId === currentUserClerkId,
    }));

    return {
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
        completedResources: userProgress.completedResources,
      },
      leaderboard: rankedLeaderboard
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      userProgress: null,
      leaderboard: []
    };
  }
}

export default async function DashboardPage() {
  const { userProgress, leaderboard } = await getDashboardData();

  if (!userProgress) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  // Calculate progress percentages
  const phaseProgress = userProgress.completedPhases?.length || 0;
  const totalPhases = 3; // This should come from API
  const phaseProgressPercentage = Math.round((phaseProgress / totalPhases) * 100);

  const weekProgress = userProgress.completedWeeks?.length || 0;
  const totalWeeks = 12; // This should come from API
  const weekProgressPercentage = Math.round((weekProgress / totalWeeks) * 100);

  const lessonProgress = userProgress.completedLessons?.length || 0;
  const totalLessons = 60; // This should come from API
  const lessonProgressPercentage = Math.round((lessonProgress / totalLessons) * 100);
  return (
    <MainLayout>
      <div className="w-full space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
          <p className="text-gray-600 dark:text-gray-400">Ready to continue your learning journey?</p>
        </div>

        {/* Current Phase Progress */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Current Phase</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userProgress.currentPhase?.name || 'Loading...'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Week {userProgress.currentWeek?.weekNumber || 0} • Day {userProgress.currentLesson?.dayNumber || 0}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Phase Progress</span>
                  <span>{phaseProgressPercentage}%</span>
                </div>
                <Progress value={phaseProgressPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Today's Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-600" />
                <span>Current Lesson</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userProgress.currentLesson?.title || 'No lesson available'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userProgress.currentLesson?.description || 'Loading lesson details...'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="capitalize">{userProgress.currentLesson?.type || 'lesson'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{userProgress.currentLesson?.content?.duration || 0} min</span>
                  </span>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/lesson/${userProgress.currentLesson?._id}`}>
                    Start Learning
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Points</span>
                  <span className="font-semibold">{userProgress.totalPoints}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Streak</span>
                  <span className="font-semibold text-green-600">{userProgress.currentStreak} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time Spent</span>
                  <span className="font-semibold">{Math.round(userProgress.totalTimeSpent / 60)} hours</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {lessonProgressPercentage}%
                  </div>
                  <p className="text-sm text-gray-500">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Weekly Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {weekProgress}/{totalWeeks}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Weeks Completed</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span>{weekProgressPercentage}%</span>
                </div>
                <Progress value={weekProgressPercentage} className="h-2" />
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {userProgress.currentStreak} day streak! 🔥
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((user) => (
                  <div key={user.rank} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rank}
                      </div>
                      <span className={`text-sm font-medium ${
                        user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {user.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.totalPoints}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.currentStreak} day streak
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/leaderboard">View Full Leaderboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
