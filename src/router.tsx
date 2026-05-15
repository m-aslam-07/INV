import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AppPage = lazy(() => import('./pages/AppPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));

import { PrivacyPage, TermsPage } from './pages/LegalPages';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/', element: <SuspenseWrapper><LandingPage /></SuspenseWrapper> },
  { path: '/app', element: <SuspenseWrapper><AppPage /></SuspenseWrapper> },
  { path: '/templates', element: <SuspenseWrapper><TemplatesPage /></SuspenseWrapper> },
  { path: '/pricing', element: <SuspenseWrapper><PricingPage /></SuspenseWrapper> },
  { path: '/blog', element: <SuspenseWrapper><BlogPage /></SuspenseWrapper> },
  { path: '/legal/privacy', element: <PrivacyPage /> },
  { path: '/legal/terms', element: <TermsPage /> },
]);
