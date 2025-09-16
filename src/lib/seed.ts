import connectDB from './mongodb';
import User from './models/user.model';
import Course from './models/course.model';
import Phase from './models/phase.model';
import Week from './models/week.model';
import Lesson from './models/lesson.model';
import UserProgress from './models/progress.model';

export async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Phase.deleteMany({});
    await Week.deleteMany({});
    await Lesson.deleteMany({});
    await UserProgress.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        clerkId: 'user_2example1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      {
        clerkId: 'user_2example2',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      {
        clerkId: 'user_2example3',
        email: 'alex@example.com',
        firstName: 'Alex',
        lastName: 'Chen',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      }
    ]);
    console.log('Created users:', users.length);

    // Create phases
    const phases = await Phase.create([
      {
        name: 'Phase 1: Fundamentals',
        description: 'Master the basics of web development',
        order: 1,
        estimatedDuration: 14,
        color: '#10B981'
      },
      {
        name: 'Phase 2: Advanced Concepts',
        description: 'Dive deep into modern web development',
        order: 2,
        estimatedDuration: 21,
        color: '#3B82F6'
      },
      {
        name: 'Phase 3: Full Stack',
        description: 'Build complete applications',
        order: 3,
        estimatedDuration: 28,
        color: '#8B5CF6'
      }
    ]);
    console.log('Created phases:', phases.length);

    // Create weeks for Phase 1
    const phase1Weeks = await Week.create([
      {
        phaseId: phases[0]._id,
        weekNumber: 1,
        title: 'HTML & CSS Basics',
        description: 'Learn the foundation of web development',
        estimatedDuration: 7,
        objectives: ['Master HTML structure', 'Understand CSS styling', 'Build responsive layouts']
      },
      {
        phaseId: phases[0]._id,
        weekNumber: 2,
        title: 'JavaScript Fundamentals',
        description: 'Programming basics with JavaScript',
        estimatedDuration: 7,
        objectives: ['Learn JavaScript syntax', 'Understand variables and functions', 'Work with DOM']
      }
    ]);

    // Create weeks for Phase 2
    const phase2Weeks = await Week.create([
      {
        phaseId: phases[1]._id,
        weekNumber: 1,
        title: 'React Introduction',
        description: 'Modern UI development with React',
        estimatedDuration: 7,
        objectives: ['Learn React components', 'Understand JSX', 'Build interactive UIs']
      },
      {
        phaseId: phases[1]._id,
        weekNumber: 2,
        title: 'React Hooks & State',
        description: 'Advanced React patterns',
        estimatedDuration: 7,
        objectives: ['Master useState and useEffect', 'Build custom hooks', 'Manage complex state']
      },
      {
        phaseId: phases[1]._id,
        weekNumber: 3,
        title: 'State Management',
        description: 'Managing application state',
        estimatedDuration: 7,
        objectives: ['Learn Context API', 'Understand Redux', 'Build scalable apps']
      }
    ]);

    // Create weeks for Phase 3
    const phase3Weeks = await Week.create([
      {
        phaseId: phases[2]._id,
        weekNumber: 1,
        title: 'Backend Development',
        description: 'Server-side development with Node.js',
        estimatedDuration: 7,
        objectives: ['Learn Node.js basics', 'Build REST APIs', 'Connect to databases']
      }
    ]);

    console.log('Created weeks:', phase1Weeks.length + phase2Weeks.length + phase3Weeks.length);

    // Create lessons for Phase 1, Week 1
    const phase1Week1Lessons = await Lesson.create([
      {
        weekId: phase1Weeks[0]._id,
        dayNumber: 1,
        title: 'HTML Structure & Elements',
        description: 'Learn the building blocks of HTML',
        type: 'video',
        content: {
          duration: 30,
          videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
          instructions: 'Watch the video and practice creating HTML documents'
        },
        points: 10,
        order: 1
      },
      {
        weekId: phase1Weeks[0]._id,
        dayNumber: 2,
        title: 'CSS Styling Basics',
        description: 'Make your HTML beautiful with CSS',
        type: 'video',
        content: {
          duration: 45,
          videoUrl: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
          instructions: 'Learn CSS selectors, properties, and values'
        },
        points: 10,
        order: 2
      },
      {
        weekId: phase1Weeks[0]._id,
        dayNumber: 3,
        title: 'CSS Layout with Flexbox',
        description: 'Master modern CSS layouts',
        type: 'workshop',
        content: {
          duration: 60,
          instructions: 'Build responsive layouts using Flexbox'
        },
        points: 15,
        order: 3
      },
      {
        weekId: phase1Weeks[0]._id,
        dayNumber: 4,
        title: 'Responsive Design',
        description: 'Make your sites work on all devices',
        type: 'video',
        content: {
          duration: 40,
          videoUrl: 'https://www.youtube.com/watch?v=srvUrASNj0s',
          instructions: 'Learn media queries and responsive design principles'
        },
        points: 10,
        order: 4
      },
      {
        weekId: phase1Weeks[0]._id,
        dayNumber: 5,
        title: 'Build a Personal Website',
        description: 'Apply everything you\'ve learned',
        type: 'project',
        content: {
          duration: 120,
          instructions: 'Create a complete personal website using HTML and CSS'
        },
        points: 25,
        order: 5
      }
    ]);

    // Create lessons for Phase 1, Week 2
    const phase1Week2Lessons = await Lesson.create([
      {
        weekId: phase1Weeks[1]._id,
        dayNumber: 1,
        title: 'JavaScript Variables & Functions',
        description: 'Learn the basics of JavaScript programming',
        type: 'video',
        content: {
          duration: 45,
          videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
          instructions: 'Understand variables, data types, and functions'
        },
        points: 10,
        order: 1
      },
      {
        weekId: phase1Weeks[1]._id,
        dayNumber: 2,
        title: 'DOM Manipulation',
        description: 'Make your websites interactive',
        type: 'workshop',
        content: {
          duration: 60,
          instructions: 'Learn to select and modify HTML elements with JavaScript'
        },
        points: 15,
        order: 2
      },
      {
        weekId: phase1Weeks[1]._id,
        dayNumber: 3,
        title: 'Event Handling',
        description: 'Respond to user interactions',
        type: 'video',
        content: {
          duration: 35,
          videoUrl: 'https://www.youtube.com/watch?v=XF1_MlZ5l6M',
          instructions: 'Learn to handle clicks, form submissions, and other events'
        },
        points: 10,
        order: 3
      },
      {
        weekId: phase1Weeks[1]._id,
        dayNumber: 4,
        title: 'Async JavaScript',
        description: 'Handle asynchronous operations',
        type: 'workshop',
        content: {
          duration: 75,
          instructions: 'Learn about callbacks, promises, and async/await'
        },
        points: 20,
        order: 4
      },
      {
        weekId: phase1Weeks[1]._id,
        dayNumber: 5,
        title: 'Interactive Portfolio',
        description: 'Build an interactive version of your portfolio',
        type: 'project',
        content: {
          duration: 150,
          instructions: 'Add JavaScript interactivity to your personal website'
        },
        points: 30,
        order: 5
      }
    ]);

    // Create lessons for Phase 2, Week 1
    const phase2Week1Lessons = await Lesson.create([
      {
        weekId: phase2Weeks[0]._id,
        dayNumber: 1,
        title: 'React Introduction',
        description: 'What is React and why use it?',
        type: 'video',
        content: {
          duration: 60,
          videoUrl: 'https://www.youtube.com/watch?v=DLX62G4lc44',
          instructions: 'Learn the fundamentals of React'
        },
        points: 10,
        order: 1
      },
      {
        weekId: phase2Weeks[0]._id,
        dayNumber: 2,
        title: 'JSX & Components',
        description: 'Building your first React components',
        type: 'workshop',
        content: {
          duration: 90,
          instructions: 'Learn JSX syntax and create functional components'
        },
        points: 15,
        order: 2
      },
      {
        weekId: phase2Weeks[0]._id,
        dayNumber: 3,
        title: 'Props & State',
        description: 'Making components dynamic',
        type: 'video',
        content: {
          duration: 50,
          videoUrl: 'https://www.youtube.com/watch?v=4pO-HcG2igk',
          instructions: 'Understand how to pass data between components'
        },
        points: 10,
        order: 3
      },
      {
        weekId: phase2Weeks[0]._id,
        dayNumber: 4,
        title: 'Event Handling in React',
        description: 'Making components interactive',
        type: 'workshop',
        content: {
          duration: 80,
          instructions: 'Learn to handle events in React components'
        },
        points: 15,
        order: 4
      },
      {
        weekId: phase2Weeks[0]._id,
        dayNumber: 5,
        title: 'Build a Todo App',
        description: 'Your first React application',
        type: 'project',
        content: {
          duration: 240,
          instructions: 'Create a complete todo application with React'
        },
        points: 40,
        order: 5
      }
    ]);

    // Create lessons for Phase 2, Week 2
    const phase2Week2Lessons = await Lesson.create([
      {
        weekId: phase2Weeks[1]._id,
        dayNumber: 1,
        title: 'React Hooks Introduction',
        description: 'Modern React with hooks',
        type: 'video',
        content: {
          duration: 55,
          videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
          instructions: 'Learn about the useState and useEffect hooks'
        },
        points: 10,
        order: 1
      },
      {
        weekId: phase2Weeks[1]._id,
        dayNumber: 2,
        title: 'useState Deep Dive',
        description: 'Mastering state management with hooks',
        type: 'workshop',
        content: {
          duration: 90,
          instructions: 'Practice using useState for complex state management'
        },
        points: 15,
        order: 2
      },
      {
        weekId: phase2Weeks[1]._id,
        dayNumber: 3,
        title: 'useEffect Patterns',
        description: 'Side effects and lifecycle in functional components',
        type: 'video',
        content: {
          duration: 60,
          videoUrl: 'https://www.youtube.com/watch?v=0ZJgIjI0Y7Y',
          instructions: 'Learn when and how to use useEffect'
        },
        points: 10,
        order: 3
      },
      {
        weekId: phase2Weeks[1]._id,
        dayNumber: 4,
        title: 'Custom Hooks',
        description: 'Reusable logic with custom hooks',
        type: 'workshop',
        content: {
          duration: 90,
          instructions: 'Create your own custom hooks for reusable logic'
        },
        points: 20,
        order: 4
      },
      {
        weekId: phase2Weeks[1]._id,
        dayNumber: 5,
        title: 'Weather App with Hooks',
        description: 'Build a weather application using hooks',
        type: 'project',
        content: {
          duration: 300,
          instructions: 'Create a weather app that fetches data and displays it using hooks'
        },
        points: 50,
        order: 5
      }
    ]);

    // Create lessons for Phase 2, Week 3
    const phase2Week3Lessons = await Lesson.create([
      {
        weekId: phase2Weeks[2]._id,
        dayNumber: 1,
        title: 'React Router',
        description: 'Navigation in React applications',
        type: 'video',
        content: {
          duration: 50,
          videoUrl: 'https://www.youtube.com/watch?v=59IXY5IDrBA',
          instructions: 'Learn to create multi-page React applications'
        },
        points: 10,
        order: 1
      },
      {
        weekId: phase2Weeks[2]._id,
        dayNumber: 2,
        title: 'State Management Concepts',
        description: 'When and why to use external state management',
        type: 'video',
        content: {
          duration: 60,
          videoUrl: 'https://www.youtube.com/watch?v=9boMnm5X9ak',
          instructions: 'Understand the need for state management libraries'
        },
        points: 10,
        order: 2
      },
      {
        weekId: phase2Weeks[2]._id,
        dayNumber: 3,
        title: 'Context API',
        description: 'Built-in state management with Context',
        type: 'workshop',
        content: {
          duration: 90,
          instructions: 'Learn to use React Context for global state'
        },
        points: 15,
        order: 3
      },
      {
        weekId: phase2Weeks[2]._id,
        dayNumber: 4,
        title: 'Redux Basics',
        description: 'Introduction to Redux state management',
        type: 'workshop',
        content: {
          duration: 100,
          instructions: 'Learn Redux concepts: store, actions, and reducers'
        },
        points: 20,
        order: 4
      },
      {
        weekId: phase2Weeks[2]._id,
        dayNumber: 5,
        title: 'React Hooks Deep Dive',
        description: 'Advanced hooks and patterns',
        type: 'video',
        content: {
          duration: 45,
          videoUrl: 'https://www.youtube.com/watch?v=6a0UXjHLS3w',
          instructions: 'Master advanced React hooks and patterns'
        },
        points: 10,
        order: 5
      }
    ]);

    // Create lessons for Phase 3, Week 1
    const phase3Week1Lessons = await Lesson.create([
      {
        weekId: phase3Weeks[0]._id,
        dayNumber: 1,
        title: 'Node.js Introduction',
        description: 'Server-side JavaScript with Node.js',
        type: 'video',
        content: {
          duration: 60,
          videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
          instructions: 'Learn the basics of Node.js and npm'
        },
        points: 10,
        order: 1
      },
      {
        weekId: phase3Weeks[0]._id,
        dayNumber: 2,
        title: 'Express.js Basics',
        description: 'Building web servers with Express',
        type: 'workshop',
        content: {
          duration: 90,
          instructions: 'Create REST APIs with Express.js'
        },
        points: 15,
        order: 2
      },
      {
        weekId: phase3Weeks[0]._id,
        dayNumber: 3,
        title: 'API Development',
        description: 'Design and build RESTful APIs',
        type: 'video',
        content: {
          duration: 70,
          videoUrl: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
          instructions: 'Learn API design principles and best practices'
        },
        points: 10,
        order: 3
      },
      {
        weekId: phase3Weeks[0]._id,
        dayNumber: 4,
        title: 'Database Integration',
        description: 'Connect your API to a database',
        type: 'workshop',
        content: {
          duration: 120,
          instructions: 'Learn to integrate MongoDB with your Express app'
        },
        points: 20,
        order: 4
      },
      {
        weekId: phase3Weeks[0]._id,
        dayNumber: 5,
        title: 'Project: REST API',
        description: 'Build a complete backend API',
        type: 'project',
        content: {
          duration: 360,
          instructions: 'Create a full-featured REST API with authentication'
        },
        points: 60,
        order: 5
      }
    ]);

    console.log('Created lessons:', 
      phase1Week1Lessons.length + phase1Week2Lessons.length + 
      phase2Week1Lessons.length + phase2Week2Lessons.length + 
      phase2Week3Lessons.length + phase3Week1Lessons.length
    );

    // Create sample user progress for demonstration
    const userProgress = await UserProgress.create([
      {
        userId: users[0]._id,
        currentPhase: phases[1]._id,
        currentWeek: phase2Weeks[2]._id,
        currentLesson: phase2Week3Lessons[4]._id,
        completedPhases: [{ phaseId: phases[0]._id, completedAt: new Date() }],
        completedWeeks: [
          { weekId: phase1Weeks[0]._id, completedAt: new Date() },
          { weekId: phase1Weeks[1]._id, completedAt: new Date() },
          { weekId: phase2Weeks[0]._id, completedAt: new Date() },
          { weekId: phase2Weeks[1]._id, completedAt: new Date() }
        ],
        completedLessons: [
          ...phase1Week1Lessons.map(lesson => ({ lessonId: lesson._id, completedAt: new Date(), timeSpent: 30, pointsEarned: lesson.points })),
          ...phase1Week2Lessons.map(lesson => ({ lessonId: lesson._id, completedAt: new Date(), timeSpent: 45, pointsEarned: lesson.points })),
          ...phase2Week1Lessons.map(lesson => ({ lessonId: lesson._id, completedAt: new Date(), timeSpent: 60, pointsEarned: lesson.points })),
          ...phase2Week2Lessons.map(lesson => ({ lessonId: lesson._id, completedAt: new Date(), timeSpent: 75, pointsEarned: lesson.points })),
          ...phase2Week3Lessons.slice(0, 4).map(lesson => ({ lessonId: lesson._id, completedAt: new Date(), timeSpent: 60, pointsEarned: lesson.points }))
        ],
        totalPoints: 400,
        currentStreak: 6,
        longestStreak: 12,
        totalTimeSpent: 1800,
        lastActivityDate: new Date()
      }
    ]);

    console.log('Created user progress:', userProgress.length);

    // Create legacy courses for backward compatibility
    const courses = await Course.create([
      {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        modules: [
          {
            title: 'HTML Basics',
            resources: [
              {
                title: 'HTML Introduction Video',
                type: 'youtube',
                url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU'
              },
              {
                title: 'HTML Cheat Sheet',
                type: 'pdf',
                url: 'https://web.stanford.edu/group/csp/cs21/htmlcheatsheet.pdf'
              }
            ]
          }
        ]
      }
    ]);
    console.log('Created legacy courses:', courses.length);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

