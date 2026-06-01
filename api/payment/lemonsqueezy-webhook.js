import crypto from 'crypto';
import { createSupabaseServiceClient, logPaymentBackendEnvStatus } from './_auth.js';

// Vercel serverless function for LemonSqueezy webhook handling
// This endpoint receives POST from LemonSqueezy after successful payment

export const config = {
  api: {
    bodyParser: false, // We need raw body for signature verification
  },
};

// Read raw body for signature verification
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logPaymentBackendEnvStatus('lemonsqueezy-webhook');

    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Get raw body and verify signature
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(rawBody).digest('hex');

    if (digest !== signature) {
      console.error('LemonSqueezy webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Parse the verified body
    const event = JSON.parse(rawBody.toString());
    const eventName = event.meta?.event_name;

    console.log('LemonSqueezy webhook event:', eventName);

    // Handle subscription/order events
    if (
      eventName === 'order_created' ||
      eventName === 'subscription_created' ||
      eventName === 'subscription_updated'
    ) {
      const customData = event.meta?.custom_data || {};
      const userId = customData.user_id;

      if (!userId) {
        console.error('No user_id in webhook custom_data');
        return res.status(400).json({ error: 'Missing user_id' });
      }

      // Determine if subscription is active
      const status = event.data?.attributes?.status;
      const isActive =
        status === 'active' ||
        status === 'paid' ||
        status === 'trialing';

      // Do not upgrade on unpaid/new order events.
      if (eventName === 'order_created' && status !== 'paid') {
        return res.status(200).json({ received: true });
      }

      const plan = isActive ? 'pro' : 'free';

      // Update user plan in Supabase
      const supabase = createSupabaseServiceClient();

      const { error: updateError } = await supabase
        .from('users')
        .upsert(
          {
            id: userId,
            plan,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (updateError) {
        console.error('Failed to update user plan:', updateError);
        return res.status(500).json({ error: 'Failed to update plan' });
      }

      // Log the payment
      await supabase.from('payment_logs').insert({
        user_id: userId,
        provider: 'lemonsqueezy',
        payment_id: event.data?.id?.toString(),
        order_id: event.data?.attributes?.order_id?.toString(),
        status: plan === 'pro' ? 'verified' : 'cancelled',
        created_at: new Date().toISOString(),
      }).catch(() => { /* payment_logs table might not exist yet */ });

      console.log(`User ${userId} plan updated to: ${plan}`);
    }

    // Handle subscription cancellation
    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      const customData = event.meta?.custom_data || {};
      const userId = customData.user_id;

      if (userId) {
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = createSupabaseServiceClient();

          await supabase
            .from('users')
            .update({ plan: 'free', updated_at: new Date().toISOString() })
            .eq('id', userId);

          console.log(`User ${userId} plan reverted to free (subscription ended)`);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('LemonSqueezy webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
