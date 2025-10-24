import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { Header } from "@/components/layout/header";

const mockUser = {
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  email: "john.doe@email.com",
  avatar: "/placeholder.svg",
  role: "Student"
};

export default function StudentDashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <Header user={mockUser} />
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Student Dashboard</h2>
          </div>
          <main className="flex-1 p-6">
            <StudentDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}