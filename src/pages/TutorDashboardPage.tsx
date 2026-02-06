import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TutorSidebar } from '@/components/layout/tutor-sidebar';
import { TutorDashboard } from '@/components/dashboard/tutor-dashboard';
import { Header } from '@/components/layout/header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

const mockTutor = {
  firstName: 'Sarah',
  lastName: 'Chen',
  name: 'Dr. Sarah Chen',
  email: 'sarah.chen@techai.',
  avatar: '/placeholder.svg',
  role: 'Tutor',
};

export default function TutorDashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <Header user={mockTutor} />
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Tutor Dashboard</h2>
          </div>
          <main className="flex-1 p-6">
            <TutorDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
