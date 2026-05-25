import crypto from 'crypto';
import { createSupabaseServiceClient, getAuthenticatedUser, setCorsHeaders } from './_auth';

// Vercel serverless function for Razorpay payment verification
export default async function handler(req, res) {
  // CORS headers
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: 'Razorpay is not configured' });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Razorpay signature verification failed');
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const supabase = createSupabaseServiceClient();

    const { data: paymentLog, error: paymentLogError } = await supabase
      .from('payment_logs')
      .select('id, user_id')
      .eq('provider', 'razorpay')
      .eq('order_id', razorpay_order_id)
      .maybeSingle();

    if (paymentLogError || !paymentLog) {
      return res.status(400).json({ error: 'Unknown order reference' });
    }

    if (paymentLog.user_id !== user.id) {
      return res.status(403).json({ error: 'Order does not belong to authenticated user' });
    }

    await supabase
      .from('payment_logs')
      .update({
      payment_id: razorpay_payment_id,
      status: 'client_verified',
      })
      .eq('id', paymentLog.id);

    // Entitlement is upgraded only by verified server-side webhook.
    return res.status(200).json({ success: true, pendingWebhook: true });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
