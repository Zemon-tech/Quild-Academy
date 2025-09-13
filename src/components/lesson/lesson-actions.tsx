'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  CheckCircle, 
  ArrowLeft, 
  Loader2 
} from 'lucide-react';

interface NextLesson {
  _id: string;
  title: string;
}

interface LessonActionsProps {
  lessonId: string;
  isCompleted: boolean;
  nextLesson: NextLesson | null;
  lessonDuration: number;
}

export function LessonActions({ 
  lessonId, 
  isCompleted, 
  nextLesson, 
  lessonDuration 
}: LessonActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCompleteLesson = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/lesson/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete',
          timeSpent: lessonDuration
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompleted(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Refresh the page to update progress
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert(data.message || 'Failed to complete lesson');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Failed to complete lesson');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {!completed && (
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCompleteLesson}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Completing...' : 'Complete Lesson'}
          </Button>
        )}
        {completed && (
          <Button size="lg" variant="outline">
            <CheckCircle className="h-5 w-5 mr-2" />
            Review Lesson
          </Button>
        )}
        
        {showSuccess && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Lesson completed!</span>
          </div>
        )}
      </div>

      {nextLesson && (
        <Link href={`/lesson/${nextLesson._id}`}>
          <Button variant="outline" size="lg">
            Next Lesson
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </Button>
        </Link>
      )}
    </div>
  );
}
