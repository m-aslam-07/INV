import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { useAuthStore } from '../hooks/useAuthStore';
import { Check, X, Crown, Sparkles } from 'lucide-react';

const features = [
  { name: 'All templates', free: true, pro: true },
  { name: 'Full GST calculation', free: true, pro: true },
  { name: 'All design controls', free: true, pro: true },
  { name: 'PDF download', free: true, pro: true },
  { name: 'No watermark', free: true, pro: true },
  { name: 'Invoice history', free: false, pro: true },
  { name: 'One-click duplicate', free: false, pro: true },
  { name: 'Logo upload', free: false, pro: true },
  { name: 'Shareable link', free: false, pro: true },
  { name: 'UPI QR code', free: false, pro: true },
  { name: 'Business profile saved', free: false, pro: true },
  { name: 'Cloud sync', free: false, pro: true },
  { name: 'Save custom templates', free: false, pro: true },
];

export default function PricingPage() {
  const { user, isPro } = useAuthStore();

  const upgradeLink = user ? '/upgrade' : '/login';

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <Navbar />
      <section className="py-14 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500 text-center mb-12">Start free. Upgrade when you need more.</p>

          {isPro && (
            <div className="max-w-md mx-auto mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm text-amber-700 flex items-center gap-1.5 justify-center">
                <Crown size={14} /> You're on the Pro plan — all features unlocked!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-1">₹0</p>
              <p className="text-sm text-gray-400 mb-6">Forever free</p>
              <ul className="space-y-2.5 mb-6">
                {features.map(f => (
                  <li key={f.name} className="flex items-center gap-2 text-sm">
                    {f.free ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-gray-300" />}
                    <span className={f.free ? 'text-gray-700' : 'text-gray-400'}>{f.name}</span>
                  </li>
                ))}
              </ul>
              <Link to="/app" className="block text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Start free</Link>
            </div>

            {/* Pro */}
            <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">Most popular</span>
              <h3 className="font-semibold text-gray-900 mb-1">Pro</h3>
              <p className="text-4xl font-bold text-gray-900 mb-1">₹149<span className="text-base font-normal text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-400 mb-6">Billed monthly</p>
              <ul className="space-y-2.5 mb-6">
                {features.map(f => (
                  <li key={f.name} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-green-500" /> {f.name}
                  </li>
                ))}
              </ul>
              {isPro ? (
                <div className="text-center py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-medium flex items-center justify-center gap-1.5">
                  <Sparkles size={14} /> Current Plan
                </div>
              ) : (
                <Link
                  to={upgradeLink}
                  state={!user ? { from: { pathname: '/upgrade' } } : undefined}
                  className="block text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </Link>
              )}
            </div>

            {/* Annual */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Annual</h3>
              <p className="text-4xl font-bold text-gray-900 mb-1">₹1,499<span className="text-base font-normal text-gray-400">/yr</span></p>
              <div className="mb-6">
                <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Save ₹289/yr</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {features.map(f => (
                  <li key={f.name} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-green-500" /> {f.name}
                  </li>
                ))}
              </ul>
              {isPro ? (
                <div className="text-center py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-medium flex items-center justify-center gap-1.5">
                  <Sparkles size={14} /> Current Plan
                </div>
              ) : (
                <Link
                  to={upgradeLink}
                  state={!user ? { from: { pathname: '/upgrade' } } : undefined}
                  className="block text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Get annual plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
