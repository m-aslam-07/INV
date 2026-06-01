import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createSupabaseServiceClient, logPaymentBackendEnvStatus } from './_auth.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    logPaymentBackendEnvStatus('razorpay-webhook');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    const rawBody = await getRawBody(req);
    const signature = req.headers['x-razorpay-signature'];

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(rawBody.toString());
    const eventName = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity?.order_id) {
      return res.status(200).json({ received: true });
    }

    const isCaptured = eventName === 'payment.captured' || paymentEntity.status === 'captured';
    if (!isCaptured) {
      return res.status(200).json({ received: true });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id || null;

    const supabase = createSupabaseServiceClient();

    const { data: paymentLog, error: paymentLogError } = await supabase
      .from('payment_logs')
      .select('id, user_id')
      .eq('provider', 'razorpay')
      .eq('order_id', orderId)
      .maybeSingle();

    let userId = paymentLog?.user_id || null;

    if (paymentLogError) {
      console.warn('payment_logs lookup failed during Razorpay webhook', {
        error: paymentLogError.message,
        orderId,
      });
    }

    if (!userId) {
      if (!keyId || !keySecret) {
        return res.status(200).json({ received: true });
      }

      try {
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await razorpay.orders.fetch(orderId);
        userId = order?.notes?.userId || null;
      } catch (fetchError) {
        console.error('Failed to fetch Razorpay order in webhook', {
          message: fetchError?.message || String(fetchError),
          orderId,
        });
      }
    }

    if (!userId) {
      return res.status(200).json({ received: true });
    }

    await supabase
      .from('payment_logs')
      .update({
        status: 'verified',
        payment_id: paymentId,
      })
      .eq('id', paymentLog?.id || paymentId || orderId);

    const { data: existingUser, error: profileLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profileLookupError) {
      console.error('Failed to load user profile before Razorpay webhook update', {
        error: profileLookupError.message,
        userId,
        orderId,
      });
      return res.status(200).json({ received: true });
    }

    if (!existingUser) {
      console.warn('Skipping Razorpay webhook upgrade because user profile is missing', {
        userId,
        orderId,
      });
      return res.status(200).json({ received: true });
    }

    const { error: planUpdateError } = await supabase
      .from('users')
      .update({
        plan: 'pro',
        payment_provider: 'razorpay',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (planUpdateError) {
      console.error('Failed to upgrade user plan in Razorpay webhook', {
        error: planUpdateError.message,
        userId,
        orderId,
      });
      return res.status(200).json({ received: true });
    }

    if (!paymentLog?.id) {
      await supabase.from('payment_logs').insert({
        user_id: userId,
        provider: 'razorpay',
        payment_id: paymentId,
        order_id: orderId,
        status: 'verified',
        created_at: new Date().toISOString(),
      }).catch((insertError) => {
        console.warn('Could not persist Razorpay webhook log', {
          error: insertError?.message || String(insertError),
          orderId,
          userId,
        });
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
