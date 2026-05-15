import { supabase } from './supabase/client';
import { env } from './env';
import { getShareLink } from './supabase/queries';

/**
 * Generate a shareable link for an invoice
 */
export async function generateShareLink(
  invoiceId: string,
  userId: string,
  expirationMinutes?: number
) {
  try {
    const { data, error } = await supabase
      .from('shared_invoices')
      .insert({
        user_id: userId,
        invoice_id: invoiceId,
        token: generateToken(),
        expires_at: expirationMinutes
          ? new Date(Date.now() + expirationMinutes * 60000).toISOString()
          : null,
      })
      .select()
      .single();

    if (error) throw error;

    return getShareLink(data.token, env.NEXT_PUBLIC_APP_URL);
  } catch (error) {
    console.error('Failed to generate share link:', error);
    throw error;
  }
}

/**
 * Get share links for an invoice
 */
export async function getInvoiceShareLinks(
  invoiceId: string,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from('shared_invoices')
      .select('*')
      .eq('user_id', userId)
      .eq('invoice_id', invoiceId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get share links:', error);
    throw error;
  }
}

/**
 * Revoke a share link
 */
export async function revokeShareLink(token: string, userId: string) {
  try {
    const { error } = await supabase
      .from('shared_invoices')
      .delete()
      .eq('token', token)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to revoke share link:', error);
    throw error;
  }
}

/**
 * Get shared invoice by token (public access)
 */
export async function getSharedInvoiceByToken(token: string) {
  try {
    const { data, error } = await supabase
      .from('shared_invoices')
      .select(`
        *,
        invoices:invoice_id (
          id,
          invoice_json,
          created_at
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
  } catch (error) {
    console.error('Failed to get shared invoice:', error);
    return null;
  }
}

function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(invoice: any) {
  let subtotal = 0;

  for (const item of invoice.items) {
    if (item.type === 'item') {
      subtotal += item.quantity * item.rate;
    }
  }

  let tax = 0;
  if (invoice.tax.gstEnabled) {
    tax = (subtotal * invoice.tax.gstRate) / 100;
  }

  let discount = 0;
  if (invoice.tax.discountEnabled) {
    if (invoice.tax.discountType === 'percent') {
      discount = (subtotal * invoice.tax.discountValue) / 100;
    } else {
      discount = invoice.tax.discountValue;
    }
  }

  const total = subtotal - discount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
  };
}
