# Admin Role — TechAI LMS

## Overview
Admins have full platform access and are responsible for managing users, configuring system settings, monitoring platform health, and overseeing all educational and innovation activities.

## Dashboard
- **Route**: `/admin`
- **Component**: `AdminDashboard`
- Welcome banner with platform-wide stats
- Quick stats: total users, active courses, pending approvals, support tickets
- System-wide activity feed, recent registrations, upcoming events

## Sidebar Navigation

### Main
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/admin` | Full platform overview with analytics |
| Users | `/admin/users` | Create/manage users, approve registrations, lock accounts |
| Courses | `/admin/courses` | Create/manage all courses |
| Learning Hub | `/admin/module-builder` | Create/edit all course modules |
| Resource Library | `/admin/module-builder/resource-library` | Manage all resources |
| Assessments | `/admin/assessments` | Full assessment management |
| Assignments | `/admin/assessments/assignments` | View/create all assignments |
| Quizzes | `/admin/assessments/quizzes` | View/create all quizzes |
| Submissions | `/admin/assessments/submissions` | Review all submissions |
| Grades & Performance | `/admin/assessments/grades` | Platform-wide grade analytics |
| Timetable | `/admin/timetable` | Manage all events and meetings |

### Communication
| Feature | Route | Description |
|---------|-------|-------------|
| Chat Room | `/admin/chat` | Participate in platform chat |
| Announcements | `/admin/chat/announcements` | Create platform-wide announcements |
| Discussion Forum | `/admin/forum` | Moderate forum, pin/lock threads |

### Mentorship
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/admin/mentorship` | Mentorship program overview |
| Find Mentor | `/admin/mentorship/find` | Browse mentor profiles |
| Mentor Profiles | `/admin/mentorship/mentors` | Manage mentor registrations |
| Mentee Requests | `/admin/mentorship/requests` | Oversee all match requests |
| Matching | `/admin/mentorship/matching` | Configure matching algorithm |
| Groups | `/admin/mentorship/groups` | Create/manage mentor groups |
| Sessions | `/admin/mentorship/sessions` | Monitor all mentoring sessions |

### Innovation
| Feature | Route | Description |
|---------|-------|-------------|
| Innovation Hub | `/admin/innovation` | Platform-wide innovation stats |
| Teams & Clubs | `/admin/innovation/teams` | Manage all teams |
| Projects & Ideas | `/admin/innovation/projects` | Review all projects |
| Submissions & Reviews | `/admin/innovation/reviews` | Approve/reject project submissions |
| Events & Challenges | `/admin/innovation/events` | Create/manage hackathons |
| Leaderboard | `/admin/leaderboard` | View/manage gamification rankings |
| Certificates | `/admin/certificates` | Issue/revoke certificates |
| Attendance | `/admin/attendance` | Platform-wide attendance records |

### Tools
| Feature | Route | Description |
|---------|-------|-------------|
| Code Playground | `/admin/code-playground` | Test code execution |
| Coding Assignments | `/admin/coding-assignments` | Manage autograded coding tasks |
| Learning Paths | `/admin/learning-paths` | Create/publish learning tracks |
| Reports | `/admin/reports` | Generate platform analytics reports |
| Support Dashboard | `/admin/support` | Manage support tickets, KB articles |

### Settings (Admin-Only)
| Feature | Route | Description |
|---------|-------|-------------|
| Audit Logs | `/admin/audit-logs` | View all user actions and system events |
| Settings | `/admin/settings` | Platform configuration, maintenance mode |
| Menu Setups | `/admin/menu-setups` | Configure role-based menu visibility |
| Role Upgrade | `/admin/role-upgrade` | Approve/reject role upgrade requests |

## Key Capabilities

### User Management
- **Approve/reject** new user registrations
- **Lock/unlock** user accounts
- **Create users** directly (bypassing registration)
- **View** user mentor profiles and details
- **Automatic approval**: Can configure auto-approve for student registrations in system settings

### System Configuration
- **Maintenance Mode**: Toggle maintenance mode to block non-admin users with a maintenance page
- **Maintenance Message**: Set custom message displayed during maintenance
- **System Settings**: Configure platform-wide settings by category (general, meetings, email)
- **Security Policies**: Password rules, session timeouts, 2FA settings
- **Feature Toggles**: Enable/disable platform modules (chat, forum, mentorship, etc.)

### Menu Management
- **Menu Setups** (`/admin/menu-setups`): Configure which sidebar items are visible for each role
- Uses API endpoint `POST /menus` to create menu entries
- Each menu is assigned to specific roles via `roleId`
- Changes take effect immediately for all users of that role

### Support & Helpdesk
- **Support Dashboard**: View all support tickets across the platform
- Assign tickets to team members
- Manage Knowledge Base articles (CRUD + seeding)
- Track ticket resolution stats

### Reporting
- **Report Builder**: Generate custom reports on courses, students, attendance
- Export reports in PDF/CSV format
- Analytics dashboard with charts and graphs

## Admin-Only Features
These features are exclusively available to Admin users:

| Feature | Description |
|---------|-------------|
| Maintenance Mode | Bring the system down for maintenance |
| Audit Logs | Full trail of all user actions |
| Menu Setups | Configure role-based sidebar visibility |
| Support Dashboard | Manage all support tickets |
| User Creation | Directly create user accounts |
| Certificate Issuance | Issue certificates to students |
| System Settings | Configure all platform-wide settings |
| Role Upgrade Approval | Approve/reject role change requests |

## Interactions

### With Students
- Approve student registrations (or configure auto-approve)
- Manage course enrollments
- Issue certificates for course completion
- Handle support tickets
- View student grades and attendance

### With Tutors
- Assign tutors to courses
- Monitor teaching quality via reports
- Handle role upgrade requests from students to tutor

### With Mentors
- Oversee mentoring program health
- Configure matching algorithm
- Create and manage mentor groups
- Monitor session completion rates

### With the System
- Configure maintenance windows
- Monitor system health via audit logs
- Manage security policies
- Toggle feature availability
