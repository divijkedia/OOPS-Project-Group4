import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { Role } from '../types/auth';
import { Skeleton } from '../components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen app-royal-bg flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-pink animate-pulse" />
        <Skeleton className="h-6 w-48 bg-white/20" />
        <Skeleton className="h-4 w-32 bg-white/20" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect user to their own role dashboard
    const roleDefaultRoute = {
      EMPLOYEE: '/employee',
      TECHNICIAN: '/technician',
      ADMIN: '/admin',
    }[role] || '/';

    return <Navigate to={roleDefaultRoute} replace />;
  }

  return <>{children}</>;
};
