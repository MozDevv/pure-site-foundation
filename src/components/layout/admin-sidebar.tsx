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
  Shield,
  Award,
  ClipboardCheck,
  ArrowUpCircle,
  Code2,
  Route,
  HeadphonesIcon,
  BarChart3,
  Kanban,
  Brain,
  FileSpreadsheet,
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
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { useState } from 'react';
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// You should get this from auth context / token / zustand / redux
// Example shape: { role: "Admin", roleId: "131", ... }

// Helper function to get navigation sections based on user role
export const getNavigationSections = (userRole?: string) => {
  // Normalize to lowercase for case-insensitive comparison
  // Backend may return "STUDENT", "Student", or "student"
  const role = (userRole || '').toLowerCase();
  const isStudent  = role === 'student';
  const isTutor    = role === 'tutor';
  const isMentor   = role === 'mentor';
  const isReviewer = role === 'reviewer';
  const isAdmin    = role === 'admin' || role === 'super_admin';

  // Base path per role — Mentor shares /tutor routes
  const basePath = isStudent ? '/student' : isAdmin ? '/admin' : '/tutor';

  // ── Student sections ──────────────────────────────────────────────────────
  if (isStudent) {
    return [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', url: '/student', icon: Home },
          { title: 'Courses', url: '/student/courses', icon: BookOpen },
          { title: 'Course Materials', icon: Blocks, children: [
            { title: 'Learning Hub', url: '/student/module-builder', icon: BookOpen },
            { title: 'Resource Library', url: '/student/module-builder/resource-library', icon: BookOpen },
          ]},
          { title: 'Assessments', icon: LayoutGrid, children: [
            { title: 'Overview', url: '/student/assessments', icon: LayoutGrid },
            { title: 'Assignments', url: '/student/assessments/assignments', icon: FileText },
            { title: 'Quizzes', url: '/student/assessments/quizzes', icon: CheckSquare },
            { title: 'Submissions', url: '/student/assessments/submissions', icon: ClipboardList },
            { title: 'Grades & Performance', url: '/student/assessments/grades', icon: TrendingUp },
          ]},
          { title: 'Timetable', url: '/student/timetable', icon: Calendar },
        ],
      },
      {
        label: 'Communication',
        items: [
          { title: 'Chat Room', url: '/student/chat', icon: MessagesSquare },
          { title: 'Announcements', url: '/student/chat/announcements', icon: MessageCircle },
          { title: 'Discussion Forum', url: '/student/forum', icon: MessagesSquare },
        ],
      },
      {
        label: 'Mentorship',
        items: [
          { title: 'Mentorship Overview', url: '/student/mentorship', icon: LayoutGrid },
          { title: 'Find a Mentor', url: '/student/mentorship/find', icon: UserCheck },
          { title: 'My Mentor', url: '/student/mentorship/my-mentor', icon: Users },
          { title: 'My Sessions', url: '/student/mentorship/sessions', icon: Video },
        ],
      },
      {
        label: 'Innovation',
        items: [
          { title: 'Innovation Hub', url: '/student/innovation', icon: Home },
          { title: 'Teams & Clubs', url: '/student/innovation/teams', icon: Users },
          { title: 'Kanban Board', url: '/student/kanban', icon: Kanban },
          { title: 'Projects & Ideas', url: '/student/innovation/projects', icon: FileText },
          { title: 'Submissions & Reviews', url: '/student/innovation/reviews', icon: CheckSquare },
          { title: 'Events & Challenges', url: '/student/innovation/events', icon: Trophy },
        ],
      },
      {
        label: 'Engagement',
        items: [
          { title: 'Leaderboard', url: '/student/leaderboard', icon: Trophy },
          { title: 'Certificates', url: '/student/certificates', icon: Award },
          { title: 'Attendance', url: '/student/attendance', icon: ClipboardCheck },
        ],
      },
      {
        label: 'Tools',
        items: [
          { title: 'Code Playground', url: '/student/code-playground', icon: Code2 },
          { title: 'Learning Paths', url: '/student/learning-paths', icon: Route },
          { title: 'Support', url: '/student/support', icon: HeadphonesIcon },
        ],
      },
      {
        label: 'Settings',
        items: [
          { title: 'Settings', url: '/student/settings', icon: Settings },
          { title: 'Role Upgrade', url: '/student/role-upgrade', icon: ArrowUpCircle },
        ],
      },
    ];
  }

  // ── Tutor sections ────────────────────────────────────────────────────────
  if (isTutor) {
    return [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', url: '/tutor', icon: Home },
          { title: 'Courses', url: '/tutor/courses', icon: BookOpen },
          { title: 'Course Materials', icon: Blocks, children: [
            { title: 'Learning Hub', url: '/tutor/module-builder', icon: BookOpen },
            { title: 'Resource Library', url: '/tutor/module-builder/resource-library', icon: BookOpen },
          ]},
          { title: 'Assessments', icon: LayoutGrid, children: [
            { title: 'Overview', url: '/tutor/assessments', icon: LayoutGrid },
            { title: 'Assignments', url: '/tutor/assessments/assignments', icon: FileText },
            { title: 'Quizzes', url: '/tutor/assessments/quizzes', icon: CheckSquare },
            { title: 'Submissions', url: '/tutor/assessments/submissions', icon: ClipboardList },
            { title: 'Grades & Performance', url: '/tutor/assessments/grades', icon: TrendingUp },
          ]},
          { title: 'Timetable', url: '/tutor/timetable', icon: Calendar },
        ],
      },
      {
        label: 'Communication',
        items: [
          { title: 'Chat Room', url: '/tutor/chat', icon: MessagesSquare },
          { title: 'Announcements', url: '/tutor/chat/announcements', icon: MessageCircle },
          { title: 'Discussion Forum', url: '/tutor/forum', icon: MessagesSquare },
        ],
      },
      {
        label: 'Mentorship',
        items: [
          { title: 'Mentorship Overview', url: '/tutor/mentorship', icon: LayoutGrid },
          { title: 'My Mentees', url: '/tutor/mentorship/my-mentees', icon: UserCheck },
          { title: 'My Sessions', url: '/tutor/mentorship/my-sessions', icon: Video },
          { title: 'Mentor Profiles', url: '/tutor/mentorship/mentors', icon: Users },
          { title: 'Mentee Requests', url: '/tutor/mentorship/requests', icon: ClipboardList },
          { title: 'Matching', url: '/tutor/mentorship/matching', icon: GitMerge },
          { title: 'Find a Mentor', url: '/tutor/mentorship/find', icon: UserCheck },
        ],
      },
      {
        label: 'Innovation',
        items: [
          { title: 'Innovation Hub', url: '/tutor/innovation', icon: Home },
          { title: 'Teams & Clubs', url: '/tutor/innovation/teams', icon: Users },
          { title: 'Kanban Board', url: '/tutor/kanban', icon: Kanban },
          { title: 'Projects & Ideas', url: '/tutor/innovation/projects', icon: FileText },
          { title: 'Submissions & Reviews', url: '/tutor/innovation/reviews', icon: CheckSquare },
          { title: 'Events & Challenges', url: '/tutor/innovation/events', icon: Trophy },
        ],
      },
      {
        label: 'Engagement',
        items: [
          { title: 'Leaderboard', url: '/tutor/leaderboard', icon: Trophy },
          { title: 'Certificates', url: '/tutor/certificates', icon: Award },
          { title: 'Attendance', url: '/tutor/attendance', icon: ClipboardCheck },
        ],
      },
      {
        label: 'Tools',
        items: [
          { title: 'Code Playground', url: '/tutor/code-playground', icon: Code2 },
          { title: 'Learning Paths', url: '/tutor/learning-paths', icon: Route },
          { title: 'Coding Assignments', url: '/tutor/coding-assignments', icon: Code2 },
          { title: 'Reports', url: '/tutor/reports', icon: BarChart3 },
          { title: 'Learner Analytics', url: '/tutor/analytics', icon: Brain },
          { title: 'Support', url: '/tutor/support', icon: HeadphonesIcon },
        ],
      },
      {
        label: 'Settings',
        items: [
          { title: 'Settings', url: '/tutor/settings', icon: Settings },
          { title: 'Role Upgrade', url: '/tutor/role-upgrade', icon: ArrowUpCircle },
        ],
      },
    ];
  }

  // ── Mentor sections ───────────────────────────────────────────────────────
  if (isMentor) {
    return [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', url: '/tutor', icon: Home },
          { title: 'Courses', url: '/tutor/courses', icon: BookOpen },
          { title: 'Course Materials', icon: Blocks, children: [
            { title: 'Learning Hub', url: '/tutor/module-builder', icon: BookOpen },
            { title: 'Resource Library', url: '/tutor/module-builder/resource-library', icon: BookOpen },
          ]},
          { title: 'Assessments', icon: LayoutGrid, children: [
            { title: 'Overview', url: '/tutor/assessments', icon: LayoutGrid },
            { title: 'Assignments', url: '/tutor/assessments/assignments', icon: FileText },
            { title: 'Quizzes', url: '/tutor/assessments/quizzes', icon: CheckSquare },
            { title: 'Submissions', url: '/tutor/assessments/submissions', icon: ClipboardList },
            { title: 'Grades & Performance', url: '/tutor/assessments/grades', icon: TrendingUp },
          ]},
          { title: 'Timetable', url: '/tutor/timetable', icon: Calendar },
        ],
      },
      {
        label: 'Communication',
        items: [
          { title: 'Chat Room', url: '/tutor/chat', icon: MessagesSquare },
          { title: 'Announcements', url: '/tutor/chat/announcements', icon: MessageCircle },
          { title: 'Discussion Forum', url: '/tutor/forum', icon: MessagesSquare },
        ],
      },
      {
        label: 'Mentorship',
        items: [
          { title: 'Mentorship Overview', url: '/tutor/mentorship', icon: LayoutGrid },
          { title: 'My Mentees', url: '/tutor/mentorship/my-mentees', icon: UserCheck },
          { title: 'My Sessions', url: '/tutor/mentorship/my-sessions', icon: Video },
          { title: 'Mentee Requests', url: '/tutor/mentorship/requests', icon: ClipboardList },
          { title: 'Matching', url: '/tutor/mentorship/matching', icon: GitMerge },
        ],
      },
      {
        label: 'Innovation',
        items: [
          { title: 'Innovation Hub', url: '/tutor/innovation', icon: Home },
          { title: 'Teams & Clubs', url: '/tutor/innovation/teams', icon: Users },
          { title: 'Kanban Board', url: '/tutor/kanban', icon: Kanban },
          { title: 'Projects & Ideas', url: '/tutor/innovation/projects', icon: FileText },
          { title: 'Events & Challenges', url: '/tutor/innovation/events', icon: Trophy },
        ],
      },
      {
        label: 'Tools',
        items: [
          { title: 'Support', url: '/tutor/support', icon: HeadphonesIcon },
        ],
      },
      {
        label: 'Settings',
        items: [
          { title: 'Settings', url: '/tutor/settings', icon: Settings },
        ],
      },
    ];
  }

  // ── Reviewer sections ─────────────────────────────────────────────────────
  if (isReviewer) {
    return [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', url: '/tutor', icon: Home },
          { title: 'Timetable', url: '/tutor/timetable', icon: Calendar },
        ],
      },
      {
        label: 'Communication',
        items: [
          { title: 'Chat Room', url: '/tutor/chat', icon: MessagesSquare },
          { title: 'Announcements', url: '/tutor/chat/announcements', icon: MessageCircle },
          { title: 'Discussion Forum', url: '/tutor/forum', icon: MessagesSquare },
        ],
      },
      {
        label: 'Innovation',
        items: [
          { title: 'Innovation Hub', url: '/tutor/innovation', icon: Home },
          { title: 'Teams & Clubs', url: '/tutor/innovation/teams', icon: Users },
          { title: 'Kanban Board', url: '/tutor/kanban', icon: Kanban },
          { title: 'Projects & Ideas', url: '/tutor/innovation/projects', icon: FileText },
          { title: 'Submissions & Reviews', url: '/tutor/innovation/reviews', icon: CheckSquare },
          { title: 'Events & Challenges', url: '/tutor/innovation/events', icon: Trophy },
        ],
      },
      {
        label: 'Tools',
        items: [
          { title: 'Reports', url: '/tutor/reports', icon: BarChart3 },
          { title: 'Learner Analytics', url: '/tutor/analytics', icon: Brain },
          { title: 'Support', url: '/tutor/support', icon: HeadphonesIcon },
        ],
      },
      {
        label: 'Settings',
        items: [
          { title: 'Settings', url: '/tutor/settings', icon: Settings },
        ],
      },
    ];
  }

  // ── Admin / SuperAdmin sections ───────────────────────────────────────────
  return [
    {
      label: 'Main',
      items: [
        { title: 'Dashboard', url: '/admin', icon: Home },
        { title: 'Users', url: '/admin/users', icon: Users },
        { title: 'Courses', url: '/admin/courses', icon: BookOpen },
        { title: 'Course Materials', icon: Blocks, children: [
          { title: 'Learning Hub', url: '/admin/module-builder', icon: BookOpen },
          { title: 'Resource Library', url: '/admin/module-builder/resource-library', icon: BookOpen },
        ]},
        { title: 'Assessments', icon: LayoutGrid, children: [
          { title: 'Overview', url: '/admin/assessments', icon: LayoutGrid },
          { title: 'Assignments', url: '/admin/assessments/assignments', icon: FileText },
          { title: 'Quizzes', url: '/admin/assessments/quizzes', icon: CheckSquare },
          { title: 'Submissions', url: '/admin/assessments/submissions', icon: ClipboardList },
          { title: 'Grades & Performance', url: '/admin/assessments/grades', icon: TrendingUp },
        ]},
        { title: 'Timetable', url: '/admin/timetable', icon: Calendar },
      ],
    },
    {
      label: 'Communication',
      items: [
        { title: 'Chat Room', url: '/admin/chat', icon: MessagesSquare },
        { title: 'Announcements', url: '/admin/chat/announcements', icon: MessageCircle },
        { title: 'Discussion Forum', url: '/admin/forum', icon: MessagesSquare },
      ],
    },
    {
      label: 'Mentorship',
      items: [
        { title: 'Mentorship Overview', url: '/admin/mentorship', icon: LayoutGrid },
        { title: 'Mentor Profiles', url: '/admin/mentorship/mentors', icon: Users },
        { title: 'Mentee Requests', url: '/admin/mentorship/requests', icon: ClipboardList },
        { title: 'Matching', url: '/admin/mentorship/matching', icon: GitMerge },
        { title: 'Mentorship Sessions', url: '/admin/mentorship/sessions', icon: Video },
      ],
    },
    {
      label: 'Innovation',
      items: [
        { title: 'Innovation Hub', url: '/admin/innovation', icon: Home },
        { title: 'Teams & Clubs', url: '/admin/innovation/teams', icon: Users },
        { title: 'Kanban Board', url: '/admin/kanban', icon: Kanban },
        { title: 'Projects & Ideas', url: '/admin/innovation/projects', icon: FileText },
        { title: 'Submissions & Reviews', url: '/admin/innovation/reviews', icon: CheckSquare },
        { title: 'Events & Challenges', url: '/admin/innovation/events', icon: Trophy },
      ],
    },
    {
      label: 'Engagement',
      items: [
        { title: 'Leaderboard', url: '/admin/leaderboard', icon: Trophy },
        { title: 'Certificates', url: '/admin/certificates', icon: Award },
        { title: 'Attendance', url: '/admin/attendance', icon: ClipboardCheck },
      ],
    },
    {
      label: 'Tools',
      items: [
        { title: 'Code Playground', url: '/admin/code-playground', icon: Code2 },
        { title: 'Learning Paths', url: '/admin/learning-paths', icon: Route },
        { title: 'Coding Assignments', url: '/admin/coding-assignments', icon: Code2 },
        { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
        { title: 'Learner Analytics', url: '/admin/analytics', icon: Brain },
        { title: 'Support Dashboard', url: '/admin/support', icon: HeadphonesIcon },
        { title: 'Google Form Enrollments', url: '/admin/google-form-enrollments', icon: FileSpreadsheet },
      ],
    },
    {
      label: 'Settings',
      items: [
        { title: 'Audit Logs', url: '/admin/audit-logs', icon: Shield },
        { title: 'Settings', url: '/admin/settings', icon: Settings },
        { title: 'Menu Setups', url: '/admin/menu-setups', icon: Video },
        { title: 'Role Upgrade', url: '/admin/role-upgrade', icon: ArrowUpCircle },
      ],
    },
  ];
};
export function AdminSidebar() {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const { isMobile, setOpenMobile, state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Close sidebar sheet on mobile when a nav item is clicked
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;
  const userRole = user?.role;

  // Get navigation sections based on user role
  const navigationSections = getNavigationSections(userRole);
  const roleId = user?.roleId;

  // Use React Query for menu loading with caching to avoid refetching on every navigation
  const { data: allowedMenus = new Set<string>(), isLoading: loading } = useQuery({
    queryKey: ['role-menus', roleId],
    queryFn: async () => {
      const res = await apiService.get(endpoints.getMenusByRole(roleId));
      const menuNames = res.data?.map((m: any) => m.name) || [];
      return new Set<string>(menuNames);
    },
    enabled: !!roleId,
    staleTime: 10 * 60 * 1000, // Cache menus for 10 minutes
    gcTime: 30 * 60 * 1000,
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Helper: check if this menu item is allowed.
  // When no menus are configured in DB (empty Set), show everything (fallback = all allowed).
  const isAllowed = (title: string) => allowedMenus.size === 0 || allowedMenus.has(title);

  // Filter sections — only keep those with at least one allowed item.
  // For parent items that have children, show the parent if ANY child is allowed
  // (the parent itself doesn't need to be in the DB as a separate menu entry).
  const visibleSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (item.children) {
            const allowedChildren = item.children.filter((child) =>
              isAllowed(child.title)
            );
            // Show parent if all menus allowed (size=0) OR if at least one child is allowed
            if (allowedMenus.size === 0) return item;
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
        <SidebarContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" />
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
                    // ── Parent item with children ──────────────────────────
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => !isCollapsed && toggleMenu(item.title)}
                        className="cursor-pointer"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1 text-left truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                        {!isCollapsed && (
                          openMenus[item.title]
                            ? <ChevronDown className="h-4 w-4 shrink-0 ml-auto" />
                            : <ChevronRight className="h-4 w-4 shrink-0 ml-auto" />
                        )}
                      </SidebarMenuButton>

                      {!isCollapsed && openMenus[item.title] && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                          {item.children.map((child) => (
                            <NavLink to={child.url} end key={child.title} onClick={closeMobileSidebar}>
                              {({ isActive }) => (
                                <SidebarMenuButton isActive={isActive} tooltip={child.title} size="sm">
                                  <child.icon className="h-4 w-4 shrink-0" />
                                  <span className="truncate group-data-[collapsible=icon]:hidden">
                                    {child.title}
                                  </span>
                                </SidebarMenuButton>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </SidebarMenuItem>
                  ) : (
                    // ── Regular item ───────────────────────────────────────
                    <SidebarMenuItem key={item.title}>
                      <NavLink to={item.url} end onClick={closeMobileSidebar}>
                        {({ isActive }) => (
                          <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
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
      <SidebarFooter>
        <SidebarCollapseButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/**
 * Collapse/expand toggle button shown at the bottom of the sidebar.
 * Uses the sidebar context to read the current state.
 */
function SidebarCollapseButton() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
      title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {isCollapsed ? (
        <PanelLeft className="h-5 w-5 shrink-0" />
      ) : (
        <>
          <PanelLeftClose className="h-5 w-5 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">Collapse</span>
        </>
      )}
    </button>
  );
}
