import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import SignInPage from './pages/SignInPage';
import ApplicationPage from './pages/ApplicationPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TutorDashboardPage from './pages/TutorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TimetablePage from './pages/TimetablePage';
import NotFound from './pages/NotFound';
import Activate from './components/Activate';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CoursesManagement from './components/CoursesManagement';
import { ModuleBuilder } from './components/module-builder/ModuleBuilder';
import { ThemeProvider } from '@mui/system';
import { CssBaseline } from '@mui/material';
import theme from './lib/muiTheme';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/apply" element={<ApplicationPage />} />
            <Route path="/activate/:userId" element={<Activate />} />
            <Route
              path="/reset-password/:userId"
              element={<ResetPasswordPage />}
            />

            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/timetable" element={<TimetablePage />} />
            <Route path="/student/*" element={<StudentDashboardPage />} />

            {/* Tutor Routes */}
            <Route path="/tutor" element={<TutorDashboardPage />} />
            <Route path="/tutor/timetable" element={<TimetablePage />} />
            <Route path="/tutor/*" element={<TutorDashboardPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
            <Route
              path="/admin/courses"
              element={<AdminDashboardPage menu="coursesManagement" />}
            />
            <Route
              path="/admin/module-builder"
              element={<AdminDashboardPage menu="moduleBuilder" />}
            />
            <Route
              path="/admin/module-builder/resource-library"
              element={<AdminDashboardPage menu="resourceLibrary" />}
            />
            <Route
              path="/admin/users"
              element={<AdminDashboardPage menu="userManagement" />}
            />
            <Route
              path="/admin/timetable"
              element={<AdminDashboardPage menu="timetable" />}
            />
            <Route
              path="/admin/innovation"
              element={<AdminDashboardPage menu="innovationDashboard" />}
            />
            <Route
              path="/innovation/submit-project"
              element={<AdminDashboardPage menu="submitProject" />}
            />

            <Route
              path="/admin/innovation/teams"
              element={<AdminDashboardPage menu="teamsPage" />}
            />
            <Route
              path="/admin/innovation/projects"
              element={<AdminDashboardPage menu="projectsPage" />}
            />
            <Route
              path="/admin/innovation/projects/:id"
              element={<AdminDashboardPage menu="projectDetailPage" />}
            />
            <Route
              path="/admin/innovation/reviews"
              element={<AdminDashboardPage menu="reviewsPage" />}
            />
            <Route
              path="/admin/innovation/events"
              element={<AdminDashboardPage menu="eventsPage" />}
            />
            <Route
              path="/admin/assessments/assignments/:id/submit"
              element={<AdminDashboardPage menu="submitAssignment" />}
            />

            {/*   {
    label: "Assessments",
    items: [
      { title: "Overview", url: "/admin/assessments", icon: LayoutGrid },
      { title: "Assignments", url: "/admin/assessments/assignments", icon: FileText },
      { title: "Quizzes", url: "/admin/assessments/quizzes", icon: CheckSquare },
      { title: "Submissions", url: "/admin/assessments/submissions", icon: Users },
      { title: "Grades & Performance", url: "/admin/assessments/grades", icon: TrendingUp },
    ],
  },
  
      <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/assessments" replace />} />
            <Route path="assessments" element={<AssessmentsOverview />} />
            <Route path="assessments/assignments" element={<AssignmentsList />} />
            <Route path="assessments/assignments/create" element={<CreateAssignment />} />
            <Route path="assessments/assignments/:id" element={<CreateAssignment />} />
            <Route path="assessments/quizzes" element={<QuizzesList />} />
            <Route path="assessments/quizzes/create" element={<CreateQuiz />} />
            <Route path="assessments/quizzes/:id" element={<CreateQuiz />} />
            <Route path="assessments/submissions" element={<SubmissionsList />} />
            <Route path="assessments/submissions/:id" element={<SubmissionReview />} />
            <Route path="assessments/grades" element={<GradesPerformance />} />
          </Route>
  
  
  */}
            <Route
              path="/admin/assessments"
              element={<AdminDashboardPage menu="assessmentsOverview" />}
            />
            <Route
              path="/admin/assessments/assignments"
              element={<AdminDashboardPage menu="assignmentsPage" />}
            />
            <Route
              path="/admin/assessments/quizzes"
              element={<AdminDashboardPage menu="quizzesPage" />}
            />
            <Route
              path="/admin/assessments/submissions"
              element={<AdminDashboardPage menu="submissionsPage" />}
            />
            <Route
              path="/admin/assessments/grades"
              element={<AdminDashboardPage menu="gradesPage" />}
            />
            <Route
              path="/admin/assessments/assignments/create"
              element={<AdminDashboardPage menu="createAssignment" />}
            />
            <Route
              path="/admin/assessments/assignments/:id"
              element={<AdminDashboardPage menu="editAssignment" />}
            />
            <Route
              path="/admin/assessments/quizzes/create"
              element={<AdminDashboardPage menu="createQuiz" />}
            />
            <Route
              path="/admin/assessments/quizzes/:id"
              element={<AdminDashboardPage menu="editQuiz" />}
            />
            <Route
              path="/admin/assessments/submissions/:id"
              element={<AdminDashboardPage menu="submissionReview" />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
