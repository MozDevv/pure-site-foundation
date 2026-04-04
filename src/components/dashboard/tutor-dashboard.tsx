import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  Upload,
  Edit,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ApiCourse {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  enrolledStudentIds: string[];
  tutorIds: string[];
  createdAt: string;
}

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
}

export function TutorDashboard() {
  // Get current user from localStorage
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const tutorName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
    : 'Tutor';

  // Fetch courses from backend
  const { data: allCourses, isLoading: coursesLoading } = useQuery<ApiCourse[]>(
    {
      queryKey: ['tutor-courses'],
      queryFn: () =>
        apiService.get(endpoints.getAllCourses).then((res) => res.data),
    }
  );

  // Filter courses assigned to this tutor
  const myCourses = useMemo(() => {
    if (!allCourses || !currentUser?.id) return allCourses || [];
    const assigned = allCourses.filter((c) =>
      c.tutorIds?.includes(currentUser.id)
    );
    // If no courses are explicitly assigned, show all (if tutor is the only tutor)
    return assigned.length > 0 ? assigned : allCourses;
  }, [allCourses, currentUser?.id]);

  // Fetch upcoming events
  const { data: events, isLoading: eventsLoading } = useQuery<ApiEvent[]>({
    queryKey: ['tutor-events'],
    queryFn: () =>
      apiService.get(endpoints.getUserEvents).then((res) => res.data),
  });

  // Fetch pending submissions - scoped to tutor's courses via assignmentId filter approach
  // The backend returns all submissions; we filter client-side by matching course assignments
  const { data: submissions, isLoading: submissionsLoading } = useQuery<
    ApiSubmission[]
  >({
    queryKey: ['tutor-submissions'],
    queryFn: () =>
      apiService.get(endpoints.getAllSubmissions).then((res) => res.data),
  });

  // Computed stats
  const totalStudents = useMemo(
    () =>
      myCourses.reduce(
        (acc, c) => acc + (c.enrolledStudentIds?.length || 0),
        0
      ),
    [myCourses]
  );

  const pendingSubmissions = useMemo(
    () =>
      submissions?.filter(
        (s) =>
          s.status?.toLowerCase() === 'submitted' ||
          s.status?.toLowerCase() === 'pending'
      ) || [],
    [submissions]
  );

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date();
    return events
      .filter((e) => new Date(e.startDate) > now)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(0, 5);
  }, [events]);

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

  const timeAgo = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return dateStr;
    }
  };

  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="visible">
      {/* Welcome Section */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 sm:p-6 lg:p-8 text-primary-foreground shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h2-sb mb-1 sm:mb-2">
              Welcome, {tutorName}!
            </h1>
            <p className="text-primary-foreground/80 text-sm sm:text-base lg:text-body">
              Manage your courses and engage with students
            </p>
          </div>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent-hover shadow-accent w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Course
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview - Real Data */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-primary-light border-primary/20 hover:shadow-primary transition-smooth hover:-translate-y-0.5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </p>
                {coursesLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    {myCourses.length}
                  </p>
                )}
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success-light border-success/20 hover:shadow-md transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                {coursesLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-success">
                    {totalStudents}
                  </p>
                )}
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent-light border-accent/20 hover:shadow-accent transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Events
                </p>
                {eventsLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-accent-foreground">
                    {upcomingEvents.length}
                  </p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning-light border-warning/20 hover:shadow-md transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Grades
                </p>
                {submissionsLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-warning">
                    {pendingSubmissions.length}
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={fadeUp}>
      <Tabs defaultValue="courses" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
          <TabsTrigger value="content">Content Upload</TabsTrigger>
        </TabsList>

        {/* My Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Courses
                  </CardTitle>
                  <CardDescription>
                    Manage and track your course performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coursesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : myCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No courses assigned yet
                      </p>
                    </div>
                  ) : (
                    myCourses.map((course) => (
                      <div
                        key={course.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-smooth bg-card"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {course.enrolledStudentIds?.length || 0}{' '}
                                students
                              </span>
                              {course.category && (
                                <Badge variant="outline">
                                  {course.category}
                                </Badge>
                              )}
                            </div>
                            {course.shortDescription && (
                              <p className="text-sm text-muted-foreground">
                                {course.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                          </Button>
                          <Button size="sm" variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            View Students
                          </Button>
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary-hover"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eventsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : upcomingEvents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No upcoming events
                    </p>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-primary">
                            {formatDate(event.startDate)}
                          </span>
                          <Badge variant="outline">
                            {formatTime(event.startDate)}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm mb-1">
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        )}
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
                  <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary-hover">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Content
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Students
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Course Enrollment
              </CardTitle>
              <CardDescription>
                View student enrollment across your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : myCourses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No courses available
                </p>
              ) : (
                <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Enrolled Students</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.title}
                        </TableCell>
                        <TableCell>
                          {course.category || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary text-primary-foreground">
                            {course.enrolledStudentIds?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(course.startDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Tab */}
        <TabsContent value="grading">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Pending Submissions
              </CardTitle>
              <CardDescription>
                Review and grade student assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submissionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : pendingSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No pending submissions to grade
                  </p>
                </div>
              ) : (
                pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-smooth bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {submission.studentName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {submission.assignmentTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {timeAgo(submission.submittedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary-hover"
                        >
                          Grade
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Upload Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Content Management
              </CardTitle>
              <CardDescription>
                Upload and manage course materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Upload Course Content
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add videos, PDFs, documents, and code snippets to your courses
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Add Code Snippet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </motion.div>
    </motion.div>
  );
}