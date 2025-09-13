# Database Migration Guide

## Overview
This guide will help you migrate your existing database to the new learning structure with phases, weeks, and lessons.

## Prerequisites
- MongoDB database running
- Node.js and npm installed
- Environment variables configured

## Step 1: Environment Setup

Make sure your `.env.local` file contains:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Clerk Webhook Setup (Important!)

To enable automatic user creation, you need to set up a Clerk webhook:

1. **Go to your Clerk Dashboard**
2. **Navigate to Webhooks**
3. **Create a new webhook** with endpoint: `https://your-domain.com/api/webhook/clerk`
4. **Select events**: `user.created` and `user.updated`
5. **Copy the webhook secret** and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

**For local development**, you can use ngrok or similar tools to expose your local server:
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the ngrok URL in your Clerk webhook endpoint
# Example: https://abc123.ngrok.io/api/webhook/clerk
```

## Step 2: Database Migration

### Option A: Fresh Start (Recommended for Development)
If you want to start fresh with the new structure:

1. **Clear existing data** (optional):
   ```bash
   # Connect to your MongoDB and drop the database
   mongosh
   use your_database_name
   db.dropDatabase()
   ```

2. **Seed the database**:
   ```bash
   # Start the development server
   npm run dev
   
   # In another terminal, seed the database
   curl -X POST http://localhost:3001/api/seed
   ```

### Option B: Preserve Existing Data
If you want to keep existing users and courses:

1. **Backup your data**:
   ```bash
   mongodump --uri="your_mongodb_connection_string" --out=./backup
   ```

2. **Run the seed script** (it will add new data alongside existing):
   ```bash
   curl -X POST http://localhost:3001/api/seed
   ```

## Step 3: Verify Migration

1. **Check the database**:
   ```bash
   mongosh
   use your_database_name
   
   # Check collections
   show collections
   
   # Check phases
   db.phases.find().pretty()
   
   # Check weeks
   db.weeks.find().pretty()
   
   # Check lessons
   db.lessons.find().pretty()
   
   # Check user progress
   db.userprogresses.find().pretty()
   ```

2. **Test the application**:
   - Visit `http://localhost:3001`
   - Sign up/Sign in with Clerk
   - Check the dashboard for real data
   - Verify leaderboard shows users
   - Check schedule page shows learning path

## New Database Structure

### Collections Created:
- **phases**: Learning phases (Fundamentals, Advanced, Full Stack)
- **weeks**: Weekly learning units within phases
- **lessons**: Daily lessons with content and points
- **userprogresses**: Updated with new gamification fields
- **users**: Existing user data preserved
- **courses**: Legacy courses preserved for backward compatibility

### Key Features:
- **Gamification**: Points, streaks, achievements
- **Automatic Progression**: System moves users through phases/weeks/lessons
- **Real-time Leaderboard**: Live rankings with user stats
- **Structured Learning**: Day-wise progression through phases

## Troubleshooting

### Common Issues:

1. **Connection Error**:
   - Check MongoDB is running
   - Verify MONGODB_URI in .env.local
   - Ensure network access if using MongoDB Atlas

2. **Seed Fails**:
   - Check console for error messages
   - Verify all models are properly imported
   - Ensure database permissions

3. **No Data Shows**:
   - Check if seed was successful
   - Verify API routes are working
   - Check browser console for errors

### Reset Everything:
```bash
# Stop the server
# Clear database
mongosh
use your_database_name
db.dropDatabase()

# Restart and seed
npm run dev
curl -X POST http://localhost:3001/api/seed
```

## Next Steps

After successful migration:
1. Test all pages (Dashboard, Leaderboard, Schedule)
2. Create a test user account
3. Verify progress tracking works
4. Test lesson completion flow
5. Check leaderboard updates

## Support

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB connection
