import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { createCheckoutSession, createBillingPortalSession, getOrCreateCustomer } from '@/lib/stripe';

/**
 * POST /api/stripe/checkout
 * Create a checkout session for plan upgrade
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (plan !== 'pro') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get user email
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(userId, user.email, user.user_metadata?.name);

    // Create checkout session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`;
    const session = await createCheckoutSession(userId, user.email, 'pro', returnUrl);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/billing-portal
 * Create a billing portal session
 */
export async function POST_PORTAL(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    // Create billing portal session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings`;
    const session = await createBillingPortalSession(
      subscription.stripe_customer_id,
      returnUrl
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Failed to create billing portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
