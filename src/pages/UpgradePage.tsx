import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { useAuthStore } from '../hooks/useAuthStore';
import { openRazorpayCheckout } from '../services/razorpay';
import { redirectToLemonSqueezyCheckout, buildDirectCheckoutUrl } from '../services/lemonsqueezy';
import {
  Check, Sparkles, CreditCard, Globe, IndianRupee, Loader2, Shield,
  ArrowRight, Crown, Zap
} from 'lucide-react';

type PlanPeriod = 'monthly' | 'annual';
type PaymentProvider = 'razorpay' | 'lemonsqueezy';

const PRICING = {
  monthly: { inr: 199, usd: 5, paise: 19900 },
  annual: { inr: 1499, usd: 49, paise: 149900 },
};

const PRO_FEATURES = [
  'Invoice history & cloud sync',
  'Save company profile',
  'Logo upload on invoices',
  'Shareable invoice links',
  'UPI QR code on invoice',
  'Save custom templates',
  'Priority support',
];

export default function UpgradePage() {
  const [period, setPeriod] = useState<PlanPeriod>('monthly');
  const [provider, setProvider] = useState<PaymentProvider>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, isPro } = useAuthStore();
  const navigate = useNavigate();

  // If already pro, show success state
  if (isPro) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're already Pro!</h1>
            <p className="text-gray-500 mb-6">All premium features are unlocked.</p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Go to App <ArrowRight size={14} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to upgrade</h1>
            <p className="text-gray-500 mb-6">You need an account to subscribe to Pro.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                state={{ from: { pathname: '/upgrade' } }}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
              >
                Sign in <ArrowRight size={14} />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (provider === 'razorpay') {
        await openRazorpayCheckout({
          amount: PRICING[period].paise,
          currency: 'INR',
          userId: user.id,
          userEmail: user.email,
          planType: period,
          onSuccess: () => {
            navigate('/payment-success?provider=razorpay');
          },
          onError: (err) => {
            setError(err.message || 'Payment failed');
            setLoading(false);
          },
          onDismiss: () => {
            setLoading(false);
          },
        });
      } else {
        try {
          await redirectToLemonSqueezyCheckout({
            userId: user.id,
            userEmail: user.email,
            planType: period,
          });
        } catch {
          // Fallback to direct checkout URL if API is unavailable
          const url = buildDirectCheckoutUrl({
            userId: user.id,
            userEmail: user.email,
            planType: period,
          });
          window.location.href = url;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const price = provider === 'razorpay'
    ? `₹${PRICING[period].inr.toLocaleString('en-IN')}`
    : `$${PRICING[period].usd}`;

  const periodLabel = period === 'annual' ? '/year' : '/month';

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 rounded-full px-4 py-1 text-sm font-medium mb-4">
              <Sparkles size={14} /> Upgrade to Pro
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Unlock all premium features</h1>
            <p className="text-gray-500">Choose your plan and payment method</p>
          </div>

          {/* Plan Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod('annual')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  period === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Annual
                <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  Save {provider === 'razorpay' ? '₹889' : '$11'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Features */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown size={18} className="text-amber-500" /> Pro includes
              </h3>
              <ul className="space-y-3">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Selection */}
            <div className="space-y-4">
              {/* Payment provider buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Payment method</p>

                <button
                  id="provider-razorpay"
                  onClick={() => setProvider('razorpay')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    provider === 'razorpay'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    provider === 'razorpay' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <IndianRupee size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Razorpay</p>
                    <p className="text-xs text-gray-500">UPI, Cards, Netbanking (India)</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    provider === 'razorpay' ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {provider === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                </button>

                <button
                  id="provider-lemonsqueezy"
                  onClick={() => setProvider('lemonsqueezy')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    provider === 'lemonsqueezy'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    provider === 'lemonsqueezy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Globe size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">LemonSqueezy</p>
                    <p className="text-xs text-gray-500">International cards, PayPal</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    provider === 'lemonsqueezy' ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {provider === 'lemonsqueezy' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                </button>
              </div>

              {/* Price display */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {price}<span className="text-base font-normal text-gray-400">{periodLabel}</span>
                </p>
                {period === 'annual' && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Best value — save {provider === 'razorpay' ? '₹889' : '$11'} per year
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Pay button */}
              <button
                id="upgrade-pay-button"
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Pay {price}{periodLabel}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Shield size={12} /> Secure payment · Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
