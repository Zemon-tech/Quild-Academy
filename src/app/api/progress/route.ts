import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';
import UserProgress from '@/lib/models/progress.model';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    await connectDB();
    
    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({
      userId: user._id,
      courseId: courseId,
    });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId: user._id,
        courseId: courseId,
        completedResources: [],
      });
      await userProgress.save();
    }

    return NextResponse.json({
      completedResources: userProgress.completedResources,
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

    const { courseId, resourceId } = await request.json();

    if (!courseId || !resourceId) {
      return NextResponse.json(
        { error: 'Course ID and Resource ID are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({
      userId: user._id,
      courseId: courseId,
    });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId: user._id,
        courseId: courseId,
        completedResources: [],
      });
    }

    // Toggle resource completion
    const resourceIndex = userProgress.completedResources.indexOf(resourceId);
    if (resourceIndex > -1) {
      userProgress.completedResources.splice(resourceIndex, 1);
    } else {
      userProgress.completedResources.push(resourceId);
    }

    await userProgress.save();

    return NextResponse.json({
      completedResources: userProgress.completedResources,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
