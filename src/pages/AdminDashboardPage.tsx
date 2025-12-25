import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { Header } from '@/components/layout/header';
import UserManagement from '@/components/UserManagement';
import CoursesManagement from '@/components/CoursesManagement';
import { ModuleBuilder } from '@/components/module-builder/ModuleBuilder';
import { ResourceLibrary } from '@/components/module-builder/ResourceLibrary';
import Meetings from './Meetings';
import { InnovationDashboard } from './innovation/InnovationDashboard';
import { TeamsPage } from './innovation/TeamsPage';
import { ProjectsPage } from './innovation/ProjectsPage';
import { ReviewsPage } from './innovation/ReviewsPage';
import { EventsPage } from './innovation/EventsPage';
import { InnovationProvider } from '@/components/innovation-hub/InnovationContext';
import { TeamSetupWizard } from '@/components/setup-wizard/TeamSetupWizard';

const mockAdmin = {
  firstName: 'Admin',
  lastName: 'User',
  name: 'Admin User',
  email: 'admin@techai.',
  avatar: '/placeholder.svg',
  role: 'Admin',
};

export default function AdminDashboardPage({ menu = 'userManagement' }) {
  return (
    <SidebarProvider>
      <InnovationProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <Header user={mockAdmin} />
            {/* <div className="f lex items-center gap-2 p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div> */}
            <main className="flex-1 p-6">
              {menu === 'userManagement' ? (
                <UserManagement />
              ) : menu === 'coursesManagement' ? (
                <CoursesManagement />
              ) : menu === 'moduleBuilder' ? (
                <ModuleBuilder />
              ) : menu === 'resourceLibrary' ? (
                <ResourceLibrary />
              ) : menu === 'timetable' ? (
                <Meetings />
              ) : menu === 'innovationDashboard' ? (
                <InnovationDashboard />
              ) : menu === 'teamsPage' ? (
                <TeamsPage />
              ) : menu === 'projectsPage' ? (
                <ProjectsPage />
              ) : menu === 'reviewsPage' ? (
                <ReviewsPage />
              ) : menu === 'eventsPage' ? (
                <EventsPage />
              ) : menu === 'submitProject' ? (
                <TeamSetupWizard />
              ) : (
                <AdminDashboard />
              )}
            </main>
          </div>
        </div>
      </InnovationProvider>
    </SidebarProvider>
  );
}
