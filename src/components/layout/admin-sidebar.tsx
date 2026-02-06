import {
  Users,
  BookOpen,
  MessagesSquare,
  TrendingUp,
  Settings,
  Home,
  Calendar,
  Blocks,
  FileText,
  CheckSquare,
  Trophy,
  LayoutGrid,
  UserCheck,
  ClipboardList,
  GitMerge,
  Video,
  MessageCircle,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { apiService, endpoints } from '@/lib/api';

// You should get this from auth context / token / zustand / redux
// Example shape: { role: "Admin", roleId: "131", ... }

export const navigationSections = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', url: '/admin', icon: Home },
      { title: 'Users', url: '/admin/users', icon: Users },
      { title: 'Courses', url: '/admin/courses', icon: BookOpen },
      {
        title: 'Course Materials',
        icon: Blocks,
        children: [
          {
            title: 'Learning Hub',
            url: '/admin/module-builder',
            icon: BookOpen,
          },
          {
            title: 'Resource Library',
            url: '/admin/module-builder/resource-library',
            icon: BookOpen,
          },
        ],
      },
      {
        title: 'Assessments',
        icon: LayoutGrid,
        children: [
          { title: 'Overview', url: '/admin/assessments', icon: LayoutGrid },
          {
            title: 'Assignments',
            url: '/admin/assessments/assignments',
            icon: FileText,
          },
          {
            title: 'Quizzes',
            url: '/admin/assessments/quizzes',
            icon: CheckSquare,
          },
          {
            title: 'Submissions',
            url: '/admin/assessments/submissions',
            icon: Users,
          },
          {
            title: 'Grades & Performance',
            url: '/admin/assessments/grades',
            icon: TrendingUp,
          },
        ],
      },
      { title: 'Timetable', url: '/admin/timetable', icon: Calendar },
      // { title: 'Messages', url: '/admin/messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Communication',
    items: [
      { title: 'Chat Room', url: '/admin/chat', icon: MessagesSquare },

      {
        title: 'Announcements',
        url: '/admin/chat/announcements',
        icon: MessageCircle,
      },
    ],
  },
  {
    label: 'Mentorship',
    items: [
      { title: 'My Mentors', url: '/admin/mentorship/my-mentor', icon: Users },
      {
        title: 'My Mentees',
        url: '/admin/mentorship/my-mentees',
        icon: UserCheck,
      },
      {
        title: 'Mentor Profiles',
        url: '/admin/mentorship/mentors',
        icon: Users,
      },
      {
        title: 'Mentee Requests',
        url: '/admin/mentorship/requests',
        icon: ClipboardList,
      },
      { title: 'Matching', url: '/admin/mentorship/matching', icon: GitMerge },
      // {
      //   title: 'Mentor Groups',
      //   url: '/admin/mentorship/groups',
      //   icon: UsersRound,
      // },
      { title: 'Find a Mentor', url: '/admin/mentorship', icon: UserCheck },
    ],
  },
  {
    label: 'Innovation',
    items: [
      { title: 'Innovation Hub', url: '/admin/innovation', icon: Home },
      { title: 'Teams & Clubs', url: '/admin/innovation/teams', icon: Users },
      {
        title: 'Projects & Ideas',
        url: '/admin/innovation/projects',
        icon: FileText,
      },
      {
        title: 'Submissions & Reviews',
        url: '/admin/innovation/reviews',
        icon: CheckSquare,
      },
      {
        title: 'Events & Challenges',
        url: '/admin/innovation/events',
        icon: Trophy,
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      { title: 'Settings', url: '/admin/settings', icon: Settings },

      { title: 'Menu Setups', url: '/admin/menu-setups', icon: Video },
    ],
  },
];
export function AdminSidebar() {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [allowedMenus, setAllowedMenus] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;
  const roleId = user?.roleId;

  useEffect(() => {
    if (!roleId) {
      setLoading(false);
      return;
    }

    const loadAllowedMenus = async () => {
      try {
        setLoading(true);
        const res = await apiService.get(endpoints.getMenusByRole(roleId));
        const menuNames = res.data?.map((m: any) => m.name) || [];
        setAllowedMenus(new Set(menuNames));
      } catch (err) {
        console.error('Failed to load role menus', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllowedMenus();
  }, [roleId]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Helper: check if this menu item is allowed
  const isAllowed = (title: string) => allowedMenus.has(title);

  // Filter sections — only keep those with at least one allowed item
  const visibleSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (item.children) {
            const allowedChildren = item.children.filter((child) =>
              isAllowed(child.title)
            );
            if (allowedChildren.length === 0) return null;
            return { ...item, children: allowedChildren };
          }
          return isAllowed(item.title) ? item : null;
        })
        .filter(Boolean),
    }))
    .filter((section) => section.items.length > 0);

  if (loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading menu...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {visibleSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="font-bold text-xs uppercase tracking-wide">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) =>
                  'children' in item && item.children ? (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 bg-transparent border-0 p-0 outline-none"
                          onClick={() => toggleMenu(item.title)}
                          tabIndex={0}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1 text-left">{item.title}</span>
                          {openMenus[item.title] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </SidebarMenuButton>

                      {openMenus[item.title] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <NavLink to={child.url} end key={child.title}>
                              {({ isActive }) => (
                                <SidebarMenuButton isActive={isActive}>
                                  <child.icon className="h-4 w-4" />
                                  <span>{child.title}</span>
                                </SidebarMenuButton>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </SidebarMenuItem>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <NavLink to={item.url} end>
                        {({ isActive }) => (
                          <SidebarMenuButton isActive={isActive}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {visibleSections.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No menu items available for your role
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
