import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import UserProgress from '@/lib/models/progress.model';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();
    
    // Get all users with their progress, sorted by total points
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
        $project: {
          userId: 1,
          totalPoints: 1,
          currentStreak: 1,
          longestStreak: 1,
          totalTimeSpent: 1,
          completedLessons: { $size: '$completedLessons' },
          completedWeeks: { $size: '$completedWeeks' },
          completedPhases: { $size: '$completedPhases' },
          'user.firstName': 1,
          'user.lastName': 1,
          'user.photo': 1,
          'user.clerkId': 1
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // Add rank and format the response
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      name: `${user.user.firstName || ''} ${user.user.lastName || ''}`.trim() || 'Anonymous',
      points: user.totalPoints,
      streak: user.currentStreak,
      longestStreak: user.longestStreak,
      timeSpent: Math.round(user.totalTimeSpent / 60), // convert to hours
      completedLessons: user.completedLessons,
      completedWeeks: user.completedWeeks,
      completedPhases: user.completedPhases,
      avatar: user.user.photo,
      isCurrentUser: user.user.clerkId === userId
    }));

    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
