import { useQuery } from "@tanstack/react-query";
import { FileText, CheckSquare, Users, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { apiService } from "@/services/apiService";
import { StatCard } from "@/components/ui/stat-card";
import { AssignmentCard } from "@/components/assessments/AssignmentCard";
import { QuizCard } from "@/components/assessments/QuizCard";
import { SubmissionCard } from "@/components/assessments/SubmissionCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssessmentsOverview() {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const userRole = (user?.role || 'Student').toLowerCase();
  const isStudent = userRole === 'student';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const canCreate = userRole === 'tutor' || userRole === 'mentor' || isAdmin;
  const basePath = isStudent ? '/student' : isAdmin ? '/admin' : '/tutor';

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => apiService.getAssignments(),
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => apiService.getQuizzes(),
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => apiService.getSubmissions(),
  });

  const pendingSubmissions = submissions?.filter(s => s.status === "submitted") || [];
  const totalSubmissions = submissions?.length || 0;
  const gradedSubmissions = submissions?.filter(s => s.status === "graded").length || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Assessments Overview
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage assignments, quizzes, and track student performance
          </p>
        </div>
        <div className="flex gap-3">
          {canCreate && (
            <>
              <Button variant="outline" asChild>
                <Link to={`${basePath}/assessments/quizzes/create`}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  New Quiz
                </Link>
              </Button>
              <Button asChild>
                <Link to={`${basePath}/assessments/assignments/create`}>
                  <FileText className="mr-2 h-4 w-4" />
                  New Assignment
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assignments"
          value={assignmentsLoading ? "—" : assignments?.length || 0}
          icon={FileText}
          trend={{ value: 12, label: "from last month", positive: true }}
        />
        <StatCard
          title="Active Quizzes"
          value={quizzesLoading ? "—" : quizzes?.length || 0}
          icon={CheckSquare}
          trend={{ value: 8, label: "from last month", positive: true }}
        />
        <StatCard
          title="Pending Reviews"
          value={submissionsLoading ? "—" : pendingSubmissions.length}
          icon={Clock}
          description="Awaiting grading"
        />
        <StatCard
          title="Completion Rate"
          value={totalSubmissions > 0 ? `${Math.round((gradedSubmissions / totalSubmissions) * 100)}%` : "0%"}
          icon={TrendingUp}
          trend={{ value: 5, label: "improvement", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Assignments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Assignments</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${basePath}/assessments/assignments`}>View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {assignmentsLoading ? (
              <>
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </>
            ) : (
              assignments?.slice(0, 4).map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))
            )}
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {isStudent ? 'My Submissions' : 'Needs Review'}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${basePath}/assessments/submissions`}>View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {submissionsLoading ? (
              <>
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </>
            ) : pendingSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <CheckSquare className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No pending submissions</p>
              </div>
            ) : (
              pendingSubmissions.slice(0, 4).map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} compact />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Quizzes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`${basePath}/assessments/quizzes`}>View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzesLoading ? (
            <>
              <Skeleton className="h-56 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </>
          ) : (
            quizzes?.slice(0, 3).map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
