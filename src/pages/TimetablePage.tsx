import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import { TutorSidebar } from '@/components/layout/tutor-sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Header } from '@/components/layout/header';
import { WeeklyTimetable } from '@/components/timetable/weekly-timetable';

const mockUsers = {
  student: {
    name: 'John Doe',
    email: 'john.doe@email.com',
    avatar: '/placeholder.svg',
    role: 'Student',
  },
  tutor: {
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@techai.',
    avatar: '/placeholder.svg',
    role: 'Tutor',
  },
  admin: {
    name: 'Admin User',
    email: 'admin@techai.',
    avatar: '/placeholder.svg',
    role: 'Admin',
  },
};

export default function TimetablePage() {
  const location = useLocation();
  const role = location.pathname.split('/')[1] as 'student' | 'tutor' | 'admin';

  const getSidebar = () => {
    switch (role) {
      case 'student':
        return <StudentSidebar />;
      case 'tutor':
        return <TutorSidebar />;
      case 'admin':
        return <AdminSidebar />;
      default:
        return <StudentSidebar />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {getSidebar()}
        <div className="flex-1 flex flex-col">
          <Header user={mockUsers[role]} />
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Timetable</h2>
          </div>
          <main className="flex-1 p-6">
            <WeeklyTimetable />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
