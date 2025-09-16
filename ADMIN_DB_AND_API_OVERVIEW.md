## QUILD Academy — Admin: Database and API Overview

This document summarizes the data model, relationships, fetching patterns, and API routes so you can implement admin features (create phases/weeks/lessons/courses, upload content, and manage metrics).

### Tech stack and connection
- **Database**: MongoDB via Mongoose
- **DB connector**: `src/lib/mongodb.ts` exports `connectDB()`; caches connection across hot reloads. Requires `MONGODB_URI`.
- **Auth**: Clerk. Protected via `src/middleware.ts` using `auth().protect()`.

### Entities (Mongoose Schemas)

1) `User` — `src/lib/models/user.model.ts`
- Fields: `clerkId` (required, unique), `email` (required, unique), `firstName`, `lastName`, `photo`
- Notes: Created lazily during progress calls if not present. Used for leaderboard join.

2) `Phase` — `src/lib/models/phase.model.ts`
- Fields: `name` (required), `description`, `order` (required), `isActive` (default true), `estimatedDuration` (days), `prerequisites` (Phase[]), `color` (default `#3B82F6`)
- Indexes: `{ isActive: 1, order: 1 }`, `{ order: 1 }`
- Admin: CRUD phases, set ordering, toggle `isActive`, set prerequisites and color.

3) `Week` — `src/lib/models/week.model.ts`
- Fields: `phaseId` (Phase ref, required), `weekNumber` (required), `title` (required), `description`, `isActive` (default true), `estimatedDuration` (days), `objectives` (string[])
- Indexes: `{ phaseId: 1, isActive: 1, weekNumber: 1 }`, `{ isActive: 1, weekNumber: 1 }`
- Admin: CRUD weeks per phase, manage `weekNumber`, toggle `isActive`.

4) `Lesson` — `src/lib/models/lesson.model.ts`
- Fields: `weekId` (Week ref, required), `dayNumber` (required), `title` (required), `description`, `type` (enum: video|workshop|project|reading|quiz|assignment), `content` (duration, videoUrl, readingUrl, instructions, resources[]), `points` (default 10), `isActive` (default true), `prerequisites` (Lesson[]), `order` (required)
- Indexes: `{ weekId: 1, isActive: 1, order: 1 }`, `{ isActive: 1, order: 1 }`
- Admin: CRUD lessons, set `type`, `content`, `order`, `points`, activate/deactivate.

5) `UserProgress` — `src/lib/models/progress.model.ts`
- Fields:
  - Ownership: `userId` (User ref, required)
  - Current pointers: `currentPhase`, `currentWeek`, `currentLesson`
  - Completions:
    - `completedPhases[{ phaseId, completedAt }]`
    - `completedWeeks[{ weekId, completedAt }]`
    - `completedLessons[{ lessonId, completedAt, timeSpent, pointsEarned }]`
  - Gamification: `totalPoints`, `currentStreak`, `longestStreak`, `lastActivityDate`, `totalTimeSpent`
  - `achievements[{ type, earnedAt, description }]`
  - Legacy: `completedResources: ObjectId[]`
- Indexes: `{ userId: 1 }`, `{ totalPoints: -1, currentStreak: -1 }`, `{ currentPhase: 1 }`, `{ currentWeek: 1 }`, `{ currentLesson: 1 }`
- Admin: view/adjust progress, points, streaks, achievements.

6) `Course` (legacy) — `src/lib/models/course.model.ts`
- Fields: `title` (required), `description`, `modules[]`
- `ModuleSchema` — `src/lib/models/module.model.ts`: `title` (required), `resources[]`
- `ResourceSchema` — `src/lib/models/resource.model.ts`: `title` (required), `type` (youtube|pdf|notion|link|meet), `url` (required)
- Admin: manage legacy course/modules/resources as needed.

### Relationships
- Phase 1—N Week via `week.phaseId`
- Week 1—N Lesson via `lesson.weekId`
- User 1—1 UserProgress via `userProgress.userId`
- Progress stores aggregates for completed lessons/weeks/phases + gamification

### API Routes and fetching
Protected by `src/middleware.ts` unless noted. All routes use `auth()` from Clerk and `connectDB()`.

- GET `/api/phases`
  - Returns active phases sorted by `order`.
  - Code: `src/app/api/phases/route.ts`

- GET `/api/weeks?phaseId=...`
  - Returns active weeks filtered by `phaseId` if provided; sorted by `weekNumber`.
  - Code: `src/app/api/weeks/route.ts`

- GET `/api/lessons?weekId=...|phaseId=...`
  - Returns active lessons by week. If `phaseId` is passed, it resolves weeks for the phase and queries lessons with `$in: weekIds`. Sorted by `order`.
  - Code: `src/app/api/lessons/route.ts`

