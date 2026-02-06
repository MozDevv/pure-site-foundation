import {
  BookOpen,
  MessageCircle,
  Award,
  User,
  Settings,
  Home,
  Calendar,
  UserCheck,
  Users,
  Video,
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

const navigationSections = [
  {
    label: 'Student Portal',
    items: [
      { title: 'Dashboard', url: '/student', icon: Home },
      { title: 'Courses', url: '/student/courses', icon: BookOpen },
      { title: 'Timetable', url: '/student/timetable', icon: Calendar },
      { title: 'Messages', url: '/student/messages', icon: MessageCircle },
    ],
  },
  {
    label: 'Mentorship',
    items: [
      { title: 'Find a Mentor', url: '/student/mentorship', icon: UserCheck },
      { title: 'My Mentor', url: '/student/mentorship/my-mentor', icon: Users },
      {
        title: 'My Sessions',
        url: '/student/mentorship/sessions',
        icon: Video,
      },
    ],
  },
  {
    label: 'Settings',
    items: [{ title: 'Settings', url: '/student/settings', icon: Settings }],
  },
];

export function StudentSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {navigationSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
