export const dynamic = 'force-dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Trophy, 
  Flame, 
  Clock, 
  Target,
  BookOpen,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/lib/models/user.model';
import UserProgress from '@/lib/models/progress.model';
import Phase from '@/lib/models/phase.model';
import Week from '@/lib/models/week.model';
import Lesson from '@/lib/models/lesson.model';

async function getProfileData() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        user: null,
        userProgress: null,
        stats: {
          totalPhases: 0,
          completedPhases: 0,
          totalWeeks: 0,
          completedWeeks: 0,
          totalLessons: 0,
          completedLessons: 0,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalTimeSpent: 0
        }
      };
    }

    await connectDB();

    // Find user by clerkId, create if doesn't exist
    let user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      console.log('User not found, creating new user for clerkId:', userId);
      
      user = new UserModel({
        clerkId: userId,
        email: 'temp@example.com',
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

      userProgress = await UserProgress.findOne({ userId: user._id })
        .populate('currentPhase')
        .populate('currentWeek')
        .populate('currentLesson');
    }

    // Get stats
    const totalPhases = await Phase.countDocuments({ isActive: true });
    const totalWeeks = await Week.countDocuments({ isActive: true });
    const totalLessons = await Lesson.countDocuments({ isActive: true });

    const stats = {
      totalPhases,
      completedPhases: userProgress.completedPhases.length,
      totalWeeks,
      completedWeeks: userProgress.completedWeeks.length,
      totalLessons,
      completedLessons: userProgress.completedLessons.length,
      totalPoints: userProgress.totalPoints,
      currentStreak: userProgress.currentStreak,
      longestStreak: userProgress.longestStreak,
      totalTimeSpent: userProgress.totalTimeSpent
    };

    return {
      user,
      userProgress,
      stats
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return {
      user: null,
      userProgress: null,
      stats: {
        totalPhases: 0,
        completedPhases: 0,
        totalWeeks: 0,
        completedWeeks: 0,
        totalLessons: 0,
        completedLessons: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0
      }
    };
  }
}

export default async function ProfilePage() {
  const { user, userProgress, stats } = await getProfileData();

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const progressPercentage = stats.totalLessons > 0 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100) 
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and learning progress</p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt="Profile" 
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Learning Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              {userProgress?.currentPhase && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Current Phase:</span>
                  </div>
                  <Badge variant="outline" className="ml-6">
                    {userProgress.currentPhase.name}
                  </Badge>
                </div>
              )}

              {userProgress?.currentWeek && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Current Week:</span>
                  </div>
                  <Badge variant="outline" className="ml-6">
                    Week {userProgress.currentWeek.weekNumber}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Learning Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-2xl font-bold">{stats.totalPoints}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Points</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-2xl font-bold">{stats.currentStreak}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Current Streak</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold">{stats.completedLessons}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Lessons Completed</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">{Math.round(stats.totalTimeSpent / 60)}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Hours Studied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Detailed Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.completedPhases}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Phases Completed</div>
                <div className="text-xs text-gray-500">of {stats.totalPhases}</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.completedWeeks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Weeks Completed</div>
                <div className="text-xs text-gray-500">of {stats.totalWeeks}</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{stats.completedLessons}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Lessons Completed</div>
                <div className="text-xs text-gray-500">of {stats.totalLessons}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
