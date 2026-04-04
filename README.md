> Build a complete, modern **Assignments & Quizzes module** for an AI-focused Learning Management System called **TechAI LMS**.
>
> ### 🎯 Goals
>
> The module should allow tutors to create assignments and quizzes, students to submit work (files, links, repositories), tutors to assess and give feedback, and admins to track performance and analytics.
>
> ---
>
> - **Use dummy/mock endpoints for all CRUD operations** — actual backend implementation will be added later
> - All API calls should go through a centralized service (e.g., `apiService`) for easy replacement
> - Mock data should reflect realistic structures for assignments, quizzes, submissions, and grades
>
> {
> label: 'Assessments',
> items: [

    {
      title: 'Overview',
      url: '/admin/assessments',
      icon: Grid,
    },
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
}

USER STORIES

> **Students**
>
> - View assigned assignments and quizzes
> - Submit:
>
>   - File uploads (PDF, DOCX, ZIP)
>   - GitHub / GitLab repository links
>   - Live demo URLs (optional)
>
> - View submission status, grades, tutor remarks
> - Track personal performance over time
>
> **Tutors**
>
> - Create and manage assignments & quizzes
> - Set:
>   assignments should be tied to courses.

    - Dropdown For courses

> - Title, description (rich text)
> - Instructions & resources
> - Due date & late submission rules
> - Submission types (file, repo link, URL)
>
> - Define grading method:
>
>   - Score-based (e.g. /100)
>   - Rubric-based (criteria + weights)
>
> - Review submissions:
>
>   - View files inline
>   - Open repo links
>   - Add remarks and annotations
>   - Assign grades
>
> **Admins**
>
> - View all assignments & quizzes
> - Track performance analytics
> - Override grades if needed
> - Export results (CSV)
>
> ---
>
> ### 📚 Assignment Features
>
> - Assignment types:
>
>   - Individual
>   - Group / Team-based
>
> - Submission tracking:
>
>   - Submitted / Pending / Late / Graded
>
> - Versioning:
>
>   - Allow resubmissions (configurable)
>
> - Plagiarism-ready design (flag placeholder)
>
> ---
>
> ### 🧠 Quiz Features
>
> - Quiz builder with:
>
>   - Multiple choice
>   - True/False
>   - Short answer
>   - Code-based questions (future-ready)
>
> - Timer support
> - Auto-grading for objective questions
> - Manual grading for subjective answers
>
> ---
>
> ### 📊 Performance Tracking & Analytics
>
> - Student progress dashboard:
>
>   - Average score per course
>   - Completion rate
>   - Improvement trend
>
> - Tutor analytics:
>
>   - Assignment difficulty insights
>   - Grade distribution
>
> - Course-level performance summary
>
> ---
>
> ### 🎨 UI / UX Requirements
>
> - Clean, modern, premium academic design
> - White background, soft grays, deep blue accents
> - Card-based layout with subtle shadows
> - Clear status badges (Pending, Submitted, Graded, Late)
> - Responsive and mobile-friendly
> - Smooth hover and loading states
>
> ---
>
> ### 🧱 Technical Requirements
>
> - Frontend: React + TypeScript + Vite
> - Styling: Tailwind CSS + shadcn/ui
> - State management: TanStack Query
> - Rich text editor for instructions & feedback
> - File upload UI with progress indicators
>
> ---
>
> ### 🚀 Advanced & Smart Features (Include if possible)
>
> - Rubric-based grading UI
> - Inline comments on submissions
> - AI-ready hooks:
>
>   - Auto-generate feedback suggestions
>   - Auto-grade simple assignments
>
> - GitHub repo preview (README, commits summary)
> - Notifications (assignment posted, graded, due soon)
>
> ---
>
> ### 📁 Deliverables
>
> - Assignment list & detail pages
> - Quiz builder UI
> - Submission review screen
> - Student performance dashboard
> - Reusable components and clean structure
>
> Build the module so it integrates seamlessly into an existing LMS and is scalable, maintainable, and visually polished.
