import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { Header } from "@/components/layout/header";

const mockAdmin = {
  name: "Admin User",
  email: "admin@techai.foundation",
  avatar: "/placeholder.svg",
  role: "Admin"
};

export default function AdminDashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <Header user={mockAdmin} />
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>
          <main className="flex-1 p-6">
            <AdminDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}