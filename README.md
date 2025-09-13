# Quild Academy

A Progressive Web App (PWA) designed to be an all-in-one learning hub for developers. The platform hosts and organizes training content for various tech fields like web development, AI/ML, DevOps, and data science.

## Features

- **User Authentication**: Secure authentication using Clerk
- **Course Management**: Organize courses into modules and resources
- **Progress Tracking**: Track completion of individual resources
- **Responsive Design**: Modern UI built with ShadCN/UI and Tailwind CSS
- **PWA Support**: Installable as a Progressive Web App
- **Real-time Updates**: Live progress tracking and course updates

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Clerk
- **UI Components**: ShadCN/UI
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quild-academy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# MongoDB
MONGODB_URI=your_mongodb_connection_string_here

# Clerk Webhook
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
```

4. Set up Clerk:
   - Create a new application in your [Clerk Dashboard](https://dashboard.clerk.com)
   - Get your publishable key and secret key
   - Set up webhooks for user creation (optional but recommended)

5. Set up MongoDB:
   - Create a MongoDB database (local or cloud)
   - Get your connection string
   - Update the `MONGODB_URI` in your `.env.local`

6. Seed the database (optional):
```bash
curl -X POST http://localhost:3000/api/seed
```

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── courses/           # Course pages
│   ├── sign-in/           # Authentication pages
│   └── sign-up/
├── components/            # React components
│   ├── ui/               # ShadCN/UI components
│   ├── layout/           # Layout components
│   └── course/           # Course-related components
├── lib/                  # Utility functions and configurations
│   ├── models/           # MongoDB models
│   ├── mongodb.ts        # Database connection
│   └── seed.ts           # Database seeding
└── types/                # TypeScript type definitions
```

## API Endpoints

- `GET /api/courses` - Fetch all courses
- `GET /api/courses/[courseId]` - Fetch specific course
- `GET /api/progress?courseId=...` - Get user progress for a course
- `POST /api/progress` - Update user progress
- `POST /api/webhook/clerk` - Clerk webhook for user creation
- `POST /api/seed` - Seed database with sample data

## Database Schema

### User Model
- `clerkId`: Unique Clerk user ID
- `email`: User email
- `firstName`: User's first name
- `lastName`: User's last name
- `photo`: User profile photo URL

### Course Model
- `title`: Course title
- `description`: Course description
- `modules`: Array of module objects

### Module Schema
- `title`: Module title
- `resources`: Array of resource objects

### Resource Schema
- `title`: Resource title
- `type`: Resource type (youtube, pdf, notion, link, meet)
- `url`: Resource URL

### UserProgress Model
- `userId`: Reference to User
- `courseId`: Reference to Course
- `completedResources`: Array of completed resource IDs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.