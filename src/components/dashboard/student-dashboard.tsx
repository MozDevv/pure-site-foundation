import {
  BookOpen,
  Clock,
  Award,
  MessageCircle,
  TrendingUp,
  Calendar,
  Video,
  Code,
  FileText,
  GraduationCap,
  ArrowUpRight,
  Target,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ───────── Backend response shape ───────── */
interface StudentDashboardResponse {
  overallStats: {
    overallProgress: number;
    avgScore: number;
    studyHours: number;
    completedAssignments: number;
    totalAssignments: number;
  };
  courseProgress: {
    id: string;
    title: string;
    progress: number;
    lessons: number;
    instructor: string;
    status: string;
    avgScore: number;
    lastActivity: string;
  }[];
}

/* ───────── Count-up animation hook ───────── */
function useCountUp(end: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

/* ───────── Framer Motion variants ───────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.2 } },
};

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  type?: string;
}

interface ApiSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;

  // Fetch dashboard data from backend
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useQuery<StudentDashboardResponse>({
    queryKey: ['studentDashboard'],
    queryFn: () =>
      apiService.get(endpoints.getStudentDashboard).then((res) => res.data),
  });

  // D1: Fetch real upcoming events
  const { data: eventsData } = useQuery<ApiEvent[]>({
    queryKey: ['student-events'],
    queryFn: () =>
      apiService.get(endpoints.getUserEvents).then((res) => res.data),
  });

  // D2: Fetch own graded submissions for feedback (studentId scoped so backend only returns ours)
  const { data: submissionsData } = useQuery<ApiSubmission[]>({
    queryKey: ['student-submissions-graded'],
    queryFn: () =>
      apiService
        .get(`${endpoints.getAllSubmissions}${currentUser?.id ? `?studentId=${currentUser.id}` : ''}`)
        .then((res) => res.data),
    enabled: !!currentUser?.id,
  });

  // Compute upcoming events (future events only, sorted)
  const upcomingEvents = useMemo(() => {
    if (!eventsData) return [];
    const now = new Date();
    return eventsData
      .filter((e) => new Date(e.startDate) > now)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(0, 5);
  }, [eventsData]);

  // Compute recent feedback from graded submissions
  const recentFeedback = useMemo(() => {
    if (!submissionsData) return [];
    return submissionsData
      .filter((s) => s.status?.toLowerCase() === 'graded' && s.feedback)
      .sort((a, b) => {
        const dateA = a.gradedAt || a.submittedAt || '';
        const dateB = b.gradedAt || b.submittedAt || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }, [submissionsData]);

  // Extract stats & courses with correct backend property names (must be before early returns for hooks below)
  const stats = dashboardData?.overallStats || {
    overallProgress: 0,
    avgScore: 0,
    studyHours: 0,
    completedAssignments: 0,
    totalAssignments: 0,
  };
  const courses = dashboardData?.courseProgress || [];

  /* Count-up values — MUST be called before any conditional return (Rules of Hooks) */
  const animProgress = useCountUp(Math.round(stats.overallProgress));
  const animAvgScore = useCountUp(Math.round(stats.avgScore));
  const animStudyHours = useCountUp(stats.studyHours);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard data:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="rounded-xl bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h2-sb">Welcome back, {currentUser?.firstName || 'Student'}!</h1>
            <p className="text-primary-foreground/80 mt-1 text-body">Continue your learning journey — keep up the great progress!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span>{stats.overallProgress.toFixed(0)}% complete</span>
            </div>
            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>{courses.length} courses</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="bg-primary-light border-primary/20 hover:shadow-primary transition-smooth card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Progress
                </p>
                <p className="text-2xl font-bold text-primary">
                  {animProgress}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="bg-success-light border-success/20 hover:shadow-md transition-smooth card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Score
                </p>
                <p className="text-2xl font-bold text-success">
                  {animAvgScore}%
                </p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="bg-accent-light border-accent/20 hover:shadow-accent transition-smooth card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Study Hours
                </p>
                <p className="text-2xl font-bold text-accent-foreground">
                  {animStudyHours}
                </p>
              </div>
              <Clock className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="bg-secondary-light border-secondary/20 hover:shadow-secondary transition-smooth card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assignments
                </p>
                <p className="text-2xl font-bold text-secondary">
                  {stats.completedAssignments}/{stats.totalAssignments}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Courses
              </CardTitle>
              <CardDescription>
                Track your progress across all enrolled courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No courses enrolled yet. Start your learning journey today!
                  </p>
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-smooth bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Instructor: {course.instructor}
                        </p>
                        <div className="flex gap-2 mb-2">
                          <Badge
                            variant={
                              course.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {course.status === 'completed'
                              ? 'Completed'
                              : 'In Progress'}
                          </Badge>
                          {course.avgScore > 0 && (
                            <Badge variant="outline">
                              Avg: {course.avgScore.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last activity: {course.lastActivity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {course.progress.toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {course.lessons || 0} lessons
                        </div>
                      </div>
                    </div>

                    <Progress value={course.progress} className="mb-3" />

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last active: </span>
                        <span className="font-medium">{course.lastActivity || '—'}</span>
                      </div>
                      <Button
                        size="sm"
                        variant={
                          course.status === 'completed' ? 'outline' : 'default'
                        }
                        disabled={course.status === 'completed'}
                        className="bg-primary text-primary-foreground hover:bg-primary-hover"
                      >
                        {course.status === 'completed'
                          ? 'View Certificate'
                          : 'Continue'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Mentor Feedback from real graded submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Recent Feedback
              </CardTitle>
              <CardDescription>
                Latest feedback from your graded submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentFeedback.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No graded submissions yet
                </p>
              ) : (
                recentFeedback.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-4 border-primary pl-4 py-3 bg-muted/50 rounded-r"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {item.assignmentTitle}
                        </p>
                        {item.gradedBy && (
                          <p className="text-xs text-muted-foreground">
                            Graded by: {item.gradedBy}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.grade != null && (
                          <Badge className="bg-primary text-primary-foreground">
                            {item.grade}%
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.gradedAt || item.submittedAt || '')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{item.feedback}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events - Real API data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-smooth"
                  >
                    <div className="text-center">
                      <div className="text-sm font-semibold text-primary">
                        {formatDate(event.startDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(event.startDate)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      {event.type && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {event.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  const role = currentUser?.role?.toLowerCase() || 'student';
                  navigate(`/${role}/timetable`);
                }}
              >
                <Video className="mr-2 h-4 w-4" />
                Join Live Session
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  const role = currentUser?.role?.toLowerCase() || 'student';
                  navigate(`/${role}/innovation`);
                }}
              >
                <Code className="mr-2 h-4 w-4" />
                Innovation Hub
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  const role = currentUser?.role?.toLowerCase() || 'student';
                  navigate(`/${role}/assessments/assignments`);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                My Assignments
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  const role = currentUser?.role?.toLowerCase() || 'student';
                  navigate(`/${role}/chat`);
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
