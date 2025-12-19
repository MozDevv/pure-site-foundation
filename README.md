Build a complete, beautiful admin dashboard module called "Innovation Hub" — a hackathon-style innovation platform integrated into an existing Learning Management System (LMS). The design should feel premium, modern, clean, and inspiring for education: use a calm professional color palette (primarily white, soft grays, deep blue accents #1e40af or #3b82f6), generous whitespace, subtle shadows, rounded cards, smooth hover effects, and clean typography. Use shadcn/ui components, Tailwind CSS, React, and Vite.

Important: Do NOT use Supabase or any real database/auth. Use only hardcoded dummy data and mock API endpoints (simulate async fetches with setTimeout returning static dummy data). Structure all dummy data EXACTLY according to the shapes below so it matches my future real database schema.

The app has two roles (simulate with a hardcoded currentUser object):

- Regular user: { id: 1, name: "Alex Chen", email: "alex@student.com", role: "student" }
- Admin/mentor: { id: 99, name: "Dr. Maria Garcia", email: "maria@admin.com", role: "admin" }
  Toggle between them easily for testing.

Authentication: Simple login page with email/password (dummy — accept any input, set currentUser to admin if email includes "admin", otherwise student).

Main sidebar navigation with these exact items under "Innovation Hub":

- Innovation Hub → /innovation → icon: Home
- Teams & Clubs → /innovation/teams → icon: Users
- Projects & Ideas → /innovation/projects → icon: FileText
- Submissions & Reviews → /innovation/reviews → icon: CheckSquare
- Events & Challenges → /innovation/events → icon: Trophy

All pages must use mock API functions (e.g., getTeams(), getProjects()) that return Promises resolving after 500ms with the structured dummy data below.

=== REQUIRED DUMMY DATA STRUCTURES ===

2. Teams (15 teams)
   Each team:
   {
   id: number,
   name: string,
   description: string,
   is_club: boolean (true for ongoing clubs),
   creator_id: number,
   max_members: number | null,
   looking_for_members: boolean,
   skills_needed: string[],
   created_at: "2025-..."
   }

3. Team Members (junction)
   Array of { team_id: , user_id: number, role: "leader" | "member", joined_at: string }

4. Projects (25+ projects)
   Each project:
   {
   id: number,
   title: string,
   description: string,
   problem_statement: string,
   solution_overview: string,
   tech_stack: string[], // e.g., ["React", "Firebase", "Tailwind"]
   is_public: boolean,
   status: "draft" | "submitted" | "approved" | "in_progress" | "completed",
   team_id: number | null, // null for solo drafts
   creator_id: number,
   created_at: string,
   updated_at: string
   }

5. Project Files (attachments)
   Array of {
   id: number,
   project_id: number,
   file_type: "image" | "document" | "link",
   url: string (use placeholder images or https://via.placeholder.com/400x300),
   description: string
   }

6. Approvals / Reviews
   Array of {
   id: number,
   project_id: number,
   reviewer_id: number,
   status: "pending" | "approved" | "revisions_needed" | "rejected",
   comments: string,
   score_innovation: number (0-10),
   score_feasibility: number (0-10),
   score_impact: number (0-10),
   reviewed_at: string | null
   }

7. Events
   Array of 6 events:
   {
   id: number,
   title: string,
   description: string,
   theme: string,
   start_date: string,
   end_date: string,
   participant_count: number,
   status: "upcoming" | "ongoing" | "completed"
   }

Detailed page requirements with dummy data:

1. /innovation (Innovation Hub Dashboard)

   - Welcome card with stats: Total Teams (24), Active Projects (42), Pending Reviews (8), Upcoming Events (3)
   - Recent Activity feed (5-6 dummy entries: "Team Alpha submitted project...", "John joined Team Beta")
   - Quick actions: "Create Team", "Submit Idea", "Browse Gallery"
   - Featured public projects carousel (3-4 cards)

2. /innovation/teams (Teams & Clubs)

   - Search bar + filters (All / My Teams / Open to Join)
   - Grid/List of team cards: team name, description, member count, skills needed, "Join" or "View" button
   - Floating "+" button: "Create New Team" → modal with form (name, description, max members, public/private)
   - Dummy data: 12-15 teams, some marked as "Looking for members"

3. /innovation/projects (Projects & Ideas)

   - Tabs: All Projects / My Projects / Drafts / Public Gallery
   - Grid of project cards: title, short description, team name, status badge (Draft, Submitted, Approved, In Progress), visibility (Public/Private), tech tags
   - Search + filter by status/theme
   - "+" button: "Submit New Idea" → multi-step form modal (title, problem, solution, tech stack, visibility toggle, file uploads placeholder)
   - Dummy data: 20+ projects with varied statuses

4. /innovation/reviews (Submissions & Reviews)

   - Admin-focused view: Table of pending submissions with columns: Project Title, Team, Submitted Date, Status, Actions (View, Approve/Reject)
   - Detail modal on click: full project info + comment section + scoring (Innovation, Feasibility, Impact — 1-10 sliders) + final decision buttons
   - Notification badge on menu if pending > 0
   - Dummy data: 10 pending, 15 past reviews

5. /innovation/events (Events & Challenges)
   - List/Grid of upcoming and past events
   - Event card: title, dates, theme, participant count, status (Upcoming / Ongoing / Completed)
   - "+" button (admin only): Create Event modal
   - Featured banner for active challenge
   - Dummy data: 6 events (e.g., "AI for Good Challenge", "Sustainability Hackathon")

Additional:

- All lists/tables: searchable, sortable, pagination if >10 items
- Loading skeletons during mock fetch
- Toast notifications on create/update
- Lucide icons everywhere
- Top header with current user avatar + dropdown

Make this feel like a polished, premium edtech product — joyful, intuitive, and professional.
