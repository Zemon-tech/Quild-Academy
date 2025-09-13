import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/lib/models/lesson.model';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekId = searchParams.get('weekId');
    const phaseId = searchParams.get('phaseId');

    await connectDB();
    
    let query: { isActive: boolean; weekId?: string | { $in: Types.ObjectId[] } } = { isActive: true };
    if (weekId) {
      query = { ...query, weekId };
    } else if (phaseId) {
      // Get all lessons for a phase by finding weeks first
      const Week = (await import('@/lib/models/week.model')).default;
      const weeks = await Week.find({ phaseId, isActive: true });
      const weekIds = weeks.map(week => week._id);
      query = { ...query, weekId: { $in: weekIds } };
    }
    
    const lessons = await Lesson.find(query).sort({ order: 1 });
    
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
