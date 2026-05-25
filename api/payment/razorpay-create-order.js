import { createSupabaseServiceClient, getAuthenticatedUser, setCorsHeaders } from './_auth';

// Vercel serverless function for Razorpay order creation
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

    const payload = typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : (req.body || {});

    const { planType } = payload;

    if (!planType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['monthly', 'annual'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Derive trusted amount server-side to avoid client tampering
    const PRICING_PAISA = {
      monthly: 14900, // ₹149
      annual: 149900, // ₹1,499
    };

    const amount = PRICING_PAISA[planType];
    const currency = 'INR';

    // Server-side Razorpay credentials only (never use VITE_* on backend)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay config missing', {
        hasKeyId: Boolean(keyId),
        hasKeySecret: Boolean(keySecret),
      });
      return res.status(500).json({ error: 'Razorpay is not configured' });
    }

    // Razorpay receipt must be <= 40 chars.
    const receipt = `sk_${Date.now()}_${user.id.slice(0, 8)}`;

    // Create order via Razorpay API
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes: {
          userId: user.id,
          planType,
        },
      }),
    });

    const responseText = await orderRes.text();
    let order;
    try {
      order = responseText ? JSON.parse(responseText) : null;
    } catch {
      order = null;
    }

    if (!orderRes.ok || !order?.id) {
      console.error('Razorpay order creation failed', {
        status: orderRes.status,
        statusText: orderRes.statusText,
        responseBody: responseText,
        userId: user.id,
        planType,
        amount,
      });

      return res.status(502).json({
        error: 'Failed to create Razorpay order',
        details: process.env.NODE_ENV === 'development' ? responseText : undefined,
      });
    }

    const supabase = createSupabaseServiceClient();
    const { error: paymentLogError } = await supabase.from('payment_logs').insert({
      user_id: user.id,
      provider: 'razorpay',
      payment_id: null,
      order_id: order.id,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (paymentLogError) {
      console.error('Failed to insert payment log for Razorpay order', {
        error: paymentLogError.message,
        orderId: order.id,
        userId: user.id,
      });
      return res.status(500).json({ error: 'Failed to persist payment order' });
    }

    return res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
