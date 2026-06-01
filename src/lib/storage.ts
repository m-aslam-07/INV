import { supabase } from './supabase/client';
import type { InvoiceData, StoredInvoice, SavedTemplate, CompanyProfile } from './types';
import { calcTotals } from '../utils/calculations';

/**
 * Storage abstraction layer
 * Routes to localStorage (free) or Supabase (pro) based on user auth status
 */

// ============================================================================
// HELPERS
// ============================================================================

/** Strip empty strings / null / default values to minimize JSON payload */
function compactInvoiceJson(invoice: InvoiceData): InvoiceData {
  const compact = { ...invoice };
  // Remove empty optional strings from business
  const biz = { ...compact.business };
  if (!biz.gstin) delete (biz as any).gstin;
  if (!biz.pan) delete (biz as any).pan;
  if (!biz.logoUrl) delete (biz as any).logoUrl;
  compact.business = biz;
  // Remove empty optional strings from client
  const cl = { ...compact.client };
  if (!cl.gstin) delete (cl as any).gstin;
  if (!cl.poNumber) delete (cl as any).poNumber;
  compact.client = cl;
  // Remove default notes/terms to save space
  if (!compact.notes) delete (compact as any).notes;
  if (!compact.terms) delete (compact as any).terms;
  // Remove timestamps if present
  delete compact.createdAt;
  delete compact.updatedAt;
  return compact;
}

const LOGO_BUCKET = 'logos';
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg']);
const ALLOWED_LOGO_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]);

function validateLogoFile(file: File): string {
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    console.error('[storage.uploadLogo] invalid file size', {
      fileName: file.name,
      fileSize: file.size,
      maxSize: MAX_LOGO_SIZE_BYTES,
    });
    throw new Error('Logo file must be 5 MB or smaller');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();
  const mimeAllowed = mimeType ? ALLOWED_LOGO_MIME_TYPES.has(mimeType) : false;
  const extensionAllowed = ALLOWED_LOGO_EXTENSIONS.has(extension);

  if (!extensionAllowed && !mimeAllowed) {
    console.error('[storage.uploadLogo] invalid file type', {
      fileName: file.name,
      fileType: file.type,
      allowedExtensions: Array.from(ALLOWED_LOGO_EXTENSIONS),
    });
    throw new Error('Invalid logo file type. Use PNG, JPG, JPEG, WEBP, or SVG.');
  }

  return extension || 'png';
}

