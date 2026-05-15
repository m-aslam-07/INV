import { supabase } from './supabase/client';
import { InvoiceData, StoredInvoice, SavedTemplate, CompanyProfile } from './types';

/**
 * Storage abstraction layer
 * Routes to localStorage (free) or Supabase (pro) based on user auth status
 */

// ============================================================================
// INVOICES
// ============================================================================

export async function saveInvoice(
  invoice: InvoiceData,
  userId?: string
): Promise<StoredInvoice | null> {
  // FREE: localStorage
  if (!userId) {
    const invoices = getLocalInvoices();
    const newInvoice: StoredInvoice = {
      id: invoice.id || `invoice_${Date.now()}`,
      user_id: 'local',
      invoice_json: invoice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    return newInvoice;
  }

  // PRO: Supabase
  const { data, error } = await supabase.from('invoices').insert({
    user_id: userId,
    invoice_json: invoice,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getInvoices(userId?: string): Promise<StoredInvoice[]> {
  // FREE: localStorage
  if (!userId) {
    return getLocalInvoices();
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getInvoice(id: string, userId?: string): Promise<StoredInvoice | null> {
  // FREE: localStorage
  if (!userId) {
    const invoices = getLocalInvoices();
    return invoices.find(inv => inv.id === id) || null;
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateInvoice(
  id: string,
  invoice: Partial<InvoiceData>,
  userId?: string
): Promise<StoredInvoice | null> {
  // FREE: localStorage
  if (!userId) {
    const invoices = getLocalInvoices();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) return null;

    invoices[index] = {
      ...invoices[index],
      invoice_json: { ...invoices[index].invoice_json, ...invoice },
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('invoices', JSON.stringify(invoices));
    return invoices[index];
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('invoices')
    .update({ invoice_json: invoice })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string, userId?: string): Promise<void> {
  // FREE: localStorage
  if (!userId) {
    const invoices = getLocalInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('invoices', JSON.stringify(filtered));
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

export async function saveTemplate(
  template: SavedTemplate,
  userId?: string
): Promise<SavedTemplate | null> {
  // FREE: localStorage
  if (!userId) {
    const templates = getLocalTemplates();
    templates.push(template);
    localStorage.setItem('templates', JSON.stringify(templates));
    return template;
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('saved_templates')
    .insert(template)
    .select()
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
    .select('*')
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
    localStorage.setItem('templates', JSON.stringify(filtered));
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

export async function saveCompanyProfile(
  profile: Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at'>,
  userId?: string
): Promise<CompanyProfile | null> {
  // FREE: localStorage
  if (!userId) {
    const profile_data = { ...profile, id: 'local', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    localStorage.setItem('company_profile', JSON.stringify(profile_data));
    return profile_data as CompanyProfile;
  }

  // PRO: Supabase
  const { data: existing } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('company_profiles')
      .update(profile)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('company_profiles')
      .insert({ ...profile, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function getCompanyProfile(userId?: string): Promise<CompanyProfile | null> {
  // FREE: localStorage
  if (!userId) {
    const profile = localStorage.getItem('company_profile');
    return profile ? JSON.parse(profile) : null;
  }

  // PRO: Supabase
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

function getLocalInvoices(): StoredInvoice[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('invoices');
  return data ? JSON.parse(data) : [];
}

function getLocalTemplates(): SavedTemplate[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('templates');
  return data ? JSON.parse(data) : [];
}

// ============================================================================
// STORAGE UPLOAD
// ============================================================================

export async function uploadLogo(
  file: File,
  userId?: string
): Promise<string | null> {
  // FREE: Data URL
  if (!userId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // PRO: Supabase Storage
  const path = `company-logos/${userId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('invoices').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteLogo(logoUrl: string, userId?: string): Promise<void> {
  // FREE: Nothing to do
  if (!userId || logoUrl.startsWith('data:')) return;

  // PRO: Delete from Supabase Storage
  const path = logoUrl.split('/').pop();
  if (!path) return;

  const { error } = await supabase.storage
    .from('invoices')
    .remove([`company-logos/${userId}/${path}`]);

  if (error) throw error;
}
