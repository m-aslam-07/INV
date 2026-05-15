'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUserPlan } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string;
}

/**
 * Settings Page
 * User settings and plan management
 */
export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user, signOut } = useAuth();
  const { plan, isPro } = useUserPlan();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    try {
      if (!user) return;
      
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgradeLoading(true);
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      window.location.href = url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      window.location.href = url;
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Account Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Plan Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Plan & Billing</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h3>
                <p className="text-gray-600 mt-2">
                  {isPro ? 'Unlimited invoices, cloud storage, and more' : 'Create invoices locally'}
                </p>

                {!isPro && (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgradeLoading}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {upgradeLoading ? 'Processing...' : 'Upgrade to Pro'}
                  </button>
                )}

                {isPro && subscription && (
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>Status: <span className="font-semibold">{subscription.status}</span></p>
                    <p>
                      Renews:{' '}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                    <button
                      onClick={handleBillingPortal}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Manage Billing →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-lg shadow p-6 border-2 border-red-100">
          <h2 className="text-xl font-semibold mb-6 text-red-600">Danger Zone</h2>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </section>
      </main>
    </div>
  );
}
