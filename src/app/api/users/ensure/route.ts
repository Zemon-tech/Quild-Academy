import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    await connectDB();

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const photo = clerkUser.imageUrl || '';

      user = new User({
        clerkId: userId,
        email,
        firstName,
        lastName,
        photo,
      });
      await user.save();
    }

    const url = new URL(request.url);
    const redirect = url.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirect, request.url));
  } catch (error) {
    console.error('Error ensuring user:', error);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}


