import { useMemo } from 'react';
import { useAuthStore } from './useAuthStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const signUp = useAuthStore((state) => state.signUp);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}

/**
 * Hook for user plan/subscription
 */
export function useUserPlan() {
  const plan = useAuthStore((state) => state.plan);
  const loading = useAuthStore((state) => state.loading);
  const isPro = useAuthStore((state) => state.isPro);

  return useMemo(() => ({
    plan: plan === 'pro' ? 'pro' : 'free',
    loading,
    isPro,
  }), [plan, loading, isPro]);
}
