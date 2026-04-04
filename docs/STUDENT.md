# Student Role — TechAI LMS

## Overview
Students are the primary learners on the platform. They enroll in courses, complete assignments and quizzes, participate in innovation projects, and engage with mentors and peers.

## Dashboard
- **Route**: `/student`
- **Component**: `StudentDashboard`
- Welcome banner with personalized greeting and progress stats
- Quick stats: enrolled courses, completed assignments, upcoming events, current streak
- Upcoming events list, recent announcements, quick action buttons

## Sidebar Navigation

### Main
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/student` | Landing page with overview stats |
| Courses | `/student/courses` | View enrolled courses, browse available courses |
| Learning Hub | `/student/module-builder` | Access course modules, lessons, video content |
| Resource Library | `/student/module-builder/resource-library` | Download/upload shared learning materials |
| Assessments Overview | `/student/assessments` | Central assessment dashboard |
| Assignments | `/student/assessments/assignments` | View/submit assignments |
| Quizzes | `/student/assessments/quizzes` | Take quizzes |
| Submissions | `/student/assessments/submissions` | Track submitted work |
| Grades & Performance | `/student/assessments/grades` | View grades and analytics |
| Timetable | `/student/timetable` | Calendar with events, meetings, scheduling |

### Communication
| Feature | Route | Description |
|---------|-------|-------------|
| Chat Room | `/student/chat` | Real-time messaging with Firestore backend |
| Announcements | `/student/chat/announcements` | View course/platform announcements |
| Discussion Forum | `/student/forum` | Post questions, discuss topics with peers |

### Mentorship
| Feature | Route | Description |
|---------|-------|-------------|
| Find a Mentor | `/student/mentorship` | Browse and request mentors |
| My Mentees | `/student/mentorship/my-mentees` | If student is also a peer mentor |
| My Mentor | `/student/mentorship/my-mentor` | View assigned mentor details |
| My Sessions | `/student/mentorship/sessions` | Schedule/view mentorship sessions |

### Innovation
| Feature | Route | Description |
|---------|-------|-------------|
| Innovation Hub | `/student/innovation` | Dashboard for projects and teams |
| Teams & Clubs | `/student/innovation/teams` | Join/create teams |
| Projects & Ideas | `/student/innovation/projects` | Browse/submit project ideas |
| Submissions & Reviews | `/student/innovation/reviews` | Review project submissions |
| Events & Challenges | `/student/innovation/events` | Participate in hackathons/challenges |
| Leaderboard | `/student/leaderboard` | Gamification ranking |
| Certificates | `/student/certificates` | View earned certificates |
| Attendance | `/student/attendance` | Check-in/check-out, attendance history |

### Tools
| Feature | Route | Description |
|---------|-------|-------------|
| Code Playground | `/student/code-playground` | Run code in 40+ languages (Piston API) |
| Learning Paths | `/student/learning-paths` | Follow structured learning tracks |
| Support | `/student/support` | Submit help tickets, browse knowledge base |
| Settings | `/student/settings` | Profile, notifications, appearance, privacy |
| Role Upgrade | `/student/role-upgrade` | Request promotion to Tutor role |

## Key Interactions

### With Tutors
- Students see tutors as course instructors
- Assignment submissions are reviewed/graded by tutors
- Can message tutors via Chat
- Receive announcements created by tutors

### With Mentors
- Students can request a mentor from the Find Mentor page
- Once matched, they see their mentor's profile under My Mentor
- Can schedule 1-on-1 sessions via the Sessions page
- Mentors provide guidance outside of formal course structure

### With Admins
- Admins approve student registrations (or auto-approve if configured)
- Admins manage platform-wide settings that affect student experience
- Students can submit support tickets to admins

### With Other Students
- Collaborate via Chat Room and Discussion Forum
- Team up for Innovation Hub projects
- Compete on the Leaderboard
- Peer review in project submissions

## Gamification
- **Points**: Earned for completing assignments, quizzes, attendance, forum participation
- **Badges**: Awarded for milestones (first assignment, streak records, quiz scores)
- **Leaderboard**: Ranked by total points with streak multipliers
- **Certificates**: Issued upon course completion

## Notifications
Students receive real-time notifications for:
- New assignments posted
- Grades published
- Upcoming events/meetings
- Mentor session reminders
- Announcements from tutors/admin
- Chat messages (via Firestore + WebSocket)
