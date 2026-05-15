import { Readable } from 'stream';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, PLANS } from '@/lib/stripe';
import { supabase } from '@/lib/supabase/client';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * POST /api/stripe/webhook
 * Stripe webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await buffer(request.body as any);
    const sig = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return new NextResponse('Webhook Error', { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = (session.metadata?.plan || 'pro') as 'pro' | 'free';

        if (userId) {
          // Update user plan
          const { error: updateError } = await supabase
            .from('users')
            .update({ plan })
            .eq('id', userId);

          if (updateError) {
            console.error('Failed to update user plan:', updateError);
          }

          // Create or update subscription
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: subscription.status,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            });

          if (subError) {
            console.error('Failed to update subscription:', subError);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to update subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to cancel subscription:', error);
        }

        // Downgrade user to free plan
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (sub) {
          await supabase.from('users').update({ plan: 'free' }).eq('id', sub.user_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook error', { status: 500 });
  }
}
