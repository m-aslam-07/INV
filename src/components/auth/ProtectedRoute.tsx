import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import React from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isPro, loading, openLoginModal } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isPro) {
    // Open login/upgrade modal and redirect home
    setTimeout(() => {
      openLoginModal();
    }, 0);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