- GET `/api/courses` (legacy)
- GET `/api/courses/[courseId]` (legacy)
  - Returns legacy courses / single course.
  - Code: `src/app/api/courses/route.ts`, `src/app/api/courses/[courseId]/route.ts`

- GET `/api/progress`
  - Ensures `User` exists for current Clerk user; initializes `UserProgress` if absent (first active phase/week/lesson), then returns the progress payload with populated current pointers.
  - Code: `src/app/api/progress/route.ts` (GET)

- POST `/api/progress`
  - Body: `{ lessonId, timeSpent, action: 'complete' }`
  - Updates `completedLessons`, `totalPoints`, streaks, computes week/phase completion, and advances `currentLesson`/`currentWeek`/`currentPhase`.
  - Code: `src/app/api/progress/route.ts` (POST)

- POST `/api/lesson/[lessonId]`
  - Body: `{ timeSpent, action: 'complete' }`
  - Same update logic as above but scoped by path param.
  - Code: `src/app/api/lesson/[lessonId]/route.ts`

- GET `/api/leaderboard?limit=N`
  - Aggregates `UserProgress` + `$lookup` from `users` collection to return ranking by `totalPoints` with user display fields.
  - Code: `src/app/api/leaderboard/route.ts`

- POST `/api/seed` (public)
  - Wipes collections and seeds demo users, phases, weeks, lessons, a sample progress, and a legacy course. Useful for local admin testing.
  - Code: `src/app/api/seed/route.ts` → `src/lib/seed.ts`

### Middleware protection
- `src/middleware.ts` protects: `/dashboard`, `/courses`, `/profile`, `/settings`, and API routes: `/api/progress`, `/api/courses`, `/api/leaderboard`, `/api/phases`, `/api/weeks`, `/api/lessons`.
- `/api/seed` is not protected by design.

### Query and update patterns used
- Lists filtered by `isActive` and sorted by logical fields (`order`, `weekNumber`).
- Progress completion computed by comparing counts of completed vs total lessons/weeks.
- Leaderboard uses MongoDB aggregation with `$lookup` and `$sort`.

### Admin feature coverage and gaps
- Already available (read): list phases, weeks, lessons, courses; get user progress; leaderboard metrics.
- To add (write):
  - `/api/phases` → `POST` create, `PATCH` update, `DELETE` deactivate/reactivate
  - `/api/weeks` → `POST` create, `PATCH` update, `DELETE` deactivate/reactivate
  - `/api/lessons` → `POST` create, `PATCH` update, `DELETE` deactivate/reactivate
  - `/api/progress/admin` → adjust points, reset progress, grant achievements
  - `/api/upload` → obtain signed URLs for media and store in `lesson.content`

### How to add content to a lesson

The `Lesson` schema supports a flexible `content` object and attached `resources`. Populate it according to the lesson `type`.

Allowed lesson `type` values: `video`, `workshop`, `project`, `reading`, `quiz`, `assignment`

Allowed resource `type` values: `youtube`, `pdf`, `notion`, `link`, `meet`

`content` fields:
- `duration`: number (minutes)
- `videoUrl`: string (URL to hosted video — YouTube or your storage)
- `readingUrl`: string (URL to article/Notion/doc)
- `instructions`: string (markdown/text)
- `resources`: array of `{ title, url, type }`

Suggested admin endpoints (to implement):
- `POST /api/lessons` → create a lesson with content
- `PATCH /api/lessons/:id` → update content or metadata

Create a video lesson with content and resources
```json
{
  "weekId": "<WEEK_OBJECT_ID>",
  "dayNumber": 1,
  "title": "React Components 101",
  "description": "Intro to components and JSX",
  "type": "video",
  "content": {
    "duration": 45,
    "videoUrl": "https://www.youtube.com/watch?v=DLX62G4lc44",
    "instructions": "Watch the video, then build two simple components.",
    "resources": [
      { "title": "Slides", "url": "https://example.com/slides.pdf", "type": "pdf" },
      { "title": "JSX Docs", "url": "https://react.dev/learn/writing-markup-with-jsx", "type": "link" }
    ]
  },
  "points": 10,
  "isActive": true,
  "order": 1
}
```

Create a reading lesson
```json
{
  "weekId": "<WEEK_OBJECT_ID>",
  "dayNumber": 2,
  "title": "State and Props (Reading)",
  "type": "reading",
  "content": {
    "duration": 30,
    "readingUrl": "https://react.dev/learn/state-a-components-memory",
    "instructions": "Read the article and take notes.",
    "resources": [
      { "title": "Notion Notes Template", "url": "https://notion.so/...", "type": "notion" }
    ]
  },
  "points": 10,
  "order": 2
}
```

