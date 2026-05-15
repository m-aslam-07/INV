import Stripe from 'stripe';
import { env } from './env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});

/**
 * Stripe plans configuration
 */
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Generate PDF invoices',
      'Client-side only storage',
      '5 invoice templates',
    ],
  },
  pro: {
    name: 'Pro',
    price: 999, // $9.99/month in cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited invoices',
      'Cloud storage & sync',
      'Custom templates',
      'Company profile',
      'Invoice sharing',
      'Invoice history',
      'Priority support',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

/**
 * Create checkout session
 */
export async function createCheckoutSession(
  userId: string,
  customerEmail: string,
  plan: PlanId,
  returnUrl: string
) {
  if (!PLANS[plan].stripePriceId) {
    throw new Error(`No Stripe price ID for plan: ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PLANS[plan].stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    customer_email: customerEmail,
    metadata: {
      userId,
      plan,
    },
  });

  return session;
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get or create customer
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
) {
  // Search for existing customer
  const customers = await stripe.customers.search({
    query: `email:"${email}"`,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });
}
