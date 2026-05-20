import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Vercel serverless function for Razorpay payment verification
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId) {
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

    // Signature verified — update user plan in Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured for server-side operations');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update user plan to 'pro'
    const { error: updateError } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          plan: 'pro',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (updateError) {
      console.error('Failed to update user plan:', updateError);
      return res.status(500).json({ error: 'Failed to update user plan' });
    }

    // Log the payment
    await supabase.from('payment_logs').insert({
      user_id: userId,
      provider: 'razorpay',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status: 'verified',
      created_at: new Date().toISOString(),
    }).catch(() => { /* payment_logs table might not exist yet */ });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