Create a project/workshop lesson
```json
{
  "weekId": "<WEEK_OBJECT_ID>",
  "dayNumber": 3,
  "title": "Build a Todo App (Workshop)",
  "type": "workshop",
  "content": {
    "duration": 120,
    "instructions": "Follow the step-by-step to implement features A, B, C.",
    "resources": [
      { "title": "Starter Repo", "url": "https://github.com/org/repo", "type": "link" },
      { "title": "Kickoff Meet Link", "url": "https://meet.google.com/...", "type": "meet" }
    ]
  },
  "points": 25,
  "order": 3
}
```

Update content on an existing lesson
```json
{
  "content": {
    "duration": 50,
    "videoUrl": "https://cdn.your-bucket.com/lesson-videos/components-101.mp4",
    "instructions": "Updated brief + checklist",
    "resources": [
      { "title": "Cheat Sheet", "url": "https://example.com/cheatsheet.pdf", "type": "pdf" }
    ]
  },
  "points": 12
}
```

File uploads (videos/PDFs) strategy
- This codebase stores URLs only; it does not upload files.
- Implement `/api/upload` to return a signed URL from your storage (e.g., S3, GCS, UploadThing).
- Admin flow:
  1) Admin requests a signed URL for a file.
  2) Admin client PUTs the file to storage.
  3) Use the returned public URL as `content.videoUrl` or include in `resources`.

Validation tips (server-side in your new create/update routes)
- Ensure `type` is one of the allowed enums.
- For `type: video`, require `content.videoUrl`; for `type: reading`, require `content.readingUrl`.
- Require `order` within a week and keep `order` unique per `weekId`.
- Clamp `points` to a sensible range; default to 10 if omitted.

### Seeding for local development
- Call `POST /api/seed` to reset and populate demo data. See `src/lib/seed.ts` for dataset shape to mirror in admin forms.

### Environment
- Required: `MONGODB_URI`
- Clerk configured for authentication; routes expect `auth()` context.

### What each thing is for, how it works, why it exists, and what it supports

- Phases
  - What: Macro stages of the curriculum (e.g., Fundamentals → Advanced → Full Stack).
  - How: Ordered by `order`, toggled by `isActive`; weeks reference a phase via `phaseId`.
  - Why: Enables program-level sequencing, theming (via `color`), and progression checkpoints.
  - Supports: Reordering curriculum, gating content, reporting progress at phase level.

- Weeks
  - What: A time-boxed segment within a phase (Week 1, Week 2...).
  - How: Ordered by `weekNumber` scoped to a phase; lessons reference a week via `weekId`.
  - Why: Structures learning flow and expectations by week; simplifies scheduling & metrics.
  - Supports: Weekly objectives, completion detection, and advancing to next week.

- Lessons
  - What: The atomic learning unit (video/workshop/project/reading/quiz/assignment).
  - How: Ordered by `order` inside a week; content carries `duration`, media URLs, resources.
  - Why: Encapsulates teaching material and time/points for gamification.
  - Supports: Fine-grained completion tracking, prerequisites, content linking, points.

- UserProgress
  - What: A user’s current position and completion history with gamification stats.
  - How: Stores current pointers (`currentPhase/Week/Lesson`) and completed arrays; updates on lesson completion and computes streaks/points.
  - Why: Personalizes the learning path and powers metrics, streaks, and leaderboards.
  - Supports: Resume where you left off, award points, compute week/phase completion, achievements.

- Courses/Modules/Resources (legacy)
  - What: Earlier content structure for grouping resources under a course.
  - How: `Course` embeds `ModuleSchema`, which embeds `ResourceSchema` with typed links.
  - Why: Backward compatibility and potential supplemental learning tracks.
  - Supports: Listing reference materials, non-linear content browsing.

- Leaderboard
  - What: Ranking of users by `totalPoints` with display info.
  - How: Mongo aggregation on `UserProgress` + `$lookup` `User`; sorted by points; adds ranks.
  - Why: Motivation via friendly competition and progress visibility.
  - Supports: Top-N views, highlighting current user, time-spent and completion counts.

- Seed data
  - What: Demo dataset for local development and QA.
  - How: `POST /api/seed` clears collections and inserts phases/weeks/lessons/users/progress.
  - Why: Quickly bootstrap a working environment to test admin flows.
  - Supports: Stable fixture-like data, repeatable local testing.

- Auth & middleware
  - What: Access control via Clerk.
  - How: `src/middleware.ts` protects UI and API routes; `auth()` enforced inside handlers.
  - Why: Ensure only authenticated users access protected data and admin mutations.
  - Supports: Role-guarded expansion (you can add role checks inside handlers for admin-only CRUD).


