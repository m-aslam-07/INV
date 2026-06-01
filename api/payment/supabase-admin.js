import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, '..', '..');

const localEnvResult = loadEnv({ path: path.join(projectRoot, '.env.local'), override: true });
const baseEnvResult = loadEnv({ path: path.join(projectRoot, '.env'), override: false });

console.info('[payment] env loader', {
  projectRoot,
  localEnvParsed: Boolean(localEnvResult.parsed),
  localEnvKeys: Object.keys(localEnvResult.parsed || {}).length,
  baseEnvParsed: Boolean(baseEnvResult.parsed),
  baseEnvKeys: Object.keys(baseEnvResult.parsed || {}).length,
});

let envLogged = false;

function isPlaceholder(value) {
  if (!value || typeof value !== 'string') return true;

  const trimmed = value.trim();
  return (
    trimmed.length < 20 ||
    trimmed.startsWith('your-') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('server-only')
  );
}

export function getPaymentBackendEnvStatus() {
  return {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: !isPlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_SERVICE_ROLE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    RAZORPAY_KEY_ID: Boolean(process.env.RAZORPAY_KEY_ID),
    RAZORPAY_KEY_SECRET: Boolean(process.env.RAZORPAY_KEY_SECRET),
    RAZORPAY_KEY_SECRET_LENGTH: process.env.RAZORPAY_KEY_SECRET?.length || 0,
    RAZORPAY_WEBHOOK_SECRET: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    RAZORPAY_WEBHOOK_SECRET_LENGTH: process.env.RAZORPAY_WEBHOOK_SECRET?.length || 0,
    APP_URL: Boolean(process.env.APP_URL),
  };
}

export function logPaymentBackendEnvStatus(scope = 'payment') {
  if (envLogged) return;

  envLogged = true;
  console.info(`[${scope}] backend env status`, getPaymentBackendEnvStatus());
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL');
  }

  if (isPlaceholder(serviceRoleKey)) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export function createSupabaseAnonClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL');
  }

  if (isPlaceholder(anonKey)) {
    throw new Error('Missing SUPABASE_ANON_KEY');
  }

  return createClient(supabaseUrl, anonKey);
}

export function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}

export async function getAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

export function setCorsHeaders(req, res) {
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