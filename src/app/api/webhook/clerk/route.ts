import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';

export async function POST(request: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    // Verify the payload with the headers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let evt: any;
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      await connectDB();

      // Check if user already exists (in case of duplicate webhook calls)
      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        console.log('User already exists, updating info:', id);
        existingUser.email = email_addresses[0].email_address;
        existingUser.firstName = first_name;
        existingUser.lastName = last_name;
        existingUser.photo = image_url;
        await existingUser.save();
        console.log('User updated:', existingUser);
      } else {
        // Create user in database
        const newUser = new User({
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          photo: image_url,
        });

        await newUser.save();
        console.log('User created:', newUser);
      }
    } else if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      await connectDB();

      // Update existing user
      const user = await User.findOne({ clerkId: id });
      if (user) {
        user.email = email_addresses[0].email_address;
        user.firstName = first_name;
        user.lastName = last_name;
        user.photo = image_url;
        await user.save();
        console.log('User updated:', user);
      } else {
        // User doesn't exist, create them
        const newUser = new User({
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          photo: image_url,
        });
        await newUser.save();
        console.log('User created from update event:', newUser);
      }
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
