import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/system';
import { CssBaseline } from '@mui/material';
import theme from './lib/muiTheme';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Layout & Auth (not lazy – needed immediately)
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MaintenanceGuard } from './components/auth/MaintenanceGuard';

// Public pages (small – not worth lazy loading)
import Index from './pages/Index';
import SignInPage from './pages/SignInPage';
import ApplicationPage from './pages/ApplicationPage';
import NotFound from './pages/NotFound';
import Activate from './components/Activate';

// ── Lazy-loaded page components ──────────────────────────────────────────────
// Each lazy import becomes its own JS chunk, loaded only when the route is visited.

// Auth / onboarding
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const OnboardingPage    = lazy(() => import('./pages/OnboardingPage'));

// Dashboard landing pages
const AdminDashboard  = lazy(() => import('./components/dashboard/admin-dashboard').then(m => ({ default: m.AdminDashboard })));
const StudentDashboard = lazy(() => import('./components/dashboard/student-dashboard').then(m => ({ default: m.StudentDashboard })));
const TutorDashboard  = lazy(() => import('./components/dashboard/tutor-dashboard').then(m => ({ default: m.TutorDashboard })));

// Admin-only management
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const CreateMenus   = lazy(() => import('./pages/CreateMenus'));
const UserManagement = lazy(() => import('./components/UserManagement'));

// Shared management pages
const CoursesManagement = lazy(() => import('./components/CoursesManagement'));
const ModuleBuilder     = lazy(() => import('./components/module-builder/ModuleBuilder').then(m => ({ default: m.ModuleBuilder })));
const ResourceLibrary   = lazy(() => import('./components/module-builder/ResourceLibrary').then(m => ({ default: m.ResourceLibrary })));
const Meetings          = lazy(() => import('./pages/Meetings'));
const SettingsPage      = lazy(() => import('./pages/SettingsPage'));
const LeaderboardPage   = lazy(() => import('./pages/LeaderboardPage'));

// Assessments
const AssessmentsOverview = lazy(() => import('./components/assessments/AssessmentsOverview'));
const AssignmentsList     = lazy(() => import('./components/assessments/AssignmentsList'));
const CreateAssignment    = lazy(() => import('./components/assessments/CreateAssignment'));
const QuizzesList         = lazy(() => import('./components/assessments/QuizzesList'));
const CreateQuiz          = lazy(() => import('./components/assessments/CreateQuiz'));
const SubmissionsList     = lazy(() => import('./components/assessments/SubmissionsList'));
const SubmissionReview    = lazy(() => import('./components/assessments/SubmissionReview'));
const GradesPerformance   = lazy(() => import('./components/assessments/GradesPerformance'));
const AssignmentSubmit    = lazy(() => import('./components/assessments/AssignmentSubmit'));

