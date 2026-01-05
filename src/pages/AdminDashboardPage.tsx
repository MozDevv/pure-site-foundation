import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
              ) : (
                <AdminDashboard />
              )}
            </main>
          </div>
        </div>
      </InnovationProvider>
    </SidebarProvider>
  );
}
