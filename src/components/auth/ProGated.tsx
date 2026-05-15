'use client';

import { useAuth, useUserPlan } from '@/hooks/useAuth';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ProGatedProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders for PRO users
 * Shows upgrade prompt for free users
 */
export function ProGated({ children, fallback }: ProGatedProps) {
  const { user, isAuthenticated } = useAuth();
  const { isPro, loading } = useUserPlan();

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <p className="text-sm text-gray-700 mb-3">
            This feature is available in our PRO plan
          </p>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm"
            >
              View Plans
            </Link>
          </div>
        </div>
      )
    );
  }

  if (!isPro) {
    return (
      fallback || (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <p className="text-sm text-gray-700 mb-3">
            Upgrade to PRO to unlock this feature
          </p>
          <Link
            href="/pricing"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Upgrade to Pro
          </Link>
        </div>
      )
    );
  }

  return children;
}

/**
 * Component that renders different content for free vs pro users
 */
export function PlanAware({ free, pro }: { free: ReactNode; pro: ReactNode }) {
  const { isPro, loading } = useUserPlan();

  if (loading) return <div>Loading...</div>;

  return isPro ? pro : free;
}
