import { MainLayout } from '@/components/layout/main-layout';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Search Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">Find the perfect course for your learning journey</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses, topics, or instructors..."
            className="pl-10 h-12 text-lg"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'JavaScript', 'Python', 'Machine Learning', 'Web Development', 'Data Science'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Searches</h2>
          <div className="space-y-2">
            {['Advanced React Patterns', 'Node.js Backend', 'TypeScript Fundamentals'].map((search) => (
              <div
                key={search}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">{search}</span>
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
