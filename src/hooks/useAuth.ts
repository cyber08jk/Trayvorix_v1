import { useAuth as useAuthContext } from '@contexts/AuthContext';

// Re-export the useAuth hook from context for convenience
export const useAuth = useAuthContext;

// Helper hook to check user role
export function useRole() {
  const { userRole } = useAuthContext();
  
  return {
    role: userRole,
    isAdmin: userRole === 'admin',
    isOperator: userRole === 'operator',
    isAuditor: userRole === 'auditor',
    isVendor: userRole === 'vendor',
    canEdit: userRole === 'admin' || userRole === 'operator',
    canApprove: userRole === 'admin',
  };
}

// Helper hook to check if user is authenticated
export function useRequireAuth() {
  const { user, loading } = useAuthContext();
  
  return {
    isAuthenticated: !!user,
    loading,
    user,
  };
}
