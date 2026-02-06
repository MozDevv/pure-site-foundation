import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { Header } from '@/components/layout/header';
import UserManagement from '@/components/UserManagement';
import CoursesManagement from '@/components/CoursesManagement';
import { ModuleBuilder } from '@/components/module-builder/ModuleBuilder';
import { ResourceLibrary } from '@/components/module-builder/ResourceLibrary';
import Meetings from './Meetings';
import { InnovationDashboard } from './innovation/InnovationDashboard';
import { TeamsPage } from './innovation/TeamsPage';
import { ProjectsPage } from './innovation/ProjectsPage';
import { ProjectDetailPage } from './innovation/ProjectDetailPage';
import { ReviewsPage } from './innovation/ReviewsPage';
import { EventsPage } from './innovation/EventsPage';
import { InnovationProvider } from '@/components/innovation-hub/InnovationContext';
import { MentorshipProvider } from '@/components/mentorship/MentorshipContext';
import { TeamSetupWizard } from '@/components/setup-wizard/TeamSetupWizard';
import AssessmentsOverview from '@/components/assessments/AssessmentsOverview';
import AssignmentsList from '@/components/assessments/AssignmentsList';
import CreateAssignment from '@/components/assessments/CreateAssignment';
import QuizzesList from '@/components/assessments/QuizzesList';
import CreateQuiz from '@/components/assessments/CreateQuiz';
import SubmissionsList from '@/components/assessments/SubmissionsList';
import SubmissionReview from '@/components/assessments/SubmissionReview';
import GradesPerformance from '@/components/assessments/GradesPerformance';
import AssignmentSubmit from '@/components/assessments/AssignmentSubmit';
import { MentorshipDashboard } from './mentorship/MentorshipDashboard';
import { MentorsPage } from './mentorship/MentorsPage';
import { MentorRequestsPage } from './mentorship/MentorRequestsPage';
import { MatchingPage } from './mentorship/MatchingPage';
import { MentorGroupsPage } from './mentorship/MentorGroupsPage';
import { SessionsPage } from './mentorship/SessionsPage';
import { MyMenteesPage } from './mentorship/MyMenteesPage';
import { FindMentorPage } from './mentorship/FindMentorPage';
import { StudentMyMentorPage } from './mentorship/StudentMyMentorPage';
import { StudentSessionsPage } from './mentorship/StudentSessionsPage';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { FirestoreChatLayout } from '@/components/chat/firestore/FirestoreChatLayout';
import CreateMenus from './CreateMenus';

const mockAdmin = {
  firstName: 'Admin',
  lastName: 'User',
  name: 'Admin User',
  email: 'admin@techai.',
  avatar: '/placeholder.svg',
  role: 'Admin',
};

export default function AdminDashboardPage({ menu = 'userManagement' }) {
  return (
    <SidebarProvider>
      <InnovationProvider>
        <MentorshipProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
              <Header user={mockAdmin} />
              <main className="flex-1 p-6">
                {menu === 'userManagement' ? (
                  <UserManagement />
                ) : menu === 'coursesManagement' ? (
                  <CoursesManagement />
                ) : menu === 'moduleBuilder' ? (
                  <ModuleBuilder />
                ) : menu === 'resourceLibrary' ? (
                  <ResourceLibrary />
                ) : menu === 'timetable' ? (
                  <Meetings />
                ) : menu === 'innovationDashboard' ? (
                  <InnovationDashboard />
                ) : menu === 'teamsPage' ? (
                  <TeamsPage />
                ) : menu === 'projectsPage' ? (
                  <ProjectsPage />
                ) : menu === 'projectDetailPage' ? (
                  <ProjectDetailPage />
                ) : menu === 'reviewsPage' ? (
                  <ReviewsPage />
                ) : menu === 'eventsPage' ? (
                  <EventsPage />
                ) : menu === 'submitProject' ? (
                  <TeamSetupWizard isOpen={true} onClose={() => {}} />
                ) : menu === 'assessmentsOverview' ? (
                  <AssessmentsOverview />
                ) : menu === 'assignmentsPage' ? (
                  <AssignmentsList />
                ) : menu === 'createAssignment' ? (
                  <CreateAssignment />
                ) : menu === 'editAssignment' ? (
                  <CreateAssignment />
                ) : menu === 'quizzesPage' ? (
                  <QuizzesList />
                ) : menu === 'createQuiz' ? (
                  <CreateQuiz />
                ) : menu === 'editQuiz' ? (
                  <CreateQuiz />
                ) : menu === 'submissionsPage' ? (
                  <SubmissionsList />
                ) : menu === 'submissionReview' ? (
                  <SubmissionReview />
                ) : menu === 'gradesPage' ? (
                  <GradesPerformance />
                ) : menu === 'submitAssignment' ? (
                  <AssignmentSubmit />
                ) : menu === 'mentorshipDashboard' ? (
                  <MentorshipDashboard />
                ) : menu === 'mentorsPage' ? (
                  <MentorsPage />
                ) : menu === 'mentorRequestsPage' ? (
                  <MentorRequestsPage />
                ) : menu === 'matchingPage' ? (
                  <MatchingPage />
                ) : menu === 'mentorGroupsPage' ? (
                  <MentorGroupsPage />
                ) : menu === 'sessionsPage' ? (
                  <SessionsPage />
                ) : menu === 'myMenteesPage' ? (
                  <MyMenteesPage />
                ) : menu === 'findMentor' ? (
                  <FindMentorPage />
                ) : menu === 'myMentor' ? (
                  <StudentMyMentorPage />
                ) : menu === 'mySessions' ? (
                  <StudentSessionsPage />
                ) : menu === 'chat' ? (
                  <FirestoreChatLayout />
                ) : menu === 'menuSetups' ? (
                  <CreateMenus />
                ) : (
                  <AdminDashboard />
                )}
              </main>
            </div>
          </div>
        </MentorshipProvider>
      </InnovationProvider>
    </SidebarProvider>
  );
}
