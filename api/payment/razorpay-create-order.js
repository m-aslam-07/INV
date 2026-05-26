import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  return process.env.SUPABASE_URL;
}

function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY;
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function createSupabaseServiceClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function createSupabaseAnonClient() {
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase anon credentials');
  }

  return createClient(supabaseUrl, anonKey);
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}

async function getAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

function isProbablyPlaceholder(value) {
  if (!value || typeof value !== 'string') return true;
  const trimmed = value.trim();
  return (
    trimmed.length < 20 ||
    trimmed.startsWith('your-') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('server-only')
  );
}

function createServiceClientIfConfigured() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || isProbablyPlaceholder(serviceRoleKey)) {
    return null;
  }

  try {
    return createClient(supabaseUrl, serviceRoleKey);
  } catch (error) {
    console.error('Failed to initialize Supabase service client', {
      message: error?.message || String(error),
      hasUrl: Boolean(supabaseUrl),
    });
    return null;
  }
}

function setCorsHeaders(req, res) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const origin = req.headers.origin;
  const configuredOrigin = (() => {
    try {
      return new URL(appUrl).origin;
    } catch {
      return 'http://localhost:5173';
    }
  })();

  const isLocalhostOrigin = (value) => {
    if (!value) return false;
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
  };

  const allowedOrigins = new Set([
    configuredOrigin,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5199',
    'http://localhost:5200',
    'http://localhost:3000',
  ]);

  const allowedOrigin = origin && (allowedOrigins.has(origin) || isLocalhostOrigin(origin))
    ? origin
    : configuredOrigin;

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

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

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    let order;
    try {
      order = await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes: {
          userId: user.id,
          planType,
        },
      });
    } catch (createError) {
      const safeError = {
        message: createError?.message || 'Unknown Razorpay error',
        statusCode: createError?.statusCode,
        errorCode: createError?.error?.code,
        errorDescription: createError?.error?.description,
      };

      console.error('Razorpay SDK order creation failed', {
        safeError,
        userId: user.id,
        planType,
        amount,
      });

      return res.status(502).json({
        error: 'Failed to create Razorpay order',
        details: process.env.NODE_ENV === 'development' ? safeError : undefined,
      });
    }

    if (!order?.id) {
      console.error('Razorpay SDK returned invalid order payload', {
        userId: user.id,
        planType,
        amount,
        order,
      });
      return res.status(502).json({ error: 'Failed to create Razorpay order' });
    }

    // Best-effort logging only: do not block checkout if persistence fails.
    const supabase = createServiceClientIfConfigured();
    if (supabase) {
      try {
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
        }
      } catch (logError) {
        console.error('Razorpay payment log persistence threw', {
          message: logError?.message || String(logError),
          orderId: order.id,
          userId: user.id,
        });
      }
    } else {
      console.warn('Skipping Razorpay payment log persistence: Supabase service key not configured');
    }

    return res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
