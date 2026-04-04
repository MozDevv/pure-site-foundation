import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Users,
  BookOpen,
  User,
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { apiService as api, endpoints } from '@/lib/api';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

const COLORS = [
  'hsl(142, 76%, 36%)',
  'hsl(199, 89%, 48%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(215, 16%, 47%)',
];

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export default function GradesPerformance() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const userRole = (currentUser?.role || 'Student').toLowerCase();
  const isStudent = userRole === 'student';

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    isStudent && currentUser?.id ? currentUser.id : ''
  );
  const [activeTab, setActiveTab] = useState<string>(isStudent ? 'student' : 'course');
  const { toast } = useToast();

  // Fetch courses for selection
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiService.getCourses(),
  });

  // Fetch users/students for selection — only for non-student roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await api.get(endpoints.getAllUsers);
      return response.data?.data as UserData[];
    },
    enabled: !isStudent,
  });

  // Filter to get only students (users with Student role)
  const students = users?.filter((u: UserData) => u.role?.toLowerCase() === 'student') || [];

  // Fetch course analytics only when a course is selected
  const { data: courseAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['courseAnalytics', selectedCourseId],
    queryFn: () => apiService.getCourseAnalytics(selectedCourseId),
    enabled: !!selectedCourseId,
  });

  // Fetch student performance only when a student is selected
  const { data: studentPerformance, isLoading: studentsLoading } = useQuery({
    queryKey: ['studentPerformance', selectedStudentId],
    queryFn: () => apiService.getStudentPerformance(selectedStudentId),
    enabled: !!selectedStudentId,
  });

  const handleExport = async () => {
    try {
      const csvData = await apiService.exportGrades({});
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grades_export.csv';
      a.click();
      toast({
        title: 'Export successful',
        description: 'Grades have been exported to CSV.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the grades.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Grades & Performance
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track student progress and course analytics
          </p>
        </div>
        {!isStudent && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Grades
          </Button>
        )}
      </div>

      {/* Tabs for Course Analytics vs Student Performance */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {!isStudent && (
            <TabsTrigger value="course" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Course Analytics
            </TabsTrigger>
          )}
          <TabsTrigger value="student" className="gap-2">
            <User className="h-4 w-4" />
            {isStudent ? 'My Performance' : 'Student Performance'}
          </TabsTrigger>
        </TabsList>

        {/* Course Analytics Tab */}
        <TabsContent value="course" className="space-y-6 mt-6">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Course</CardTitle>
              <CardDescription>
                Choose a course to view its analytics and grade distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading courses...
                    </SelectItem>
                  ) : courses?.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No courses available
                    </SelectItem>
                  ) : (
                    courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Course Analytics Content */}
          {!selectedCourseId ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  No Course Selected
                </h3>
                <p className="text-muted-foreground mt-1">
                  Please select a course above to view its analytics
                </p>
              </CardContent>
            </Card>
          ) : analyticsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </div>
            </div>
          ) : (
            <>
              {/* Course Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Average Assignment Grade"
                  value={
                    courseAnalytics?.averageAssignmentGrade !== null
                      ? `${Math.round(courseAnalytics.averageAssignmentGrade)}%`
                      : 'N/A'
                  }
                  icon={TrendingUp}
                />
                <StatCard
                  title="Total Students"
                  value={courseAnalytics?.totalStudents || 0}
                  icon={Users}
                />
                <StatCard
                  title="Completion Rate"
                  value={`${Math.round(courseAnalytics?.completionRate || 0)}%`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Difficulty"
                  value={courseAnalytics?.difficulty || 'N/A'}
                  icon={BookOpen}
                />
              </div>

              {/* Additional Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Assignments"
                  value={courseAnalytics?.assignments || 0}
                  icon={BookOpen}
                />
                <StatCard
                  title="Quizzes"
                  value={courseAnalytics?.quizzes || 0}
                  icon={BookOpen}
                />
                <StatCard
                  title="Submissions"
                  value={`${courseAnalytics?.gradedSubmissions || 0}/${
                    courseAnalytics?.submissions || 0
                  }`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Average Quiz Score"
                  value={
                    courseAnalytics?.averageQuizScore !== null
                      ? `${Math.round(courseAnalytics.averageQuizScore)}%`
                      : 'N/A'
                  }
                  icon={TrendingUp}
                />
              </div>

              {/* Detailed Metrics */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Submissions Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Submissions Overview</CardTitle>
                    <CardDescription>
                      Assignment and quiz submission metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Graded Submissions
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {courseAnalytics?.gradedSubmissions || 0} /{' '}
                            {courseAnalytics?.submissions || 0}
                          </p>
                        </div>
                        <Progress
                          value={
                            courseAnalytics?.submissions
                              ? (courseAnalytics.gradedSubmissions /
                                  courseAnalytics.submissions) *
                                100
                              : 0
                          }
                          className="w-20 sm:w-32 h-2"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Quiz Attempts
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {courseAnalytics?.completedQuizAttempts || 0} /{' '}
                            {courseAnalytics?.quizAttempts || 0}
                          </p>
                        </div>
                        <Progress
                          value={
                            courseAnalytics?.quizAttempts
                              ? (courseAnalytics.completedQuizAttempts /
                                  courseAnalytics.quizAttempts) *
                                100
                              : 0
                          }
                          className="w-20 sm:w-32 h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>Performance breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="p-4 rounded-lg border border-border bg-card">
                        <p className="text-sm text-muted-foreground">
                          Average Assignment Grade
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {courseAnalytics?.averageAssignmentGrade !== null
                            ? `${Math.round(
                                courseAnalytics.averageAssignmentGrade
                              )}%`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-card">
                        <p className="text-sm text-muted-foreground">
                          Average Quiz Score
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {courseAnalytics?.averageQuizScore !== null
                            ? `${Math.round(courseAnalytics.averageQuizScore)}%`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-card">
                        <p className="text-sm text-muted-foreground">
                          Completion Rate
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {Math.round(courseAnalytics?.completionRate || 0)}%
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-card">
                        <p className="text-sm text-muted-foreground">
                          Difficulty Level
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {courseAnalytics?.difficulty || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Student Performance Tab */}
        <TabsContent value="student" className="space-y-6 mt-6">
          {/* Student Selection — only shown to admins/tutors */}
          {!isStudent && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Student</CardTitle>
              <CardDescription>
                Choose a student to view their performance across all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading students...
                    </SelectItem>
                  ) : students.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No students available
                    </SelectItem>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          )}

          {/* Student Performance Content */}
          {!selectedStudentId ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  No Student Selected
                </h3>
                <p className="text-muted-foreground mt-1">
                  Please select a student above to view their performance
                </p>
              </CardContent>
            </Card>
          ) : studentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-80" />
            </div>
          ) : (
            <>
              {/* Student Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Average Grade"
                  value={`${Math.round(
                    studentPerformance?.averageGrade || 0
                  )}%`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Average Quiz Score"
                  value={`${Math.round(
                    studentPerformance?.averageQuizScore || 0
                  )}%`}
                  icon={Users}
                />
                <StatCard
                  title="Total Submissions"
                  value={studentPerformance?.totalSubmissions || 0}
                  icon={BookOpen}
                />
                <StatCard
                  title="Quiz Attempts"
                  value={`${studentPerformance?.completedQuizAttempts || 0}/${
                    studentPerformance?.quizAttempts || 0
                  }`}
                  icon={TrendingUp}
                />
              </div>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>
                    Submissions and quiz overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Graded Submissions
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {studentPerformance?.gradedSubmissions || 0} /{' '}
                          {studentPerformance?.totalSubmissions || 0}
                        </p>
                      </div>
                      <Progress
                        value={
                          studentPerformance?.totalSubmissions
                            ? (studentPerformance.gradedSubmissions /
                                studentPerformance.totalSubmissions) *
                              100
                            : 0
                        }
                        className="w-20 sm:w-32 h-2"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Completed Quiz Attempts
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {studentPerformance?.completedQuizAttempts || 0} /{' '}
                          {studentPerformance?.quizAttempts || 0}
                        </p>
                      </div>
                      <Progress
                        value={
                          studentPerformance?.quizAttempts
                            ? (studentPerformance.completedQuizAttempts /
                                studentPerformance.quizAttempts) *
                              100
                            : 0
                        }
                        className="w-20 sm:w-32 h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Details</CardTitle>
                  <CardDescription>Performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <p className="text-sm text-muted-foreground">
                        Average Grade
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {studentPerformance?.averageGrade !== null
                          ? `${Math.round(studentPerformance.averageGrade)}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <p className="text-sm text-muted-foreground">
                        Average Quiz Score
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {studentPerformance?.averageQuizScore !== null
                          ? `${Math.round(
                              studentPerformance.averageQuizScore
                            )}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <p className="text-sm text-muted-foreground">
                        Total Submissions
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {studentPerformance?.totalSubmissions || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <p className="text-sm text-muted-foreground">
                        Graded Submissions
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {studentPerformance?.gradedSubmissions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
