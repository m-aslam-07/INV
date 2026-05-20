import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
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

function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <AppWrapper><LandingPage /></AppWrapper> },
  { path: '/app', element: <AppWrapper><AppPage /></AppWrapper> },
  { path: '/templates', element: <AppWrapper><TemplatesPage /></AppWrapper> },
  { path: '/pricing', element: <AppWrapper><PricingPage /></AppWrapper> },
  { path: '/blog', element: <AppWrapper><BlogPage /></AppWrapper> },
  { path: '/legal/privacy', element: <AppWrapper><PrivacyPage /></AppWrapper> },
  { path: '/legal/terms', element: <AppWrapper><TermsPage /></AppWrapper> },

  // Auth routes
  { path: '/login', element: <AppWrapper><LoginPage /></AppWrapper> },
  { path: '/signup', element: <AppWrapper><SignupPage /></AppWrapper> },

  // Payment routes
  { path: '/upgrade', element: <AppWrapper><UpgradePage /></AppWrapper> },
  { path: '/payment-success', element: <AppWrapper><PaymentSuccessPage /></AppWrapper> },
  { path: '/payment-cancel', element: <AppWrapper><PaymentCancelPage /></AppWrapper> },
]);
