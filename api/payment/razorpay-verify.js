import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createSupabaseServiceClient, getAuthenticatedUser, logPaymentBackendEnvStatus, setCorsHeaders } from './_auth.js';

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
    logPaymentBackendEnvStatus('razorpay-verify');

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
    const keyId = process.env.RAZORPAY_KEY_ID;
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

    let targetUserId = paymentLog?.user_id || null;

    if (paymentLogError) {
      console.warn('payment_logs lookup failed during Razorpay verification', {
        error: paymentLogError.message,
        orderId: razorpay_order_id,
      });
    }

    if (!targetUserId) {
      try {
        if (!keyId) {
          return res.status(500).json({ error: 'Razorpay is not configured' });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await razorpay.orders.fetch(razorpay_order_id);

        targetUserId = order?.notes?.userId || null;

        if (!targetUserId) {
          return res.status(400).json({ error: 'Unknown order reference' });
        }
      } catch (fetchError) {
        console.error('Failed to fetch Razorpay order for verification', {
          message: fetchError?.message || String(fetchError),
          orderId: razorpay_order_id,
        });
        return res.status(400).json({ error: 'Unknown order reference' });
      }
    }

    if (targetUserId !== user.id) {
      return res.status(403).json({ error: 'Order does not belong to authenticated user' });
    }

    if (paymentLog?.id) {
      await supabase
        .from('payment_logs')
        .update({
          payment_id: razorpay_payment_id,
          status: 'client_verified',
        })
        .eq('id', paymentLog.id);
    } else {
      const { error: insertLogError } = await supabase.from('payment_logs').insert({
        user_id: user.id,
        provider: 'razorpay',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: 'verified',
        created_at: new Date().toISOString(),
      });
      if (insertLogError) {
        console.warn('Could not persist Razorpay verification log', {
          error: insertLogError.message,
          orderId: razorpay_order_id,
          userId: user.id,
        });
      }
    }

    const { data: existingUser, error: profileLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileLookupError) {
      console.error('Failed to load user profile before Razorpay update', {
        error: profileLookupError.message,
        userId: user.id,
        orderId: razorpay_order_id,
      });
      return res.status(500).json({ error: 'Failed to load user profile' });
    }

    if (!existingUser) {
      return res.status(400).json({ error: 'User profile missing' });
    }

    const { error: planUpdateError } = await supabase
      .from('users')
      .update({
        plan: 'pro',
        payment_provider: 'razorpay',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (planUpdateError) {
      console.error('Failed to upgrade user plan after Razorpay verification', {
        error: planUpdateError.message,
        userId: user.id,
        orderId: razorpay_order_id,
      });
      return res.status(500).json({ error: 'Failed to persist payment result' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