// Innovation
const InnovationDashboard = lazy(() => import('./pages/innovation/InnovationDashboard').then(m => ({ default: m.InnovationDashboard })));
const TeamsPage      = lazy(() => import('./pages/innovation/TeamsPage').then(m => ({ default: m.TeamsPage })));
const ProjectsPage   = lazy(() => import('./pages/innovation/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/innovation/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const ReviewsPage    = lazy(() => import('./pages/innovation/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const EventsPage     = lazy(() => import('./pages/innovation/EventsPage').then(m => ({ default: m.EventsPage })));
const TeamSetupWizard = lazy(() => import('./components/setup-wizard/TeamSetupWizard').then(m => ({ default: m.TeamSetupWizard })));

// Mentorship
const MentorshipDashboard = lazy(() => import('./pages/mentorship/MentorshipDashboard').then(m => ({ default: m.MentorshipDashboard })));
const MentorsPage       = lazy(() => import('./pages/mentorship/MentorsPage').then(m => ({ default: m.MentorsPage })));
const MentorRequestsPage = lazy(() => import('./pages/mentorship/MentorRequestsPage').then(m => ({ default: m.MentorRequestsPage })));
const MatchingPage      = lazy(() => import('./pages/mentorship/MatchingPage').then(m => ({ default: m.MatchingPage })));
const MentorGroupsPage  = lazy(() => import('./pages/mentorship/MentorGroupsPage').then(m => ({ default: m.MentorGroupsPage })));
const SessionsPage      = lazy(() => import('./pages/mentorship/SessionsPage').then(m => ({ default: m.SessionsPage })));
const MyMenteesPage     = lazy(() => import('./pages/mentorship/MyMenteesPage').then(m => ({ default: m.MyMenteesPage })));
const FindMentorPage    = lazy(() => import('./pages/mentorship/FindMentorPage').then(m => ({ default: m.FindMentorPage })));
const StudentMyMentorPage = lazy(() => import('./pages/mentorship/StudentMyMentorPage').then(m => ({ default: m.StudentMyMentorPage })));
const StudentSessionsPage = lazy(() => import('./pages/mentorship/StudentSessionsPage').then(m => ({ default: m.StudentSessionsPage })));

// Chat & Communication
const FirestoreChatLayout = lazy(() => import('./components/chat/firestore/FirestoreChatLayout').then(m => ({ default: m.FirestoreChatLayout })));
const AnnouncementsPage    = lazy(() => import('./components/announcements/AnnouncementsPage'));

// Misc pages
const ForumPage       = lazy(() => import('./pages/ForumPage'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'));
const AttendancePage  = lazy(() => import('./pages/AttendancePage'));
const RoleUpgradePage = lazy(() => import('./pages/RoleUpgradePage'));

// New feature pages
const CodePlaygroundPage    = lazy(() => import('./pages/CodePlaygroundPage'));
const SupportPage           = lazy(() => import('./pages/SupportPage'));
const LearningPathPage      = lazy(() => import('./pages/LearningPathPage'));
const ReportBuilderPage     = lazy(() => import('./pages/ReportBuilderPage'));
const AdminSupportDashboard = lazy(() => import('./pages/AdminSupportDashboard'));
const GoogleFormEnrollmentsPage = lazy(() => import('./pages/GoogleFormEnrollmentsPage'));
const CodingAssignmentsPage = lazy(() => import('./pages/CodingAssignmentsPage'));
const TasksPage = lazy(() => import('./pages/Tasks'));
const LearnerAnalyticsPage = lazy(() => import('./pages/LearnerAnalyticsPage'));

// ── Route suspense fallback ───────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // Data considered fresh for 5 minutes
      gcTime: 15 * 60 * 1000,          // Keep unused cache for 15 minutes
      refetchOnWindowFocus: false,     // No refetch on tab switch (reduces API calls)
      retry: 1,                        // Retry failed requests once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes (no sidebar / header) ── */}
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/apply" element={<ApplicationPage />} />
            <Route path="/activate/:userId" element={<Activate />} />
            <Route path="/reset-password/:userId" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/*
              ── Dashboard Routes ──
              All routes below share the persistent DashboardLayout
              (sidebar + header stay mounted, only the content area changes).
              MaintenanceGuard blocks non-admin access when maintenance mode is active.
            */}
            <Route element={<MaintenanceGuard />}>
            <Route element={<DashboardLayout />}>
              {/* ── Student (any authenticated user) ── */}
              <Route element={<ProtectedRoute allowedRoles={['Student', 'Tutor', 'Admin', 'Super_Admin', 'Mentor', 'Reviewer']} />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<CoursesManagement />} />
                <Route path="/student/module-builder" element={<ModuleBuilder />} />
                <Route path="/student/module-builder/resource-library" element={<ResourceLibrary />} />
                <Route path="/student/assessments" element={<AssessmentsOverview />} />
                <Route path="/student/assessments/assignments" element={<AssignmentsList />} />
                <Route path="/student/assessments/assignments/:id/submit" element={<AssignmentSubmit />} />
                <Route path="/student/assessments/quizzes" element={<QuizzesList />} />
                <Route path="/student/assessments/submissions" element={<SubmissionsList />} />
                <Route path="/student/assessments/grades" element={<GradesPerformance />} />
                <Route path="/student/timetable" element={<Meetings />} />
                <Route path="/student/chat" element={<FirestoreChatLayout />} />
                <Route path="/student/chat/announcements" element={<AnnouncementsPage />} />
                <Route path="/student/mentorship" element={<FindMentorPage />} />
                <Route path="/student/mentorship/my-mentees" element={<MyMenteesPage />} />
                <Route path="/student/mentorship/my-mentor" element={<StudentMyMentorPage />} />
                <Route path="/student/mentorship/sessions" element={<StudentSessionsPage />} />
                <Route path="/student/mentorship/mentors" element={<MentorsPage />} />
                <Route path="/student/mentorship/find" element={<FindMentorPage />} />
                <Route path="/student/innovation" element={<InnovationDashboard />} />
                <Route path="/student/innovation/teams" element={<TeamsPage />} />
                <Route path="/student/innovation/projects" element={<ProjectsPage />} />
                <Route path="/student/innovation/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/student/innovation/reviews" element={<ReviewsPage />} />
                <Route path="/student/innovation/events" element={<EventsPage />} />
                <Route path="/student/innovation/submit-project" element={<TeamSetupWizard isOpen={true} onClose={() => {}} />} />
                <Route path="/student/leaderboard" element={<LeaderboardPage />} />
                <Route path="/student/forum" element={<ForumPage />} />
                <Route path="/student/certificates" element={<CertificatesPage />} />
                <Route path="/student/attendance" element={<AttendancePage />} />
                <Route path="/student/role-upgrade" element={<RoleUpgradePage />} />
                <Route path="/student/code-playground" element={<CodePlaygroundPage />} />
                <Route path="/student/support" element={<SupportPage />} />
                <Route path="/student/learning-paths" element={<LearningPathPage />} />
                <Route path="/student/kanban" element={<TasksPage />} />
                <Route path="/student/settings" element={<SettingsPage />} />
                <Route path="/student/*" element={<StudentDashboard />} />
              </Route>

              {/* ── Tutor (Tutor + Admin + Reviewer + Mentor) ── */}
              <Route element={<ProtectedRoute allowedRoles={['Tutor', 'Admin', 'Super_Admin', 'Reviewer', 'Mentor']} />}>
                <Route path="/tutor" element={<TutorDashboard />} />
                <Route path="/tutor/courses" element={<CoursesManagement />} />
                <Route path="/tutor/module-builder" element={<ModuleBuilder />} />
                <Route path="/tutor/module-builder/resource-library" element={<ResourceLibrary />} />
                <Route path="/tutor/assessments" element={<AssessmentsOverview />} />
                <Route path="/tutor/assessments/assignments" element={<AssignmentsList />} />
                <Route path="/tutor/assessments/assignments/create" element={<CreateAssignment />} />
                <Route path="/tutor/assessments/assignments/:id" element={<CreateAssignment />} />
                <Route path="/tutor/assessments/quizzes" element={<QuizzesList />} />
                <Route path="/tutor/assessments/quizzes/create" element={<CreateQuiz />} />
                <Route path="/tutor/assessments/quizzes/:id" element={<CreateQuiz />} />
                <Route path="/tutor/assessments/submissions" element={<SubmissionsList />} />
                <Route path="/tutor/assessments/submissions/:id" element={<SubmissionReview />} />
                <Route path="/tutor/assessments/grades" element={<GradesPerformance />} />
                <Route path="/tutor/timetable" element={<Meetings />} />
                <Route path="/tutor/chat" element={<FirestoreChatLayout />} />
                <Route path="/tutor/chat/announcements" element={<AnnouncementsPage />} />
                <Route path="/tutor/mentorship" element={<MentorshipDashboard />} />
                <Route path="/tutor/mentorship/mentors" element={<MentorsPage />} />
                <Route path="/tutor/mentorship/my-mentees" element={<MyMenteesPage />} />
                <Route path="/tutor/mentorship/my-sessions" element={<StudentSessionsPage />} />
                <Route path="/tutor/mentorship/find" element={<FindMentorPage />} />
                <Route path="/tutor/mentorship/requests" element={<MentorRequestsPage />} />
                <Route path="/tutor/mentorship/matching" element={<MatchingPage />} />
                <Route path="/tutor/mentorship/groups" element={<MentorGroupsPage />} />
                <Route path="/tutor/innovation" element={<InnovationDashboard />} />
                <Route path="/tutor/innovation/teams" element={<TeamsPage />} />
                <Route path="/tutor/innovation/projects" element={<ProjectsPage />} />
                <Route path="/tutor/innovation/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/tutor/innovation/reviews" element={<ReviewsPage />} />
                <Route path="/tutor/innovation/events" element={<EventsPage />} />
                <Route path="/tutor/innovation/submit-project" element={<TeamSetupWizard isOpen={true} onClose={() => {}} />} />
                <Route path="/tutor/leaderboard" element={<LeaderboardPage />} />
                <Route path="/tutor/forum" element={<ForumPage />} />
                <Route path="/tutor/certificates" element={<CertificatesPage />} />
                <Route path="/tutor/attendance" element={<AttendancePage />} />
                <Route path="/tutor/role-upgrade" element={<RoleUpgradePage />} />
                <Route path="/tutor/code-playground" element={<CodePlaygroundPage />} />
                <Route path="/tutor/coding-assignments" element={<CodingAssignmentsPage />} />
                <Route path="/tutor/support" element={<SupportPage />} />
                <Route path="/tutor/learning-paths" element={<LearningPathPage />} />
                <Route path="/tutor/reports" element={<ReportBuilderPage />} />
                <Route path="/tutor/kanban" element={<TasksPage />} />
                <Route path="/tutor/settings" element={<SettingsPage />} />
                <Route path="/tutor/analytics" element={<LearnerAnalyticsPage />} />
                <Route path="/tutor/*" element={<TutorDashboard />} />
              </Route>

              {/* ── Admin-only routes ── */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Super_Admin']} />}>
                <Route path="/admin/menu-setups" element={<CreateMenus />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/leaderboard" element={<LeaderboardPage />} />
                <Route path="/admin/forum" element={<ForumPage />} />
                <Route path="/admin/certificates" element={<CertificatesPage />} />
                <Route path="/admin/attendance" element={<AttendancePage />} />
                <Route path="/admin/role-upgrade" element={<RoleUpgradePage />} />
                <Route path="/admin/support" element={<AdminSupportDashboard />} />
                <Route path="/admin/reports" element={<ReportBuilderPage />} />
                <Route path="/admin/learning-paths" element={<LearningPathPage />} />
                <Route path="/admin/code-playground" element={<CodePlaygroundPage />} />
                <Route path="/admin/coding-assignments" element={<CodingAssignmentsPage />} />
                <Route path="/admin/kanban" element={<TasksPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/analytics" element={<LearnerAnalyticsPage />} />
                <Route path="/admin/google-form-enrollments" element={<GoogleFormEnrollmentsPage />} />
              </Route>

              {/* ── Admin + Tutor routes ── */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Super_Admin', 'Tutor']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/courses" element={<CoursesManagement />} />
                <Route path="/admin/module-builder" element={<ModuleBuilder />} />
                <Route path="/admin/module-builder/resource-library" element={<ResourceLibrary />} />
                <Route path="/admin/timetable" element={<Meetings />} />
                <Route path="/admin/chat" element={<FirestoreChatLayout />} />
                <Route path="/admin/chat/announcements" element={<AnnouncementsPage />} />

                {/* Assessments */}
                <Route path="/admin/assessments" element={<AssessmentsOverview />} />
                <Route path="/admin/assessments/assignments" element={<AssignmentsList />} />
                <Route path="/admin/assessments/assignments/create" element={<CreateAssignment />} />
                <Route path="/admin/assessments/assignments/:id/submit" element={<AssignmentSubmit />} />
                <Route path="/admin/assessments/assignments/:id" element={<CreateAssignment />} />
                <Route path="/admin/assessments/quizzes" element={<QuizzesList />} />
                <Route path="/admin/assessments/quizzes/create" element={<CreateQuiz />} />
                <Route path="/admin/assessments/quizzes/:id" element={<CreateQuiz />} />
                <Route path="/admin/assessments/submissions" element={<SubmissionsList />} />
                <Route path="/admin/assessments/submissions/:id" element={<SubmissionReview />} />
                <Route path="/admin/assessments/grades" element={<GradesPerformance />} />

                {/* Innovation */}
                <Route path="/admin/innovation" element={<InnovationDashboard />} />
                <Route path="/admin/innovation/teams" element={<TeamsPage />} />
                <Route path="/admin/innovation/projects" element={<ProjectsPage />} />
                <Route path="/admin/innovation/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/admin/innovation/reviews" element={<ReviewsPage />} />
                <Route path="/admin/innovation/events" element={<EventsPage />} />
                <Route path="/admin/innovation/submit-project" element={<TeamSetupWizard isOpen={true} onClose={() => {}} />} />

                {/* Mentorship */}
                <Route path="/admin/mentorship" element={<MentorshipDashboard />} />
                <Route path="/admin/mentorship/find" element={<FindMentorPage />} />
                <Route path="/admin/mentorship/mentors" element={<MentorsPage />} />
                <Route path="/admin/mentorship/requests" element={<MentorRequestsPage />} />
                <Route path="/admin/mentorship/matching" element={<MatchingPage />} />
                <Route path="/admin/mentorship/groups" element={<MentorGroupsPage />} />
                <Route path="/admin/mentorship/sessions" element={<SessionsPage />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>
            </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;