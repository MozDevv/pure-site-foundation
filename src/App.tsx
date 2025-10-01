import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ApplicationPage from "./pages/ApplicationPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TimetablePage from "./pages/TimetablePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/apply" element={<ApplicationPage />} />
          
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
          <Route path="/admin/timetable" element={<TimetablePage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
