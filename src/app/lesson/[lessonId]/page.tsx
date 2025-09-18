import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Video,
  FileText,
  Users,
  Code,
  ExternalLink,
  Loader2,
  Trophy,
  Flame
} from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';
import UserProgress from '@/lib/models/progress.model';
import Lesson from '@/lib/models/lesson.model';
import Week from '@/lib/models/week.model';
import Phase from '@/lib/models/phase.model';
import Link from 'next/link';
import { LessonActions } from '@/components/lesson/lesson-actions';
import { Types } from 'mongoose';

interface CompletedLesson {
  lessonId: Types.ObjectId;
  completedAt: Date;
  timeSpent: number;
  pointsEarned: number;
}

interface Resource {
  title: string;
  url: string;
  type: string;
  _id?: Types.ObjectId;
}

interface WeekData {
  _id: Types.ObjectId;
  weekNumber: number;
  phaseId: PhaseData;
}

interface PhaseData {
  _id: Types.ObjectId;
  name: string;
  order: number;
}

async function getLessonData(lessonId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        lesson: null,
        userProgress: null,
        isCompleted: false,
        nextLesson: null
      };
    }

    await connectDB();

    // Find user by clerkId, create if doesn't exist
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.log('User not found, creating new user for clerkId:', userId);
      
      user = new User({
        clerkId: userId,
        email: 'temp@example.com',
        firstName: 'User',
        lastName: 'Name',
        photo: '',
      });
      await user.save();
      console.log('Created new user:', user);
    }

    // Get lesson with populated data
    const lesson = await Lesson.findById(lessonId)
      .populate('weekId')
      .populate({
        path: 'weekId',
        populate: {
          path: 'phaseId'
        }
      });

    if (!lesson) {
      return {
        lesson: null,
        userProgress: null,
        isCompleted: false,
        nextLesson: null
      };
    }

    // Get user progress
    let userProgress = await UserProgress.findOne({ userId: user._id })
      .populate('currentPhase')
      .populate('currentWeek')
      .populate('currentLesson');

    if (!userProgress) {
      const firstPhase = await Phase.findOne({ isActive: true }).sort({ order: 1 });
      const firstWeek = await Week.findOne({ phaseId: firstPhase?._id, isActive: true }).sort({ weekNumber: 1 });
      const firstLesson = await Lesson.findOne({ weekId: firstWeek?._id, isActive: true }).sort({ order: 1 });

      userProgress = new UserProgress({
        userId: user._id,
        currentPhase: firstPhase?._id,
        currentWeek: firstWeek?._id,
        currentLesson: firstLesson?._id,
        completedResources: [],
      });
      await userProgress.save();

      userProgress = await UserProgress.findOne({ userId: user._id })
        .populate('currentPhase')
        .populate('currentWeek')
        .populate('currentLesson');
    }

    // Check if lesson is completed
    const isCompleted = userProgress.completedLessons.some(
      (completed: CompletedLesson) => completed.lessonId.toString() === lessonId
    );

    // Get next lesson
    const nextLesson = await Lesson.findOne({
      weekId: lesson.weekId._id,
      order: { $gt: lesson.order },
      isActive: true
    }).sort({ order: 1 });

    return {
      lesson,
      userProgress,
      isCompleted,
      nextLesson
    };
  } catch (error) {
    console.error('Error fetching lesson data:', error);
    return {
      lesson: null,
      userProgress: null,
      isCompleted: false,
      nextLesson: null
    };
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="h-4 w-4" />;
    case 'workshop': return <Users className="h-4 w-4" />;
    case 'coding': return <Code className="h-4 w-4" />;
    case 'reading': return <FileText className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'workshop': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'coding': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'reading': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, userProgress, isCompleted, nextLesson } = await getLessonData(lessonId);

  if (!lesson) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Lesson not found</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const week = lesson.weekId as WeekData;
  const phase = week.phaseId as PhaseData;
  const nextLessonForClient = nextLesson
    ? {
        _id: nextLesson._id.toString(),
        title: nextLesson.title as string,
      }
    : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/schedule">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schedule
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {lesson.title}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {phase.name}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Week {week.weekNumber}
                </Badge>
                <Badge className={getTypeColor(lesson.type)}>
                  {getTypeIcon(lesson.type)}
                  <span className="ml-1 capitalize">{lesson.type}</span>
                </Badge>
              </div>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Lesson Info */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Duration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{lesson.content?.duration || lesson.duration || 0} minutes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{lesson.points}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Points to earn</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flame className="h-5 w-5" />
                <span>Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userProgress?.currentStreak || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>About This Lesson</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {lesson.description}
            </p>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Learning Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lesson.content?.resources && lesson.content.resources.length > 0 ? (
                lesson.content.resources.map((resource: Resource, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(resource.type)}
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {resource.type} • {lesson.content?.duration || lesson.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={userProgress?.completedResources?.includes(resource._id) || false}
                        disabled
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No resources available for this lesson</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <LessonActions 
          lessonId={lessonId}
          isCompleted={isCompleted}
          nextLesson={nextLessonForClient}
          lessonDuration={lesson.content?.duration || lesson.duration || 0}
        />

        {/* Progress Indicator */}
        {userProgress && (
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round((userProgress.completedLessons.length / 30) * 100)}%</span>
                  </div>
                  <Progress value={(userProgress.completedLessons.length / 30) * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userProgress.totalPoints}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{userProgress.currentStreak}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

