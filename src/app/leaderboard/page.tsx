import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Flame, Target, Loader2 } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import UserProgress from '@/lib/models/progress.model';

async function getLeaderboardData() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    await connectDB();

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
      }
    ]);

    const currentUserClerkId = userId;
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.clerkId === currentUserClerkId,
    }));

    return rankedLeaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboardData();

  if (leaderboardData.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="w-full space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">See how you rank among your peers</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {/* 2nd Place */}
          <Card className="order-2 md:order-1">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <Medal className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-lg">2nd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold text-gray-900 dark:text-white">
                {leaderboardData[1].avatar}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{leaderboardData[1]?.name || 'Loading...'}</h3>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{leaderboardData[1]?.totalPoints || 0}</div>
              <div className="flex items-center justify-center space-x-1 text-sm text-orange-600">
                <Flame className="h-4 w-4" />
                <span>{leaderboardData[1]?.currentStreak || 0} day streak</span>
              </div>
              <Badge variant="secondary">{leaderboardData[1]?.currentPhase?.name || 'Phase 1'}</Badge>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="order-1 md:order-2 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">1st Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto text-xl font-bold text-yellow-800 dark:text-yellow-200">
                {leaderboardData[0]?.name?.charAt(0) || '?'}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{leaderboardData[0]?.name || 'Loading...'}</h3>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{leaderboardData[0]?.totalPoints || 0}</div>
              <div className="flex items-center justify-center space-x-1 text-sm text-orange-600">
                <Flame className="h-4 w-4" />
                <span>{leaderboardData[0]?.currentStreak || 0} day streak</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">{leaderboardData[0]?.currentPhase?.name || 'Phase 1'}</Badge>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="order-3">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-lg">3rd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto text-lg font-bold text-orange-800 dark:text-orange-200">
                {leaderboardData[2]?.name?.charAt(0) || '?'}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{leaderboardData[2]?.name || 'Loading...'}</h3>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{leaderboardData[2]?.totalPoints || 0}</div>
              <div className="flex items-center justify-center space-x-1 text-sm text-orange-600">
                <Flame className="h-4 w-4" />
                <span>{leaderboardData[2]?.currentStreak || 0} day streak</span>
              </div>
              <Badge variant="secondary">{leaderboardData[2]?.currentPhase?.name || 'Phase 1'}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Full Leaderboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                {leaderboardData.map((user) => (
                  <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg ${
                    user.isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                        user.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {user.rank}
                      </div>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.currentPhase?.name || 'Phase 1'} • Week {user.currentWeek?.weekNumber || 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.totalPoints}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-orange-600">
                        <Flame className="h-4 w-4" />
                        <span>{user.currentStreak}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
