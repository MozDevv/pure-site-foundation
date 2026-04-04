# Feature Map — TechAI LMS

A cross-reference of all platform features by user role.

| ✅ = Full Access | 👁 = View Only | ❌ = No Access | ⭐ = Unique to Role |

## Core Features

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Profile & Settings | ✅ | ✅ | ✅ |
| Theme Toggle | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |
| Onboarding Tour | ✅ | ✅ | ✅ |
| Floating AI Chat | ✅ | ✅ | ✅ |

## Courses & Learning

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| View Courses | ✅ | ✅ | ✅ |
| Create/Edit Courses | ❌ | ✅ | ✅ |
| Module Builder | ❌ | ✅ | ✅ |
| Resource Library | ❌ | ✅ | ✅ |
| Learning Paths | ✅ (follow) | ✅ (create) | ✅ (create/publish) |
| Code Playground | ✅ | ✅ | ✅ |

## Assessments

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| View Assignments | ✅ | ✅ | ✅ |
| Submit Assignments | ✅ | ❌ | ❌ |
| Create Assignments | ❌ | ✅ | ✅ |
| View Quizzes | ✅ | ✅ | ✅ |
| Take Quizzes | ✅ | ❌ | ❌ |
| Create Quizzes | ❌ | ✅ | ✅ |
| View Submissions | 👁 (own) | ✅ (all) | ✅ (all) |
| Grade Submissions | ❌ | ✅ | ✅ |
| Grades & Performance | 👁 (own) | ✅ (analytics) | ✅ (platform-wide) |
| Coding Assignments | ✅ (submit) | ✅ (create/grade) | ✅ (manage) |

## Communication

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| Chat Room | ✅ | ✅ | ✅ |
| Announcements | 👁 | ✅ (create) | ✅ (create) |
| Discussion Forum | ✅ | ✅ | ✅ (moderate) |
| Video Meetings | ✅ (join) | ✅ (join) | ✅ (create/join) |

## Mentorship

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| Find Mentor | ✅ | ❌ | ✅ |
| My Mentor | ✅ ⭐ | ❌ | ❌ |
| My Mentees | ❌ | ✅ ⭐ | ❌ |
| My Sessions | ✅ | ✅ | ❌ |
| Mentor Profiles | ❌ | ❌ | ✅ |
| Mentee Requests | ❌ | ❌ | ✅ |
| Matching Config | ❌ | ❌ | ✅ ⭐ |
| Groups | ❌ | ❌ | ✅ |
| All Sessions | ❌ | ❌ | ✅ |

## Innovation Hub

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| Innovation Overview | ✅ | ✅ | ✅ |
| Teams & Clubs | ✅ | ✅ | ✅ (manage) |
| Projects & Ideas | ✅ | ✅ | ✅ |
| Submissions & Reviews | ✅ | ✅ | ✅ (approve) |
| Events & Challenges | ✅ | ✅ | ✅ (create) |

## Gamification & Records

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| Leaderboard | ✅ | ✅ | ✅ |
| Certificates | 👁 (own) | ❌ | ✅ (issue) |
| Attendance | 👁 (own) | ✅ (record) | ✅ (all) |

## Administration

| Feature | Student | Tutor | Admin |
|---------|---------|-------|-------|
| User Management | ❌ | ✅ (limited) | ✅ (full) |
| Reports | ❌ | ✅ | ✅ |
| Support Dashboard | ❌ | ❌ | ✅ ⭐ |
| Audit Logs | ❌ | ❌ | ✅ ⭐ |
| System Settings | ❌ | ❌ | ✅ ⭐ |
| Maintenance Mode | ❌ | ❌ | ✅ ⭐ |
| Menu Setups | ❌ | ❌ | ✅ ⭐ |
| Role Upgrade | ❌ | ❌ | ✅ ⭐ |

## Cross-Cutting: Mentor Role

The **Mentor** role is not a standalone sidebar role — it is an overlay on top of **Student** or **Tutor**:

| Base Role | Gains Access To |
|-----------|-----------------|
| Student + Mentor | My Mentees, Groups, Session scheduling |
| Tutor + Mentor | My Mentees, Groups, Session scheduling |
| Admin | Always has full mentorship management |

See [MENTOR.md](MENTOR.md) for detailed mentor documentation.

## Notes

- **Sidebar filtering** is dual-layered:
  1. `getNavigationSections(userRole)` generates the role-specific menu structure
  2. `getMenusByRole(roleId)` API call further filters which menu items are visible
- Admins can customize role menus via **Menu Setups** (`/admin/menu-setups`)
- The base route prefix changes per role: `/student/*`, `/tutor/*`, `/admin/*`
