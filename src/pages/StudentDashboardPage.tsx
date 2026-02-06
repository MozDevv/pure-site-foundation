import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { Header } from '@/components/layout/header';
import { MentorshipProvider } from '@/components/mentorship/MentorshipContext';
import { FindMentorPage } from './mentorship/FindMentorPage';
import { StudentMyMentorPage } from './mentorship/StudentMyMentorPage';
import { StudentSessionsPage } from './mentorship/StudentSessionsPage';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  email: 'john.doe@email.com',
  avatar: '/placeholder.svg',
  role: 'Student',
};

export default function StudentDashboardPage({ menu = 'dashboard' }) {
  const getPageTitle = () => {
    switch (menu) {
      case 'findMentor':
        return 'Find a Mentor';
      case 'myMentor':
        return 'My Mentor';
      case 'mySessions':
        return 'My Sessions';
      default:
        return 'Student Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <MentorshipProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <Header user={mockUser} />
            <div className="flex items-center gap-2 p-4 border-b border-border">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
            </div>
            <main className="flex-1 p-6">
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
