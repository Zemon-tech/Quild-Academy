import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Play, 
  BookOpen, 
  CheckCircle, 
  Circle,
  Video,
  FileText,
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
import { Types } from 'mongoose';

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

async function getScheduleData() {
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

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return {
        phases: [],
        weeks: [],
        lessons: [],
        userProgress: null
      };
    }

    const phases = await Phase.find({ isActive: true }).sort({ order: 1 });
    const weeks = await Week.find({ isActive: true }).sort({ weekNumber: 1 });
    const lessons = await Lesson.find({ isActive: true }).sort({ order: 1 });

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
        <div className="space-y-6">
          {phases.map((phase, phaseIndex) => {
            const phaseWeeks = weeks.filter(week => week.phaseId.toString() === phase._id.toString());
            const isCurrentPhase = userProgress?.currentPhase?._id.toString() === phase._id.toString();
            const isCompletedPhase = userProgress?.completedPhases?.some(
              (completedPhase: CompletedPhase) => completedPhase.phaseId.toString() === phase._id.toString()
            );

            return (
              <Card key={phaseIndex} className={isCurrentPhase ? 'border-blue-200 dark:border-blue-800' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {phaseWeeks.map((week, weekIndex) => {
                      const weekLessons = lessons.filter(lesson => lesson.weekId.toString() === week._id.toString());
                      const isCurrentWeek = userProgress?.currentWeek?._id.toString() === week._id.toString();
                      const isCompletedWeek = userProgress?.completedWeeks?.some(
                        (completedWeek: CompletedWeek) => completedWeek.weekId.toString() === week._id.toString()
                      );

                      return (
                        <div key={weekIndex} className="space-y-3">
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
                                <div key={lessonIndex} className={`p-3 rounded-lg border ${
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
                                    {isCurrentLesson && (
                                      <Button size="sm" className="ml-2" asChild>
                                        <a href={`/lesson/${lesson._id}`}>
                                          <Play className="h-3 w-3 mr-1" />
                                          Start
                                        </a>
                                      </Button>
                                    )}
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
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
