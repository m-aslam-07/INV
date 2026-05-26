import crypto from 'crypto';
import { createSupabaseServiceClient } from './_auth.js';

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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
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

    if (paymentLogError || !paymentLog) {
      return res.status(200).json({ received: true });
    }

    await supabase
      .from('payment_logs')
      .update({
        status: 'verified',
        payment_id: paymentId,
      })
      .eq('id', paymentLog.id);

    await supabase
      .from('users')
      .upsert(
        {
          id: paymentLog.user_id,
          plan: 'pro',
          payment_provider: 'razorpay',
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
