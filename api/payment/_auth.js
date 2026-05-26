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

export function createSupabaseServiceClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export function createSupabaseAnonClient() {
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase anon credentials');
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
    'http://localhost:3000',
  ]);

  const allowedOrigin = origin && (allowedOrigins.has(origin) || isLocalhostOrigin(origin))
    ? origin
    : configuredOrigin;

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
