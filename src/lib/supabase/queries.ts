import { supabase } from './client';
import { SharedInvoice, UserProfile } from '../types';

/**
 * Supabase database queries
 * Server-side safe queries for users, subscriptions, and shared invoices
 */

// ============================================================================
// USERS & SUBSCRIPTIONS
// ============================================================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateUserPlan(userId: string, plan: 'free' | 'pro') {
  throw new Error('Direct client-side plan updates are disabled. Use verified payment webhooks.');
}

// ============================================================================
// SHARED INVOICES
// ============================================================================

export async function createShareLink(
  invoiceId: string,
  userId: string,
  expiresIn?: number // minutes
): Promise<SharedInvoice> {
  const token = generateToken();
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 60000).toISOString() : null;

  const { data, error } = await supabase
    .from('shared_invoices')
    .insert({
      user_id: userId,
      invoice_id: invoiceId,
      token,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSharedInvoice(token: string) {
  const { data, error } = await supabase
    .from('shared_invoices')
    .select(`
      *,
      invoices:invoice_id (
        id,
        invoice_json,
        created_at
      ),
      users!inner (
        email,
        plan
      )
    `)
    .eq('token', token)
    .single();

  if (error) throw error;
  if (!data) return null;

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data;
}

export async function revokeShareLink(token: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('shared_invoices')
    .delete()
    .eq('token', token)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getShareLinks(userId: string, invoiceId: string) {
  const { data, error } = await supabase
    .from('shared_invoices')
    .select('*')
    .eq('user_id', userId)
    .eq('invoice_id', invoiceId);

  if (error) throw error;
  return data || [];
}

// ============================================================================
// HELPERS
// ============================================================================

function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getShareLink(token: string, baseUrl: string): string {
  return `${baseUrl}/share/${token}`;
}
