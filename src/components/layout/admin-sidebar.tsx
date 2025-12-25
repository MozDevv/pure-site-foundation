import {
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Settings,
  Home,
  Calendar,
  Blocks,
  FileText,
  CheckSquare,
  Grid,
  Trophy,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
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
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const navigationSections = [
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
      { title: 'Timetable', url: '/admin/timetable', icon: Calendar },
      { title: 'Messages', url: '/admin/messages', icon: MessageSquare },
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
    items: [{ title: 'Settings', url: '/admin/settings', icon: Settings }],
  },
];

export function AdminSidebar() {
  // Track open state for expandable items
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="">
        {navigationSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="font-bold text-xs">
              {section.label.toUpperCase()}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) =>
                  item.children ? (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={openMenus[item.title]}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 bg-transparent border-0 outline-none"
                          onClick={() => toggleMenu(item.title)}
                          tabIndex={0}
                          style={{
                            cursor: 'pointer',
                            width: '100%',
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1 text-left">{item.title}</span>
                          <span className="ml-auto text-xs flex items-center">
                            {openMenus[item.title] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>
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
      </SidebarContent>
    </Sidebar>
  );
}
