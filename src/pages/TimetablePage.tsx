import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Header } from '@/components/layout/header';
import Meetings from './Meetings';

export default function TimetablePage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
            <Meetings />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
