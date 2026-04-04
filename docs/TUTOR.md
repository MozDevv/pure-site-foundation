# Tutor Role — TechAI LMS

## Overview
Tutors are instructors responsible for teaching courses, creating assignments/quizzes, grading student submissions, and managing course content. They also have mentoring capabilities and access to reporting tools.

## Dashboard
- **Route**: `/tutor`
- **Component**: `TutorDashboard`
- Welcome banner with teaching stats
- Quick stats: active courses, pending submissions, upcoming sessions, student count
- Recent submissions requiring review, upcoming events

## Sidebar Navigation

### Main
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/tutor` | Teaching overview with stats |
| Users | `/admin/users` | View user list (shared with admin) |
| Courses | `/tutor/courses` | Manage courses, enroll/remove students |
| Learning Hub | `/tutor/module-builder` | Create/edit course modules, lessons |
| Resource Library | `/tutor/module-builder/resource-library` | Upload/manage teaching resources |
| Assessments Overview | `/tutor/assessments` | Assessment management dashboard |
| Assignments | `/tutor/assessments/assignments` | Create/manage assignments |
| Create Assignment | `/tutor/assessments/assignments/create` | Assignment builder |
| Quizzes | `/tutor/assessments/quizzes` | Create/manage quizzes |
| Create Quiz | `/tutor/assessments/quizzes/create` | Quiz builder |
| Submissions | `/tutor/assessments/submissions` | Review student submissions |
| Submission Review | `/tutor/assessments/submissions/:id` | Detailed submission grading |
| Grades & Performance | `/tutor/assessments/grades` | Grade analytics dashboard |
| Timetable | `/tutor/timetable` | Calendar with events and meetings |

### Communication
| Feature | Route | Description |
|---------|-------|-------------|
| Chat Room | `/tutor/chat` | Real-time messaging with students |
| Announcements | `/tutor/chat/announcements` | Create/view announcements |
| Discussion Forum | `/tutor/forum` | Moderate and participate in discussions |

### Mentorship
| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/tutor/mentorship` | Mentorship overview stats |
| My Mentees | `/tutor/mentorship/my-mentees` | View assigned mentees |
| My Sessions | `/tutor/mentorship/my-sessions` | Schedule/view sessions |
| Mentor Profiles | `/tutor/mentorship/mentors` | Browse other mentors |
| Mentee Requests | `/tutor/mentorship/requests` | Accept/decline mentee requests |
| Matching | `/tutor/mentorship/matching` | Mentor-mentee matching tools |
| Find a Mentor | `/tutor/mentorship/find` | Find a mentor for themselves |

### Innovation
| Feature | Route | Description |
|---------|-------|-------------|
| Innovation Hub | `/tutor/innovation` | Project/team dashboard |
| Teams & Clubs | `/tutor/innovation/teams` | Create/manage teams |
| Projects & Ideas | `/tutor/innovation/projects` | Review/submit projects |
| Submissions & Reviews | `/tutor/innovation/reviews` | Review student project submissions |
| Events & Challenges | `/tutor/innovation/events` | Create/manage events |
| Leaderboard | `/tutor/leaderboard` | View student rankings |
| Certificates | `/tutor/certificates` | View/issue certificates |
| Attendance | `/tutor/attendance` | Record/view student attendance |

### Tools
| Feature | Route | Description |
|---------|-------|-------------|
| Code Playground | `/tutor/code-playground` | Test code examples |
| Coding Assignments | `/tutor/coding-assignments` | Create autograded coding tasks |
| Learning Paths | `/tutor/learning-paths` | Create structured learning tracks |
| Reports | `/tutor/reports` | Generate course/student reports |
| Support | `/tutor/support` | Submit support tickets |
| Settings | `/tutor/settings` | Teaching preferences, office hours |
| Role Upgrade | `/tutor/role-upgrade` | Request Admin role |

## Key Capabilities

### Course Management
- Create and edit courses with descriptions, tags, and thumbnails
- Add/remove students and co-tutors
- Organize course modules with the Learning Hub
- Upload resources to the Resource Library

### Assessment Creation
- **Assignments**: Rich text descriptions, file attachments, deadlines, scoring rubrics
- **Quizzes**: MCQ, true/false, short answer, timed quizzes with auto-grading
- **Coding Assignments**: Code problems with test cases, auto-graded via Piston

### Grading
- Review submissions with inline feedback
- Assign scores and marks
- Track student progress via Grades & Performance dashboard
- Auto-grading for quizzes and coding assignments

### Mentoring
- Accept mentee requests from students
- Schedule 1-on-1 mentoring sessions
- Track mentee progress and provide guidance
- Also has the option to find a mentor themselves

## Interactions

### With Students
- Direct instruction through courses and modules
- Grade assignments and provide feedback
- Communicate via chat and announcements
- Monitor attendance and participation
- Mentor matched students

### With Admins
- Receive platform announcements
- Report issues via support tickets
- Tutors can access `/admin/users` for user visibility
- Share admin routes for course management

### With Other Tutors
- Collaborate on shared courses
- View other mentor profiles
- Participate in the discussion forum
