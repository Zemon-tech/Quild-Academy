import connectDB from './mongodb';
import Course from './models/course.model';

const sampleCourses = [
  {
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build modern web applications.',
    modules: [
      {
        title: 'HTML Basics',
        resources: [
          {
            title: 'Introduction to HTML',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=example1',
          },
          {
            title: 'HTML Elements and Attributes',
            type: 'pdf',
            url: 'https://example.com/html-elements.pdf',
          },
          {
            title: 'HTML Forms',
            type: 'link',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form',
          },
        ],
      },
      {
        title: 'CSS Styling',
        resources: [
          {
            title: 'CSS Selectors',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=example2',
          },
          {
            title: 'CSS Layout with Flexbox',
            type: 'notion',
            url: 'https://notion.so/flexbox-guide',
          },
        ],
      },
      {
        title: 'JavaScript Fundamentals',
        resources: [
          {
            title: 'Variables and Data Types',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=example3',
          },
          {
            title: 'Functions and Scope',
            type: 'pdf',
            url: 'https://example.com/js-functions.pdf',
          },
          {
            title: 'Live Coding Session',
            type: 'meet',
            url: 'https://meet.google.com/example-session',
          },
        ],
      },
    ],
  },
  {
    title: 'React Masterclass',
    description: 'Advanced React patterns and best practices for building scalable applications.',
    modules: [
      {
        title: 'React Hooks Deep Dive',
        resources: [
          {
            title: 'useState and useEffect',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=react-hooks',
          },
          {
            title: 'Custom Hooks Pattern',
            type: 'pdf',
            url: 'https://example.com/custom-hooks.pdf',
          },
        ],
      },
      {
        title: 'State Management',
        resources: [
          {
            title: 'Context API vs Redux',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=state-management',
          },
          {
            title: 'Zustand State Management',
            type: 'notion',
            url: 'https://notion.so/zustand-guide',
          },
        ],
      },
    ],
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build scalable server-side applications with Node.js and Express.',
    modules: [
      {
        title: 'Express.js Fundamentals',
        resources: [
          {
            title: 'Setting up Express Server',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=express-setup',
          },
          {
            title: 'Middleware in Express',
            type: 'pdf',
            url: 'https://example.com/express-middleware.pdf',
          },
        ],
      },
      {
        title: 'Database Integration',
        resources: [
          {
            title: 'MongoDB with Mongoose',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=mongodb-mongoose',
          },
          {
            title: 'Database Design Patterns',
            type: 'notion',
            url: 'https://notion.so/database-patterns',
          },
        ],
      },
    ],
  },
  {
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning concepts and Python implementation.',
    modules: [
      {
        title: 'Python for Data Science',
        resources: [
          {
            title: 'NumPy and Pandas',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=numpy-pandas',
          },
          {
            title: 'Data Visualization with Matplotlib',
            type: 'pdf',
            url: 'https://example.com/matplotlib-guide.pdf',
          },
        ],
      },
      {
        title: 'Machine Learning Algorithms',
        resources: [
          {
            title: 'Linear Regression',
            type: 'youtube',
            url: 'https://youtube.com/watch?v=linear-regression',
          },
          {
            title: 'Classification Algorithms',
            type: 'notion',
            url: 'https://notion.so/classification-algorithms',
          },
        ],
      },
    ],
  },
];

export async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing courses
    await Course.deleteMany({});
    
    // Insert sample courses
    await Course.insertMany(sampleCourses);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