function getLogoStoragePathFromPublicUrl(logoUrl: string): string | null {
  try {
    const url = new URL(logoUrl);
    const marker = `/storage/v1/object/public/${LOGO_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

// ============================================================================
// INVOICES
// ============================================================================

const INVOICE_SELECT = '*';

type InvoiceSaveInput = Partial<InvoiceData> & {
  invoice_json?: InvoiceData;
  pdf_url?: string | null;
};

function extractInvoiceData(input: InvoiceSaveInput): InvoiceData {
  if (input.invoice_json) return input.invoice_json;
  if ((input as any).invoice_data) return (input as any).invoice_data as InvoiceData;
  return input as InvoiceData;
}

function buildInvoiceRecord(invoice: InvoiceData, userId: string, pdfUrl: string | null = null, jsonColumn: 'invoice_json' | 'invoice_data' = 'invoice_json') {
  const totals = calcTotals(invoice);
  const invoiceNumber = invoice.document?.number || invoice.id || '';
  return {
    user_id: userId,
    template: invoice.style?.template || '',
    invoice_number: invoiceNumber,
    client_name: invoice.client?.name || '',
    company_name: invoice.business?.name || '',
    subtotal: totals.subtotal,
    discount_total: totals.discount,
    tax_total: totals.gstAmount,
    total_amount: totals.total,
    currency: invoice.document?.currency || 'INR',
    pdf_url: pdfUrl,
    [jsonColumn]: compactInvoiceJson(invoice),
  };
}

function normalizeStoredInvoice(row: any): StoredInvoice {
  const invoice = row?.invoice_json || row?.invoice_data || {};
  const document = invoice.document || {};
  const business = invoice.business || {};
  const client = invoice.client || {};
  const totals = invoice.items ? calcTotals(invoice as InvoiceData) : null;

  return {
    id: row.id,
    user_id: row.user_id,
    template: row.template || invoice.style?.template || '',
    invoice_number: row.invoice_number || document.number || row.id,
    client_name: row.client_name || client.name || '',
    company_name: row.company_name || business.name || '',
    subtotal: Number(row.subtotal ?? totals?.subtotal ?? 0),
    discount_total: Number(row.discount_total ?? totals?.discount ?? 0),
    tax_total: Number(row.tax_total ?? totals?.gstAmount ?? 0),
    total_amount: Number(row.total_amount ?? totals?.total ?? 0),
    currency: (row.currency || document.currency || 'INR') as StoredInvoice['currency'],
    pdf_url: row.pdf_url ?? null,
    invoice_json: invoice as InvoiceData,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function getLocalInvoiceKey(invoice: InvoiceData): string {
  return invoice.id || invoice.document?.number || `local_${Date.now()}`;
}

function isSchemaMismatch(error: { message?: string; code?: string } | null | undefined): boolean {
  const message = (error?.message || '').toLowerCase();
  return (
    message.includes('does not exist') ||
    message.includes('column') ||
    message.includes('undefined') ||
    message.includes('could not find') ||
    message.includes('schema cache')
  );
}

async function saveInvoiceWithFallback(
  operation: 'insert' | 'update',
  userId: string,
  invoice: InvoiceData,
  pdfUrl: string | null,
  invoiceId?: string
): Promise<StoredInvoice | null> {
  const payloadVariants: Array<Record<string, unknown>> = [
    buildInvoiceRecord(invoice, userId, pdfUrl, 'invoice_json'),
    buildInvoiceRecord(invoice, userId, pdfUrl, 'invoice_data'),
    {
      user_id: userId,
      pdf_url: pdfUrl,
      invoice_json: compactInvoiceJson(invoice),
    },
    {
      user_id: userId,
      pdf_url: pdfUrl,
      invoice_data: compactInvoiceJson(invoice),
    },
  ];

  let lastError: any = null;

  for (const payload of payloadVariants) {
    const query = supabase.from('invoices');
    const request = operation === 'insert'
      ? query.insert(payload)
      : query.update(payload).eq('id', invoiceId!).eq('user_id', userId);

    const { data, error } = await request.select(INVOICE_SELECT).maybeSingle();
    if (!error) {
      return data ? normalizeStoredInvoice(data) : null;
    }

    lastError = error;
    if (!isSchemaMismatch(error)) {
      throw error;
    }
  }

  throw lastError;
}

async function isProUser(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Plan lookup failed, defaulting to local storage path:', error);
      return false;
    }

    return data?.plan === 'pro';
  } catch (error) {
    console.warn('Plan lookup threw, defaulting to local storage path:', error);
    return false;
  }
}

/**
 * Save invoice. For Pro users, deduplicates by invoice_json->document->number
 * to prevent saving the same invoice multiple times on repeated downloads.
 */
export async function saveInvoice(
  invoice: InvoiceData,
  userId?: string,
  options?: { pdfUrl?: string | null }
): Promise<StoredInvoice | null> {
  const proUser = await isProUser(userId);
  const pdfUrl = options?.pdfUrl ?? null;

  // FREE: localStorage
  if (!proUser) {
    const invoices = getLocalInvoices();
    const key = getLocalInvoiceKey(invoice);
    const existing = invoices.findIndex(inv => inv.invoice_json?.id === key || inv.id === key || (inv as any).invoice_number === invoice.document?.number);
    if (existing !== -1) {
      invoices[existing] = {
        ...invoices[existing],
        ...buildInvoiceRecord(invoice, 'local', pdfUrl),
        id: invoices[existing].id,
        user_id: 'local',
        created_at: invoices[existing].created_at,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('sk_free_invoices', JSON.stringify(invoices));
      return normalizeStoredInvoice(invoices[existing] as any);
    }
    const newInvoice: StoredInvoice = {
      id: key,
      user_id: 'local',
      ...buildInvoiceRecord(invoice, 'local', pdfUrl),
      invoice_json: compactInvoiceJson(invoice),
      template: invoice.style?.template || '',
      invoice_number: invoice.document?.number || key,
      client_name: invoice.client?.name || '',
      company_name: invoice.business?.name || '',
      subtotal: calcTotals(invoice).subtotal,
      discount_total: calcTotals(invoice).discount,
      tax_total: calcTotals(invoice).gstAmount,
      total_amount: calcTotals(invoice).total,
      currency: invoice.document?.currency || 'INR',
      pdf_url: pdfUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    // Keep max 50 entries
    localStorage.setItem('sk_free_invoices', JSON.stringify(invoices.slice(0, 50)));
    return newInvoice;
  }

  if (!userId) return null;

  const invoiceKey = invoice.document?.number || invoice.id || '';
  if (invoiceKey) {
    const { data: existing, error: existingError } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('user_id', userId)
      .or(`invoice_number.eq.${invoiceKey},id.eq.${invoice.id || invoiceKey}`)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return saveInvoiceWithFallback('update', userId, invoice, pdfUrl ?? existing.pdf_url ?? null, existing.id);
    }
  }

  return saveInvoiceWithFallback('insert', userId, invoice, pdfUrl);
}
export async function getInvoices(
  userId?: string,
  limit = 50,
  offset = 0
): Promise<StoredInvoice[]> {
  const proUser = await isProUser(userId);

  // FREE: localStorage
  if (!proUser) {
    return getLocalInvoices().slice(offset, offset + limit).map(normalizeStoredInvoice as any);
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('invoices')
    .select(INVOICE_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []).map(normalizeStoredInvoice);
}

export async function getInvoice(id: string, userId?: string): Promise<StoredInvoice | null> {
  const proUser = await isProUser(userId);

  if (!proUser) {
    const invoice = getLocalInvoices().find(entry => entry.id === id);
    return invoice ? normalizeStoredInvoice(invoice as any) : null;
  }

  const { data, error } = await supabase
    .from('invoices')
    .select(INVOICE_SELECT)
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeStoredInvoice(data) : null;
}

export async function updateInvoice(
  id: string,
  invoice: InvoiceSaveInput,
  userId?: string
): Promise<StoredInvoice | null> {
  const proUser = await isProUser(userId);
  const invoiceData = extractInvoiceData(invoice);

  if (!proUser) {
    const invoices = getLocalInvoices();
    const index = invoices.findIndex(entry => entry.id === id);
    if (index === -1) return null;

    invoices[index] = {
      ...invoices[index],
      ...buildInvoiceRecord(invoiceData, 'local', invoice.pdf_url ?? invoices[index].pdf_url ?? null),
      id,
      user_id: 'local',
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('sk_free_invoices', JSON.stringify(invoices));
    return normalizeStoredInvoice(invoices[index] as any);
  }

  if (!userId) return null;

  const payload = buildInvoiceRecord(invoiceData, userId, invoice.pdf_url ?? null);
  const { data, error } = await supabase
    .from('invoices')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select(INVOICE_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeStoredInvoice(data) : null;
}

export async function deleteInvoice(id: string, userId?: string): Promise<void> {
  const proUser = await isProUser(userId);

  // FREE: localStorage
  if (!proUser) {
    const invoices = getLocalInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('sk_free_invoices', JSON.stringify(filtered));
    return;
  }

  // PRO: Supabase
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// ============================================================================
// TEMPLATES
// ============================================================================

const TEMPLATE_SELECT = 'id, user_id, template_name, settings_json, created_at, updated_at';

export async function saveTemplate(
  name: string,
  settings: Partial<InvoiceData>,
  userId?: string
): Promise<SavedTemplate | null> {
  const proUser = await isProUser(userId);

  const template: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'> = {
    user_id: proUser && userId ? userId : 'local',
    template_name: name,
    settings_json: settings,
  };

  // FREE: localStorage
  if (!proUser) {
    const templates = getLocalTemplates();
    const saved: SavedTemplate = {
      ...template,
      id: `local_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    templates.unshift(saved);
    localStorage.setItem('sk_templates', JSON.stringify(templates.slice(0, 20)));
    return saved;
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('saved_templates')
    .upsert(template, { onConflict: 'user_id,template_name' })
    .select(TEMPLATE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function getTemplates(userId?: string): Promise<SavedTemplate[]> {
  const proUser = await isProUser(userId);

  // FREE: localStorage
  if (!proUser) {
    return getLocalTemplates();
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('saved_templates')
    .select(TEMPLATE_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteTemplate(id: string, userId?: string): Promise<void> {
  const proUser = await isProUser(userId);

  // FREE: localStorage
  if (!proUser) {
    const templates = getLocalTemplates();
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem('sk_templates', JSON.stringify(filtered));
    return;
  }

  // PRO: Supabase
  const { error } = await supabase
    .from('saved_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// ============================================================================
// COMPANY PROFILE
// ============================================================================

const PROFILE_SELECT = 'id, user_id, company_name, address, gst, logo_url, created_at, updated_at';

function mapCompanyProfileRow(data: {
  id: string;
  user_id: string;
  company_name: string | null;
  address: string | null;
  gst?: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}): CompanyProfile {
  return {
    id: data.id,
    user_id: data.user_id,
    company_name: data.company_name || '',
    email: '',
    phone: '',
    address: data.address || '',
    city: '',
    state: '',
    pin: '',
    gstin: data.gst || '',
    pan: '',
    logo_url: data.logo_url || null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function saveCompanyProfile(
  profile: Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at'>,
  userId?: string
): Promise<CompanyProfile | null> {
  const proUser = await isProUser(userId);

  // FREE: localStorage
  if (!proUser) {
    const saved = {
      ...profile,
      id: 'local',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as CompanyProfile;
    localStorage.setItem('sk_company_profile', JSON.stringify(saved));
    return saved;
  }

  // PRO: Supabase — upsert (insert or update)
  const { data, error } = await supabase
    .from('company_profiles')
    .upsert(
      {
        user_id: userId,
        company_name: profile.company_name,
        address: profile.address,
        gst: profile.gstin,
        logo_url: profile.logo_url,
      },
      { onConflict: 'user_id' }
    )
    .select(PROFILE_SELECT)
    .single();
  if (error) throw error;
  return data ? mapCompanyProfileRow(data as any) : null;
}

export async function getCompanyProfile(userId?: string): Promise<CompanyProfile | null> {
  const proUser = await isProUser(userId);

  // FREE: localStorage
  if (!proUser) {
    try {
      const profile = localStorage.getItem('sk_company_profile');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('company_profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapCompanyProfileRow(data as any);
}

// ============================================================================
// LOGO UPLOAD
// ============================================================================

export async function uploadLogo(
  file: File,
  userId?: string
): Promise<string | null> {
  const extension = validateLogoFile(file);
  const proUser = await isProUser(userId);

  // FREE: Data URL (stored in localStorage via Zustand)
  if (!proUser) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // If running with the demo/mock Pro user or Supabase is not configured,
  // fallback to Data URL to avoid network errors during local testing.
  try {
    if (typeof window !== 'undefined' && (localStorage.getItem('sk_mock_user') === 'pro')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  } catch (e) {
    // ignore localStorage access errors and continue to attempt Supabase upload
  }

  // PRO: Supabase Storage
  const path = `logos/${userId}/${Date.now()}.${extension}`;
  const storage = supabase.storage.from(LOGO_BUCKET);

  const { error: uploadError } = await storage.upload(path, file, {
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  });

  if (uploadError) {
    console.error('[storage.uploadLogo] upload failed', {
      bucket: LOGO_BUCKET,
      path,
      fileName: file.name,
      fileSize: file.size,
      error: uploadError.message,
    });

    if (uploadError.message.toLowerCase().includes('bucket not found')) {
      throw new Error(`Logo storage bucket "${LOGO_BUCKET}" not found`);
    }

    throw new Error(`Failed to upload logo: ${uploadError.message}`);
  }

  const { data } = storage.getPublicUrl(path);
  if (!data?.publicUrl) {
    console.error('[storage.uploadLogo] missing public url', {
      bucket: LOGO_BUCKET,
      path,
    });
    throw new Error('Failed to resolve public logo URL');
  }

  return data.publicUrl;
}

export async function deleteLogo(logoUrl: string, userId?: string): Promise<void> {
  const proUser = await isProUser(userId);

  // FREE: Nothing to do (data URLs don't need cleanup)
  if (!proUser || logoUrl.startsWith('data:')) return;

  // PRO: Delete from Supabase Storage
  try {
    const path = getLogoStoragePathFromPublicUrl(logoUrl);
    if (!path) return;

    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .remove([path]);

    if (error) {
      console.warn('[storage.deleteLogo] failed to delete logo', {
        bucket: LOGO_BUCKET,
        logoUrl,
        path,
        error: error.message,
      });
    }
  } catch (error) {
    // Non-critical, don't throw
    console.warn('[storage.deleteLogo] invalid logo url', {
      logoUrl,
      error: error instanceof Error ? error.message : error,
    });
  }
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

function getLocalInvoices(): StoredInvoice[] {
  try {
    const data = localStorage.getItem('sk_free_invoices');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getLocalTemplates(): SavedTemplate[] {
  try {
    const data = localStorage.getItem('sk_templates');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
