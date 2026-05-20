import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Vercel serverless function for Razorpay order creation
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
    const { amount, currency, userId, planType } = req.body;

    if (!amount || !currency || !userId || !planType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: 'Razorpay is not configured' });
    }

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
        receipt: `strikin_${userId}_${Date.now()}`,
        notes: {
          userId,
          planType,
        },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      console.error('Razorpay order creation failed:', errBody);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    const order = await orderRes.json();

    return res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
