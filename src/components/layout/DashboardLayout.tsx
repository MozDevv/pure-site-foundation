import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Header } from '@/components/layout/header';
import { InnovationProvider } from '@/components/innovation-hub/InnovationContext';
import { MentorshipProvider } from '@/components/mentorship/MentorshipContext';
import { Outlet } from 'react-router-dom';
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';
import { useChatPrefetch } from '@/hooks/useChatPrefetch';
import { OnboardingTourProvider, useTour, DASHBOARD_TOUR_STEPS } from '@/components/onboarding/OnboardingTour';
import { FloatingAIChat } from '@/components/chat/FloatingAIChat';
import { Suspense, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Inner component that can access the tour context to auto-start for new users.
 */
function TourAutoStart() {
  const { startTour, isActive } = useTour();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || isActive) return;
    const completed = localStorage.getItem('techai_onboarding_completed');
    if (completed) return;

    // Delay so the dashboard has time to render elements
    const timer = setTimeout(() => {
      started.current = true;
      startTour(DASHBOARD_TOUR_STEPS);
    }, 1500);
    return () => clearTimeout(timer);
  }, [startTour, isActive]);

  return null;
}

/**
 * Shared dashboard layout that persists the sidebar and header across route changes.
 * Only the <Outlet /> (main content area) re-renders when navigating between routes.
 * This prevents sidebar flicker, loading resets, and blank-page transitions.
 *
 * Also connects to the backend STOMP WebSocket for real-time notifications
 * and adds smooth page transition animations.
 */
export default function DashboardLayout() {
  useNotificationWebSocket();
  useChatPrefetch();

  return (
    <OnboardingTourProvider>
      <SidebarProvider>
        <InnovationProvider>
          <MentorshipProvider>
            <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
              <AdminSidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-x-hidden overflow-y-auto">
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }>
                    <Outlet />
                  </Suspense>
                </main>
              </div>
            </div>
            <TourAutoStart />
            <FloatingAIChat />
          </MentorshipProvider>
        </InnovationProvider>
      </SidebarProvider>
    </OnboardingTourProvider>
  );
}
