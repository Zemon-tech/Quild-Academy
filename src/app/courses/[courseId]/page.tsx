import { MainLayout } from '@/components/layout/main-layout';
import { CourseModules } from '@/components/course/course-modules';

// Mock data for now - will be replaced with API calls
const mockCourse = {
  id: '1',
  title: 'Web Development Fundamentals',
  description: 'Learn the basics of HTML, CSS, and JavaScript to build modern web applications.',
  modules: [
    {
      id: '1',
      title: 'HTML Basics',
      resources: [
        {
          id: '1',
          title: 'Introduction to HTML',
          type: 'youtube' as const,
          url: 'https://youtube.com/watch?v=example1',
        },
        {
          id: '2',
          title: 'HTML Elements and Attributes',
          type: 'pdf' as const,
          url: 'https://example.com/html-elements.pdf',
        },
        {
          id: '3',
          title: 'HTML Forms',
          type: 'link' as const,
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form',
        },
      ],
    },
    {
      id: '2',
      title: 'CSS Styling',
      resources: [
        {
          id: '4',
          title: 'CSS Selectors',
          type: 'youtube' as const,
          url: 'https://youtube.com/watch?v=example2',
        },
        {
          id: '5',
          title: 'CSS Layout with Flexbox',
          type: 'notion' as const,
          url: 'https://notion.so/flexbox-guide',
        },
      ],
    },
    {
      id: '3',
      title: 'JavaScript Fundamentals',
      resources: [
        {
          id: '6',
          title: 'Variables and Data Types',
          type: 'youtube' as const,
          url: 'https://youtube.com/watch?v=example3',
        },
        {
          id: '7',
          title: 'Functions and Scope',
          type: 'pdf' as const,
          url: 'https://example.com/js-functions.pdf',
        },
        {
          id: '8',
          title: 'Live Coding Session',
          type: 'meet' as const,
          url: 'https://meet.google.com/example-session',
        },
      ],
    },
  ],
};

interface CourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { courseId } = await params;
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{mockCourse.title}</h1>
          <p className="text-gray-600 mt-2">{mockCourse.description}</p>
        </div>

        <CourseModules 
          courseId={courseId}
          modules={mockCourse.modules}
        />
      </div>
    </MainLayout>
  );
}
