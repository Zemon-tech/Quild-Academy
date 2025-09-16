import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Calendar, 
  Clock, 
  Play, 
  BookOpen, 
  CheckCircle, 
  Circle,
  Video,
  Users,
  Code,
  Loader2
} from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user.model';
import UserProgress from '@/lib/models/progress.model';
import Phase from '@/lib/models/phase.model';
import Week from '@/lib/models/week.model';
import Lesson from '@/lib/models/lesson.model';
import { ensureDbUserFromClerk } from '@/lib/ensure-user';
import { Types } from 'mongoose';
import Link from 'next/link';

type Id = Types.ObjectId | string;

interface CompletedPhase {
  phaseId: Types.ObjectId;
  completedAt: Date;
  timeSpent: number;
  pointsEarned: number;
}

interface CompletedWeek {
  weekId: Types.ObjectId;
  completedAt: Date;
  timeSpent: number;
  pointsEarned: number;
}

interface CompletedLesson {
  lessonId: Types.ObjectId;
  completedAt: Date;
  timeSpent: number;
  pointsEarned: number;
}

interface PhaseLean {
  _id: Id;
  name: string;
  order: number;
  isActive: boolean;
}

interface WeekLean {
  _id: Id;
  phaseId: Id;
  weekNumber: number;
  isActive: boolean;
}

interface LessonLean {
  _id: Id;
  weekId: Id;
  dayNumber: number;
  title: string;
  type: string;
  content?: { duration?: number };
  order: number;
  isActive: boolean;
}

interface UserProgressLean {
  currentPhase?: { _id: Id; name: string; order: number } | null;
  currentWeek?: { _id: Id; weekNumber: number; phaseId: Id } | null;
  currentLesson?: { _id: Id; dayNumber: number; title: string; weekId: Id } | null;
  completedPhases?: CompletedPhase[];
  completedWeeks?: CompletedWeek[];
  completedLessons?: CompletedLesson[];
  totalTimeSpent?: number;
}

async function getScheduleData(): Promise<{
  phases: PhaseLean[];
  weeks: WeekLean[];
  lessons: LessonLean[];
  userProgress: UserProgressLean | null;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        phases: [],
        weeks: [],
        lessons: [],
        userProgress: null
      };
    }

    await connectDB();

    const user = await ensureDbUserFromClerk(userId);

    const [phases, weeks, lessons] = await Promise.all([
      Phase.find({ isActive: true }).sort({ order: 1 }).lean<PhaseLean[]>(),
      Week.find({ isActive: true }).sort({ weekNumber: 1 }).lean<WeekLean[]>(),
      Lesson.find({ isActive: true }).sort({ order: 1 }).lean<LessonLean[]>(),
    ]);

    let userProgress = await UserProgress.findOne({ userId: user._id })
      .populate('currentPhase', 'name order')
      .populate('currentWeek', 'weekNumber phaseId')
      .populate('currentLesson', 'dayNumber title weekId')
      .lean<UserProgressLean | null>();

    if (!userProgress) {
      const firstPhase = await Phase.findOne({ isActive: true }).sort({ order: 1 });
      const firstWeek = await Week.findOne({ phaseId: firstPhase?._id, isActive: true }).sort({ weekNumber: 1 });
      const firstLesson = await Lesson.findOne({ weekId: firstWeek?._id, isActive: true }).sort({ order: 1 });

      await new UserProgress({
        userId: user._id,
        currentPhase: firstPhase?._id,
        currentWeek: firstWeek?._id,
        currentLesson: firstLesson?._id,
        completedResources: [],
      }).save();

      userProgress = await UserProgress.findOne({ userId: user._id })
        .populate('currentPhase', 'name order')
        .populate('currentWeek', 'weekNumber phaseId')
        .populate('currentLesson', 'dayNumber title weekId')
        .lean<UserProgressLean | null>();
    }

    return {
      phases: phases,
      weeks: weeks,
      lessons: lessons,
      userProgress: userProgress
    };
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    return {
      phases: [],
      weeks: [],
      lessons: [],
      userProgress: null
    };
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="h-4 w-4" />;
    case 'workshop': return <Users className="h-4 w-4" />;
    case 'project': return <Code className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'current': return <Circle className="h-4 w-4 text-blue-600" />;
    default: return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

