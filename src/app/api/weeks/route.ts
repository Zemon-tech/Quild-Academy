import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Week from '@/lib/models/week.model';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get('phaseId');

    await connectDB();
    
    let query: { isActive: boolean; phaseId?: string } = { isActive: true };
    if (phaseId) {
      query = { ...query, phaseId };
    }
    
    const weeks = await Week.find(query).sort({ weekNumber: 1 });
    
    return NextResponse.json({ weeks });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weeks' },
      { status: 500 }
    );
  }
}
