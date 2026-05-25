/**
 * LemonSqueezy payment integration (client-side)
 * 
 * Flow:
 * 1. Client creates a checkout URL with user metadata
 * 2. User is redirected to LemonSqueezy hosted checkout
 * 3. After payment, LemonSqueezy webhook hits /api/payment/lemonsqueezy-webhook
 * 4. Webhook handler verifies signature and updates user plan to 'pro'
 * 5. User is redirected back to /payment-success
 */

import { env } from '../lib/env';
import { supabase } from '../lib/supabase/client';

interface LemonSqueezyCheckoutOptions {
  planType: 'monthly' | 'annual';
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Session expired. Please sign in again.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Generate a LemonSqueezy checkout URL via our API
 */
export async function createLemonSqueezyCheckout(
  options: LemonSqueezyCheckoutOptions
): Promise<string> {
  const { planType } = options;
  const headers = await getAuthHeaders();

  const response = await fetch('/api/payment/lemonsqueezy-checkout', {
    method: 'POST',
    headers,
    body: JSON.stringify({ planType }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create checkout session');
  }

  const data = await response.json();
  return data.checkoutUrl;
}

/**
 * Redirect user to LemonSqueezy checkout
 */
export async function redirectToLemonSqueezyCheckout(
  options: LemonSqueezyCheckoutOptions
): Promise<void> {
  const checkoutUrl = await createLemonSqueezyCheckout(options);
  window.location.href = checkoutUrl;
}

/**
 * Build a direct LemonSqueezy checkout URL (if store has a published checkout)
 * Falls back if API is unavailable
 */
export function buildDirectCheckoutUrl(
  options: LemonSqueezyCheckoutOptions
): string {
  const storeId = env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    return '/pricing'; // fallback
  }

  const params = new URLSearchParams({
    'checkout[email]': '',
  });

  const successUrl = `${env.APP_URL}/payment-success?provider=lemonsqueezy`;
  params.set('checkout[success_url]', successUrl);

  // This is a fallback URL pattern — actual checkout URL comes from API
  return `https://${storeId}.lemonsqueezy.com/checkout?${params.toString()}`;
}
