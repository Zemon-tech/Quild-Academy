'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalModules: number;
  completedModules: number;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base md:text-lg text-gray-900 dark:text-white line-clamp-2">{course.title}</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{course.description}</CardDescription>
          </div>
          <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-500 flex-shrink-0 ml-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-xs md:text-sm text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
        
        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
          <span>
            {course.completedModules} of {course.totalModules} modules completed
          </span>
        </div>
        
        <Button asChild className="w-full text-sm">
          <Link href={`/courses/${course.id}`}>
            <Play className="mr-2 h-4 w-4" />
            Continue
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
