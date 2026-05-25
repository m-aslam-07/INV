import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AppPage = lazy(() => import('./pages/AppPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const UpgradePage = lazy(() => import('./pages/UpgradePage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage'));

import { PrivacyPage, TermsPage } from './pages/LegalPages';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Suspense fallback={<Loading />}><LandingPage /></Suspense> },
  { path: '/app', element: <Suspense fallback={<Loading />}><AppPage /></Suspense> },
  { path: '/templates', element: <Suspense fallback={<Loading />}><TemplatesPage /></Suspense> },
  { path: '/pricing', element: <Suspense fallback={<Loading />}><PricingPage /></Suspense> },
  { path: '/blog', element: <Suspense fallback={<Loading />}><BlogPage /></Suspense> },
  { path: '/legal/privacy', element: <Suspense fallback={<Loading />}><PrivacyPage /></Suspense> },
  { path: '/legal/terms', element: <Suspense fallback={<Loading />}><TermsPage /></Suspense> },

  // Auth routes
  { path: '/login', element: <Suspense fallback={<Loading />}><LoginPage /></Suspense> },
  { path: '/signup', element: <Suspense fallback={<Loading />}><SignupPage /></Suspense> },

  // Payment routes
  {
    path: '/upgrade',
    element: (
      <ProtectedRoute requirePro={false}>
        <Suspense fallback={<Loading />}><UpgradePage /></Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment-success',
    element: (
      <ProtectedRoute requirePro={false}>
        <Suspense fallback={<Loading />}><PaymentSuccessPage /></Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment-cancel',
    element: (
      <ProtectedRoute requirePro={false}>
        <Suspense fallback={<Loading />}><PaymentCancelPage /></Suspense>
      </ProtectedRoute>
    ),
  },
]);
