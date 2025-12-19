import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  CheckSquare, 
  Trophy, 
  Menu, 
  X, 
  ChevronDown,
  LogOut,
  Settings,
  User,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInnovation } from './InnovationContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { path: '/innovation', label: 'Innovation Hub', icon: Home, exact: true },
  { path: '/innovation/teams', label: 'Teams & Clubs', icon: Users },
  { path: '/innovation/projects', label: 'Projects & Ideas', icon: FileText },
  { path: '/innovation/reviews', label: 'Submissions & Reviews', icon: CheckSquare, badge: 8 },
  { path: '/innovation/events', label: 'Events & Challenges', icon: Trophy },
];

export function InnovationLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, toggleUserRole } = useInnovation();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center w-full")}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-foreground">Innovation Hub</span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn("shrink-0", !sidebarOpen && "hidden")}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-muted/60",
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" 
                    : "text-muted-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", !sidebarOpen && "h-5 w-5")} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && currentUser.role === "Admin" && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        {/* Toggle Button when collapsed */}
        {!sidebarOpen && (
          <div className="px-3 py-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="w-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* User Profile */}
        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/60 transition-colors",
                !sidebarOpen && "justify-center"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={cn(
                    "text-xs font-medium",
                    currentUser.role === "Admin" 
                      ? "bg-amber-100 text-amber-700" 
                      : "bg-blue-100 text-blue-700"
                  )}>
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
                  </div>
                )}
                {sidebarOpen && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleUserRole}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Switch to {currentUser.role === "Student" ? "Admin" : "Student"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        <Outlet />
      </main>
    </div>
  );
}
