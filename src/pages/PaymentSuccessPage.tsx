import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { useAuthStore } from '../hooks/useAuthStore';
import { CheckCircle, ArrowRight, Loader2, Crown, Sparkles } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'unknown';
  const [refreshing, setRefreshing] = useState(true);
  const { refreshPlan, isPro, user } = useAuthStore();

  useEffect(() => {
    let active = true;
    let attempts = 0;
    const maxAttempts = 20;

    const refresh = async () => {
      if (!active) return;

      try {
        await refreshPlan();
      } catch (e) {
        console.error('Failed to refresh plan:', e);
      }

      attempts += 1;
      const currentIsPro = useAuthStore.getState().isPro;

      if (!active) return;
      if (currentIsPro || attempts >= maxAttempts) {
        setRefreshing(false);
        active = false;
      }
    };

    const interval = window.setInterval(() => {
      void refresh();
    }, 3000);

    // Start soon after navigation so webhook has a moment to run.
    const kickoff = window.setTimeout(() => {
      void refresh();
    }, 1500);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearTimeout(kickoff);
    };
  }, [refreshPlan]);

  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md text-center">
          {refreshing ? (
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirming payment...</h1>
              <p className="text-gray-500">Please wait while we verify your payment.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Success icon with celebration gradient */}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <Crown size={14} className="text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isPro ? 'Welcome to Pro!' : 'Payment received!'}
              </h1>

              <p className="text-gray-500 mb-2">
                {isPro
                  ? 'All premium features have been unlocked for your account.'
                  : 'Your payment was successful. Your Pro access will be activated shortly.'
                }
              </p>

              {user && (
                <p className="text-sm text-gray-400 mb-6">
                  Account: {user.email}
                </p>
              )}

              {isPro && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 inline-block">
                  <p className="text-sm text-amber-700 flex items-center gap-1.5 justify-center">
                    <Sparkles size={14} /> Your Pro features are now active
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  Go to App <ArrowRight size={14} />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  Back to Home
                </Link>
              </div>

              {!isPro && (
                <p className="mt-6 text-xs text-gray-400">
                  If your Pro access isn't activated within a few minutes, please refresh the page or contact support.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
