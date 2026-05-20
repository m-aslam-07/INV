import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from './useAuthStore';
import { useInvoiceStore, type InvoiceState } from './useInvoiceStore';
import { useToastStore } from './useToastStore';
import {
  saveTemplate,
  getTemplates,
  deleteTemplate as deleteTemplateStorage,
} from '../lib/storage';
import type { SavedTemplate } from '../lib/types';

interface UseTemplateStorageReturn {
  /** Save current style + business defaults as a named template */
  save: (name: string) => Promise<boolean>;
  /** Load all saved templates. Lazy-loaded, cached after first call. */
  loadTemplates: () => Promise<SavedTemplate[]>;
  /** Delete a saved template */
  deleteEntry: (id: string) => Promise<void>;
  /** Apply a saved template to the current invoice */
  applyTemplate: (template: SavedTemplate) => void;
  /** The loaded templates */
  templates: SavedTemplate[];
  /** Loading state */
  loading: boolean;
  /** Saving state */
  saving: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Hook for saving/loading custom template presets.
 * Stores: style settings, brand color, font, template key.
 */
export function useTemplateStorage(): UseTemplateStorageReturn {
  const { isPro, user } = useAuthStore();
  const invoiceStore = useInvoiceStore();
  const { addToast } = useToastStore();

  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const userId = isPro && user ? user.id : undefined;

  const save = useCallback(async (name: string): Promise<boolean> => {
    if (!name.trim()) {
      setError('Template name is required');
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const state = invoiceStore.getFullState();
      // Only store style-related settings, not invoice-specific data
      const settings: Record<string, unknown> = {
        style: state.style,
        business: {
          name: state.business.name,
          logoUrl: state.business.logoUrl,
        },
        profession: state.profession,
      };

      await saveTemplate(name.trim(), settings as any, userId);
      // Invalidate cache
      loadedRef.current = false;
      addToast(`Template "${name}" saved`);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save template';
      setError(msg);
      addToast('Failed to save template');
      return false;
    } finally {
      setSaving(false);
    }
  }, [invoiceStore, userId, addToast]);

  const loadTemplates = useCallback(async (): Promise<SavedTemplate[]> => {
    if (loadedRef.current && templates.length > 0) return templates;

    setLoading(true);
    setError(null);
    try {
      const data = await getTemplates(userId);
      setTemplates(data);
      loadedRef.current = true;
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load templates';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, templates]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await deleteTemplateStorage(id, userId);
      setTemplates(prev => prev.filter(t => t.id !== id));
      addToast('Template deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete template';
      setError(msg);
    }
  }, [userId, addToast]);

  const applyTemplate = useCallback((template: SavedTemplate): void => {
    if (!template.settings_json) return;
    const settings = template.settings_json;
    if (settings.style) {
      invoiceStore.updateStyle(settings.style as Partial<InvoiceState['style']>);
    }
    if (settings.profession) {
      invoiceStore.setProfession(settings.profession);
    }
    addToast(`Template "${template.template_name}" applied`);
  }, [invoiceStore, addToast]);

  return {
    save,
    loadTemplates,
    deleteEntry,
    applyTemplate,
    templates,
    loading,
    saving,
    error,
  };
}
