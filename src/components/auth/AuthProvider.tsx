import { useEffect } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void initializeAuth().then((maybeCleanup) => {
      if (typeof maybeCleanup === 'function') {
        if (disposed) {
          maybeCleanup();
          return;
        }

        cleanup = maybeCleanup;
      }
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [initializeAuth]);

  return <>{children}</>;
}
