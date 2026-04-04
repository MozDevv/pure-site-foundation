import { User, LogOut, Bell, Search, Menu, X, GraduationCap, Settings, Calendar, CheckCircle2, MessageSquare, BookOpen, Clock, ArrowLeftRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { getNavigationSections } from '@/components/layout/admin-sidebar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import React from 'react';

/* ───────── Notification type icons & colors ───────── */
const NOTIFICATION_ICON_MAP: Record<string, { icon: typeof Bell; color: string }> = {
  MEETING_INVITE: { icon: Calendar, color: 'text-blue-500' },
  MEETING_REMINDER: { icon: Clock, color: 'text-amber-500' },
  ASSIGNMENT_DUE: { icon: BookOpen, color: 'text-red-500' },
  GRADE_POSTED: { icon: CheckCircle2, color: 'text-emerald-500' },
  SUBMISSION_GRADED: { icon: CheckCircle2, color: 'text-emerald-500' },
  MENTORSHIP_UPDATE: { icon: MessageSquare, color: 'text-purple-500' },
  COURSE_UPDATE: { icon: BookOpen, color: 'text-blue-500' },
  SYSTEM_ANNOUNCEMENT: { icon: Bell, color: 'text-blue-600' },
  APPROVAL_REQUEST: { icon: CheckCircle2, color: 'text-amber-500' },
  RSVP_RESPONSE: { icon: Calendar, color: 'text-emerald-500' },
  CHAT_MESSAGE: { icon: MessageSquare, color: 'text-blue-500' },
  PROJECT_UPDATE: { icon: Settings, color: 'text-blue-500' },
};

function getNotificationIcon(type: string) {
  return NOTIFICATION_ICON_MAP[type] || { icon: Bell, color: 'text-muted-foreground' };
}

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface HeaderProps {
  user?: {
    firstName: any;
    lastName: any;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const [user, setUser] = React.useState<HeaderProps['user'] | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Determine sidebar context safely — header may render outside SidebarProvider on public pages
  let sidebarCtx: { toggleSidebar: () => void; isMobile: boolean } | null = null;
  try {
    sidebarCtx = useSidebar();
  } catch {
    // Not inside a SidebarProvider — e.g. landing or sign-in page
  }

  React.useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // optional: listen for changes from other tabs
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user') setUser(e.newValue ? JSON.parse(e.newValue) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Keyboard shortcut: Ctrl+K to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.post(endpoints.logout);
    } catch {
      // Continue with local logout even if API call fails
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    window.location.href = '/signin';
  };

  /* ── Notification queries ── */
  const { data: unreadNotifications = [] } = useQuery<any[]>({
    queryKey: ['notifications-unread'],
    queryFn: () => apiService.get(endpoints.getUnreadNotifications).then(r => r.data),
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // fallback poll every 5 min (WebSocket handles real-time)
    staleTime: 2 * 60 * 1000,
  });

  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['notifications-unread-count'],
    queryFn: () => apiService.get(endpoints.getUnreadCount).then(r => r.data),
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // fallback poll every 5 min (WebSocket handles real-time)
    staleTime: 2 * 60 * 1000,
  });

  const unreadCount = unreadCountData?.count || 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiService.patch(endpoints.markNotificationRead(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.patch(endpoints.markAllNotificationsRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      setNotifOpen(false);
      navigate(notification.actionUrl);
    }
  };

  // Get navigation sections based on user role
  const navigationSections = React.useMemo(() => {
    return getNavigationSections(user?.role);
  }, [user?.role]);

  // Build flat list of navigable menu items for search
  const searchableItems = React.useMemo(() => {
    const items: { title: string; url: string; section: string; icon: any }[] = [];
    navigationSections.forEach((section) => {
      section.items.forEach((item) => {
        if ('children' in item && item.children) {
          item.children.forEach((child) => {
            items.push({ title: child.title, url: child.url, section: section.label, icon: child.icon });
          });
        } else if (item.url) {
          items.push({ title: item.title, url: item.url, section: section.label, icon: item.icon });
        }
      });
    });
    return items;
  }, [navigationSections]);

  const handleSearchSelect = (url: string) => {
    setSearchOpen(false);
    navigate(url);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar trigger */}
            {sidebarCtx && sidebarCtx.isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={sidebarCtx.toggleSidebar}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex sm:hidden items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-h4-sb bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  TechAI
                </h1>
                <p className="text-label text-muted-foreground leading-none">
                  Learning Management System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search trigger */}
            {user && (
              <Button
                variant="outline"
                data-tour="search"
                className="relative h-9 w-9 sm:w-[200px] lg:w-[280px] justify-start text-sm text-muted-foreground"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4 sm:mr-2 shrink-0" />
                <span className="hidden sm:inline-flex">Search...</span>
                <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            )}

            <ThemeToggle />

            {/* Notification Bell */}
            {user && (
              <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9" data-tour="notifications">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse-ring">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] p-0" align="end" sideOffset={8}>
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => markAllReadMutation.mutate()}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-[400px]">
                    {unreadNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Bell className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                        <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {unreadNotifications.slice(0, 15).map((notif: any) => {
                          const { icon: NotifIcon, color } = getNotificationIcon(notif.type);
                          return (
                            <button
                              key={notif.id}
                              className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className={`mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0`}>
                                <NotifIcon className={`h-4 w-4 ${color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight truncate">{notif.title}</p>
                                {notif.message && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-1">{formatTimeAgo(notif.createdAt)}</p>
                              </div>
                              {!notif.isRead && (
                                <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <Separator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setNotifOpen(false);
                        const role = user?.role?.toLowerCase() || 'student';
                        const basePath = role === 'super_admin' ? 'admin' : role;
                        navigate(`/${basePath}/settings`);
                      }}
                    >
                      Notification Settings
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {!user && (
              <Link to="/apply">
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    data-tour="user-menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.firstName && user.lastName
                          ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                          : user.name}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {user.role && (
                      <Badge variant="outline" className="w-fit mt-1">
                        {user.role === 'Super_Admin' ? 'Super Admin' : user.role}
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    const role = user?.role?.toLowerCase() || 'student';
                    const basePath = role === 'super_admin' ? 'admin' : role;
                    navigate(`/${basePath}/settings`);
                  }}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {/* Role switching for Tutors (can also view as Student) */}
                  {(user.role === 'Tutor' || user.role === 'Mentor') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        if (location.pathname.startsWith('/student')) {
                          navigate(user.role === 'Tutor' ? '/tutor' : '/tutor');
                        } else {
                          navigate('/student');
                        }
                      }}>
                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                        {location.pathname.startsWith('/student') ? `Switch to ${user.role} View` : 'Switch to Student View'}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/signin">
                <Button variant="hero" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search Command Palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search pages, menus..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navigationSections.map((section) => (
            <CommandGroup key={section.label} heading={section.label}>
              {section.items.map((item) => {
                if ('children' in item && item.children) {
                  return item.children.map((child) => (
                    <CommandItem
                      key={child.url}
                      value={`${child.title} ${section.label}`}
                      onSelect={() => handleSearchSelect(child.url)}
                    >
                      <child.icon className="mr-2 h-4 w-4 shrink-0" />
                      <span>{child.title}</span>
                    </CommandItem>
                  ));
                }
                return (
                  <CommandItem
                    key={item.url}
                    value={`${item.title} ${section.label}`}
                    onSelect={() => handleSearchSelect(item.url!)}
                  >
                    <item.icon className="mr-2 h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
