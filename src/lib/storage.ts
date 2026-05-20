import { supabase } from './supabase/client';
import type { InvoiceData, StoredInvoice, SavedTemplate, CompanyProfile } from './types';

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
  delete compact.id;
  return compact;
}

// ============================================================================
// INVOICES
// ============================================================================

const INVOICE_SELECT = 'id, user_id, invoice_json, created_at, updated_at';

/**
 * Save invoice. For Pro users, deduplicates by invoice_json->document->number
 * to prevent saving the same invoice multiple times on repeated downloads.
 */
export async function saveInvoice(
  invoice: InvoiceData,
  userId?: string
): Promise<StoredInvoice | null> {
  const compacted = compactInvoiceJson(invoice);

  // FREE: localStorage
  if (!userId) {
    const invoices = getLocalInvoices();
    // Dedup by invoice number
    const invoiceNumber = invoice.document?.number;
    if (invoiceNumber) {
      const existing = invoices.findIndex(
        inv => inv.invoice_json?.document?.number === invoiceNumber
      );
      if (existing !== -1) {
        // Update existing instead of creating duplicate
        invoices[existing] = {
          ...invoices[existing],
          invoice_json: compacted,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem('sk_free_invoices', JSON.stringify(invoices));
        return invoices[existing];
      }
    }
    const newInvoice: StoredInvoice = {
      id: `local_${Date.now()}`,
      user_id: 'local',
      invoice_json: compacted,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    // Keep max 50 entries
    localStorage.setItem('sk_free_invoices', JSON.stringify(invoices.slice(0, 50)));
    return newInvoice;
  }

  // PRO: Supabase — dedup by invoice number
  const invoiceNumber = invoice.document?.number;
  if (invoiceNumber) {
    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', userId)
      .eq('invoice_json->>document->>number', invoiceNumber)
      .maybeSingle();

    if (existing) {
      // Update existing invoice
      const { data, error } = await supabase
        .from('invoices')
        .update({ invoice_json: compacted })
        .eq('id', existing.id)
        .eq('user_id', userId)
        .select(INVOICE_SELECT)
        .single();
      if (error) throw error;
      return data;
    }
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert({ user_id: userId, invoice_json: compacted })
    .select(INVOICE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function getInvoices(
  userId?: string,
  limit = 50,
  offset = 0
): Promise<StoredInvoice[]> {
  // FREE: localStorage
  if (!userId) {
    return getLocalInvoices().slice(offset, offset + limit);
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('invoices')
    .select(INVOICE_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function deleteInvoice(id: string, userId?: string): Promise<void> {
  // FREE: localStorage
  if (!userId) {
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
  const template: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'> = {
    user_id: userId || 'local',
    template_name: name,
    settings_json: settings,
  };

  // FREE: localStorage
  if (!userId) {
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
    .insert(template)
    .select(TEMPLATE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function getTemplates(userId?: string): Promise<SavedTemplate[]> {
  // FREE: localStorage
  if (!userId) {
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
  // FREE: localStorage
  if (!userId) {
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

const PROFILE_SELECT = 'id, user_id, company_name, email, phone, address, city, state, pin, gstin, pan, logo_url, created_at, updated_at';

export async function saveCompanyProfile(
  profile: Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at'>,
  userId?: string
): Promise<CompanyProfile | null> {
  // FREE: localStorage
  if (!userId) {
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
      { ...profile, user_id: userId },
      { onConflict: 'user_id' }
    )
    .select(PROFILE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function getCompanyProfile(userId?: string): Promise<CompanyProfile | null> {
  // FREE: localStorage
  if (!userId) {
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
  return data || null;
}

// ============================================================================
// LOGO UPLOAD
// ============================================================================

export async function uploadLogo(
  file: File,
  userId?: string
): Promise<string | null> {
  // FREE: Data URL (stored in localStorage via Zustand)
  if (!userId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // PRO: Supabase Storage
  const ext = file.name.split('.').pop() || 'png';
  const path = `company-logos/${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('invoices').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteLogo(logoUrl: string, userId?: string): Promise<void> {
  // FREE: Nothing to do (data URLs don't need cleanup)
  if (!userId || logoUrl.startsWith('data:')) return;

  // PRO: Delete from Supabase Storage
  try {
    const url = new URL(logoUrl);
    const pathMatch = url.pathname.match(/company-logos\/.+/);
    if (!pathMatch) return;

    const { error } = await supabase.storage
      .from('invoices')
      .remove([pathMatch[0]]);

    if (error) console.warn('Failed to delete logo:', error);
  } catch {
    // Non-critical, don't throw
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
