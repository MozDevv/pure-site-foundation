import { SidebarProvider } from '@/components/ui/sidebar';
import { TutorDashboard } from '@/components/dashboard/tutor-dashboard';
import { Header } from '@/components/layout/header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function TutorDashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
            <TutorDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
