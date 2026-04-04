import { Outlet } from 'react-router-dom';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const MaintenancePage = lazy(() => import('@/components/MaintenancePage'));

/**
 * Route guard that blocks all non-admin users when maintenance mode is active.
 * Admins see the maintenance page but can bypass it.
 * While the initial maintenance check is loading, the dashboard is shown normally
 * to avoid a full-screen spinner blocking every page load.
 */
export function MaintenanceGuard() {
  const { isMaintenanceMode, maintenanceMessage, bypass } = useMaintenanceMode();

  if (isMaintenanceMode) {
    const user = (() => {
      try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    // User object stores role as a plain string: 'Admin', 'Tutor', 'Student'
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
        <MaintenancePage
          message={maintenanceMessage}
          isAdmin={isAdmin}
          onBypass={isAdmin ? bypass : undefined}
        />
      </Suspense>
    );
  }

  return <Outlet />;
}
