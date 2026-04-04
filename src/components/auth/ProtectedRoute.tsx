import { Navigate, Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;

  // If not authenticated at all, redirect to sign-in
  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  const userRole = user?.role || '';

  // Check if user's role (case-insensitive) is in the allowed roles
  const isAllowed = allowedRoles.some(
    (role) => role.toUpperCase() === userRole.toUpperCase()
  );

  if (!isAllowed) {
    // Smart redirect: send user to their own dashboard
    const roleUpper = userRole.toUpperCase();
    const fallback =
      roleUpper === 'STUDENT'      ? '/student' :
      roleUpper === 'TUTOR'        ? '/tutor'   :
      roleUpper === 'REVIEWER'     ? '/tutor'   :
      roleUpper === 'MENTOR'       ? '/tutor'   :
      roleUpper === 'ADMIN'        ? '/admin'   :
      roleUpper === 'SUPER_ADMIN'  ? '/admin'   : '/signin';
    const target = redirectTo || fallback;
    console.log(`Access denied. User role: ${userRole}, Allowed: ${allowedRoles.join(', ')}. Redirecting to ${target}`);
    return <Navigate to={target} replace />;
  }

  // Support both wrapper (<ProtectedRoute>children</ProtectedRoute>)
  // and layout-route (<Route element={<ProtectedRoute />}>) patterns
  return children ? <>{children}</> : <Outlet />;
}
