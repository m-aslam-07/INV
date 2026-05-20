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

interface LemonSqueezyCheckoutOptions {
  userId: string;
  userEmail: string;
  planType: 'monthly' | 'annual';
}

/**
 * Generate a LemonSqueezy checkout URL via our API
 */
export async function createLemonSqueezyCheckout(
  options: LemonSqueezyCheckoutOptions
): Promise<string> {
  const { userId, userEmail, planType } = options;

  const response = await fetch('/api/payment/lemonsqueezy-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userEmail, planType }),
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
    'checkout[email]': options.userEmail,
    'checkout[custom][user_id]': options.userId,
  });

  const successUrl = `${env.APP_URL}/payment-success?provider=lemonsqueezy`;
  params.set('checkout[success_url]', successUrl);

  // This is a fallback URL pattern — actual checkout URL comes from API
  return `https://${storeId}.lemonsqueezy.com/checkout?${params.toString()}`;
}
