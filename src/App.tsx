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
              path="/admin/innovation/reviews"
              element={<AdminDashboardPage menu="reviewsPage" />}
            />
            <Route
              path="/admin/innovation/events"
              element={<AdminDashboardPage menu="eventsPage" />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
