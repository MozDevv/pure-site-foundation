# Mentor Role — TechAI LMS

## Overview
Mentors are experienced individuals (can be tutors or senior students) who guide students through personalized 1-on-1 or group mentoring. Mentoring is a **cross-cutting role** — a user can be both a Student and a Mentor, or a Tutor and a Mentor.

## How Mentoring Works

### Becoming a Mentor
1. Any authenticated user can indicate they are available as a mentor through their profile
2. Mentors set their expertise areas, availability, and mentoring style
3. The system includes a mentor-mentee matching algorithm

### Mentor-Mentee Flow
1. **Student requests a mentor** via Find Mentor page
2. **Mentor receives the request** in Mentee Requests
3. **Mentor accepts/declines** the request
4. **Once matched**, both see each other in their respective views
5. **Sessions are scheduled** through the Sessions interface
6. **Jitsi video calls** can be initiated for virtual meetings

## Features

### For Mentors (Tutor-based)
| Feature | Route | Description |
|---------|-------|-------------|
| My Mentees | `/tutor/mentorship/my-mentees` | View all assigned mentees with progress |
| My Sessions | `/tutor/mentorship/my-sessions` | Schedule and manage mentoring sessions |
| Mentor Profiles | `/tutor/mentorship/mentors` | Browse other mentor profiles |
| Mentee Requests | `/tutor/mentorship/requests` | Accept/decline incoming mentee requests |
| Matching | `/tutor/mentorship/matching` | Smart matching algorithm for pairing |

### For Mentors (Student-based / Peer Mentoring)
| Feature | Route | Description |
|---------|-------|-------------|
| Find a Mentor | `/student/mentorship` | Browse and request a mentor |
| My Mentees | `/student/mentorship/my-mentees` | If acting as peer mentor |
| My Mentor | `/student/mentorship/my-mentor` | View assigned mentor details |
| My Sessions | `/student/mentorship/sessions` | Scheduled sessions |

### For Admin (Management)
| Feature | Route | Description |
|---------|-------|-------------|
| Mentorship Dashboard | `/admin/mentorship` | Overview of all mentoring activity |
| Mentor Profiles | `/admin/mentorship/mentors` | Manage all mentor profiles |
| Mentee Requests | `/admin/mentorship/requests` | View/manage all requests |
| Matching | `/admin/mentorship/matching` | Oversee mentor-mentee matching |
| Groups | `/admin/mentorship/groups` | Create/manage mentor groups |
| Sessions | `/admin/mentorship/sessions` | View all mentoring sessions |

## Mentoring Groups
- Admins and tutors can create mentoring groups
- A mentor is assigned to a group of students
- Group sessions can be scheduled
- Progress tracking at the group level

## Sessions
- Sessions are scheduled events with date, time, and optional location
- Virtual sessions use Jitsi Meet integration
- Sessions appear on both mentor's and mentee's timetable
- Reminders are sent via notifications

## Key Interactions

### Mentor → Student
- Provide guidance on course work and projects
- Review progress and set learning goals
- Conduct regular 1-on-1 or group sessions
- Share resources and recommendations

### Mentor → Admin
- Admin oversees all mentoring activity
- Admin can reassign mentees if needed
- Admin manages the matching algorithm settings

### Mentor → Innovation Hub
- Mentors can guide innovation projects
- Provide feedback on project submissions
- Judge hackathon/challenge entries

## API Endpoints
The mentoring system uses dedicated API endpoints:
- `GET /mentors` — List all available mentors
- `POST /mentors/request` — Send a mentorship request
- `PUT /mentors/requests/:id/accept` — Accept a mentee request
- `GET /mentors/mentees` — View assigned mentees
- `POST /mentors/sessions` — Schedule a new session
- `GET /mentors/groups` — View mentoring groups