export const revalidate = 60; // cache server-rendered data for 60s
export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const { phases, weeks, lessons, userProgress } = await getScheduleData();

  if (phases.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="w-full space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Learning Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your progress through the structured learning path</p>
        </div>

        {/* Current Progress */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Current Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userProgress?.currentPhase?.name || 'Loading...'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Week {userProgress?.currentWeek?.weekNumber || 0} • Day {userProgress?.currentLesson?.dayNumber || 0}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                  In Progress
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{Math.round((userProgress?.totalTimeSpent || 0) / 60)} hours total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Path */}
        {(() => {
          const currentPhaseId = userProgress?.currentPhase?._id?.toString();
          const sortedPhases = [...phases].sort((a, b) => {
            const aCompleted = userProgress?.completedPhases?.some((cp: CompletedPhase) => cp.phaseId.toString() === a._id.toString());
            const bCompleted = userProgress?.completedPhases?.some((cp: CompletedPhase) => cp.phaseId.toString() === b._id.toString());
            if (aCompleted && !bCompleted) return 1;
            if (!aCompleted && bCompleted) return -1;
            return 0;
          });
          return (
            <Accordion type="single" collapsible defaultValue={currentPhaseId} className="space-y-2">
              {sortedPhases.map((phase, phaseIndex) => {
                const phaseWeeks = weeks.filter(week => week.phaseId.toString() === phase._id.toString());
                const isCurrentPhase = userProgress?.currentPhase?._id.toString() === phase._id.toString();
                const isCompletedPhase = userProgress?.completedPhases?.some(
                  (completedPhase: CompletedPhase) => completedPhase.phaseId.toString() === phase._id.toString()
                );

                return (
                  <AccordionItem key={phaseIndex} value={phase._id.toString()}>
                    <Card className={(isCurrentPhase ? 'border-blue-200 dark:border-blue-800 ' : '') + 'py-3 gap-3'}>
                      <CardHeader className="py-0 px-4">
                        <AccordionTrigger className="w-full px-4 py-2">
                          <CardTitle className="w-full flex items-center justify-between py-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                isCompletedPhase ? 'bg-green-500' :
                                isCurrentPhase ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`} />
                              <span>{phase.name}</span>
                            </div>
                            <Badge variant={
                              isCompletedPhase ? 'default' :
                              isCurrentPhase ? 'default' :
                              'secondary'
                            }>
                              {isCompletedPhase ? 'Completed' :
                              isCurrentPhase ? 'Current' :
                              'Upcoming'}
                            </Badge>
                          </CardTitle>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="px-4 pt-0 pb-4">
                          <div className="space-y-3">
                            {phaseWeeks.map((week, weekIndex) => {
                              const weekLessons = lessons.filter(lesson => lesson.weekId.toString() === week._id.toString());
                              const isCurrentWeek = userProgress?.currentWeek?._id.toString() === week._id.toString();
                              const isCompletedWeek = userProgress?.completedWeeks?.some(
                                (completedWeek: CompletedWeek) => completedWeek.weekId.toString() === week._id.toString()
                              );

                              return (
                                <div key={weekIndex} className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      Week {week.weekNumber}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {isCompletedWeek ? 'Completed' :
                                      isCurrentWeek ? 'Current' :
                                      'Upcoming'}
                                    </Badge>
                                  </div>
                                  <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {weekLessons.map((lesson, lessonIndex) => {
                                      const isCompletedLesson = userProgress?.completedLessons?.some(
                                        (completedLesson: CompletedLesson) => completedLesson.lessonId.toString() === lesson._id.toString()
                                      );
                                      const isCurrentLesson = userProgress?.currentLesson?._id.toString() === lesson._id.toString();

                                      return (
                                        <div key={lessonIndex} className={`p-2.5 rounded-lg border ${
                                          isCompletedLesson ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                          isCurrentLesson ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                          'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        }`}>
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center space-x-2 mb-1">
                                                {getStatusIcon(isCompletedLesson ? 'completed' : isCurrentLesson ? 'current' : 'upcoming')}
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                  Day {lesson.dayNumber}
                                                </span>
                                              </div>
                                              <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {lesson.title}
                                              </h5>
                                              <div className="flex items-center space-x-2 mt-1">
                                                {getTypeIcon(lesson.type)}
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  {lesson.type}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  {lesson.content?.duration || 0} min
                                                </span>
                                              </div>
                                            </div>
                                            <Button size="sm" className="ml-2" asChild>
                                              <Link href={`/lesson/${lesson._id}`}>
                                                <Play className="h-3 w-3 mr-1" />
                                                {isCurrentLesson ? 'Start' : 'Open'}
                                              </Link>
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>
          );
        })()}
      </div>
    </MainLayout>
  );
}
