import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePro?: boolean;
}

export function ProtectedRoute({ children, requirePro = true }: ProtectedRouteProps) {
  const { user, isPro, loading, openUpgradeModal } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePro && !isPro) {
    setTimeout(() => {
      openUpgradeModal('Pro feature');
    }, 0);
    return <Navigate to="/upgrade" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
