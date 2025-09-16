import connectDB from './mongodb';
import User from './models/user.model';
import { clerkClient } from '@clerk/nextjs/server';

export async function ensureDbUserFromClerk(clerkId: string) {
  await connectDB();

  let user = await User.findOne({ clerkId });
  if (user) return user;

  // In newer Clerk versions, clerkClient is a function returning a client
  // Call it to obtain the client instance before using .users
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - types vary across Clerk versions
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
  const firstName = clerkUser.firstName || '';
  const lastName = clerkUser.lastName || '';
  const photo = clerkUser.imageUrl || '';

  user = new User({
    clerkId,
    email,
    firstName,
    lastName,
    photo,
  });
  await user.save();
  return user;
}


