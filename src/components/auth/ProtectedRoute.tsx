import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Loading } from '@components/common/Loading';
import { AccessDenied } from '@components/common/AccessDenied';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'operator' | 'auditor' | 'vendor';
  allowedRoles?: Array<'admin' | 'operator' | 'auditor' | 'vendor'>;
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    return <AccessDenied message={`You don't have permission to access this page. Required role: ${requiredRole}`} />;
  }

  // Check if user role is in allowed roles
  if (allowedRoles && userRole && !allowedRoles.includes(userRole as any)) {
    return <AccessDenied message="You don't have permission to access this page." />;
  }

  return <>{children}</>;
}
