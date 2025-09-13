import { MainLayout } from '@/components/layout/main-layout';
import { CourseCard } from '@/components/course/course-card';

// Mock data for now - will be replaced with API calls
const mockCourses = [
  {
    id: '1',
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of HTML, CSS, and JavaScript',
    progress: 65,
    totalModules: 8,
    completedModules: 5,
  },
  {
    id: '2',
    title: 'React Masterclass',
    description: 'Advanced React patterns and best practices',
    progress: 30,
    totalModules: 12,
    completedModules: 4,
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Build scalable server-side applications',
    progress: 0,
    totalModules: 10,
    completedModules: 0,
  },
  {
    id: '4',
    title: 'Machine Learning Basics',
    description: 'Introduction to ML concepts and Python',
    progress: 90,
    totalModules: 6,
    completedModules: 6,
  },
];

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="w-full space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
          <p className="text-gray-600 dark:text-gray-400">Continue your learning journey</p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
          {mockCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
