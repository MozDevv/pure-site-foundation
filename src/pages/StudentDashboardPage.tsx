import { SidebarProvider } from '@/components/ui/sidebar';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { Header } from '@/components/layout/header';
import { MentorshipProvider } from '@/components/mentorship/MentorshipContext';
import { FindMentorPage } from './mentorship/FindMentorPage';
import { StudentMyMentorPage } from './mentorship/StudentMyMentorPage';
import { StudentSessionsPage } from './mentorship/StudentSessionsPage';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function StudentDashboardPage({ menu = 'dashboard' }) {
  return (
    <SidebarProvider>
      <MentorshipProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
              {menu === 'findMentor' ? (
                <FindMentorPage />
              ) : menu === 'myMentor' ? (
                <StudentMyMentorPage />
              ) : menu === 'mySessions' ? (
                <StudentSessionsPage />
              ) : (
                <StudentDashboard />
              )}
            </main>
          </div>
        </div>
      </MentorshipProvider>
    </SidebarProvider>
  );
}
