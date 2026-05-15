import React from 'react';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuthStore';

interface ProGatedProps {
  children: React.ReactNode;
  feature: string;
}

export function ProGated({ children, feature }: ProGatedProps) {
  const { isPro, openUpgradeModal } = useAuthStore();

  if (isPro) return <>{children}</>;

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => openUpgradeModal(feature)}
    >
      <div className="opacity-40 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Lock size={10} />
          Pro
        </span>
      </div>
    </div>
  );
}
