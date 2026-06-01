import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useInvoiceStore, type InvoiceState } from './useInvoiceStore';
import { useToastStore } from './useToastStore';
import { saveInvoice, getInvoices, deleteInvoice as deleteInvoiceStorage } from '../lib/storage';
import type { StoredInvoice, InvoiceData } from '../lib/types';

function describeInvoiceHistoryError(err: unknown): string {
  if (!(err instanceof Error)) return 'Failed to load history';

  const message = err.message.toLowerCase();
  if (message.includes('unauthorized') || message.includes('not authenticated')) return 'Please sign in again to load history';
  if (message.includes('row-level security') || message.includes('permission denied') || message.includes('rls')) return 'Supabase blocked access to invoices (RLS policy)';
  if (message.includes('does not exist') || message.includes('relation') || message.includes('table')) return 'Invoices table or a required column is missing';
  if (message.includes('column') || message.includes('schema cache')) return 'Invoice schema mismatch in Supabase';
  return err.message;
}

interface UseInvoiceStorageReturn {
  /** Save the current invoice form state. Deduplicates by invoice number. */
  save: () => Promise<boolean>;
  /** Save the current invoice details without line items. */
  saveDetails: () => Promise<boolean>;
  /** Load invoice history. Lazy-loaded, cached after first call. */
  loadHistory: (options?: { limit?: number; offset?: number; append?: boolean; force?: boolean }) => Promise<StoredInvoice[]>;
  /** Delete an invoice from history */
  deleteEntry: (id: string) => Promise<void>;
  /** Restore an invoice from history into the editor */
  restoreEntry: (entry: StoredInvoice) => void;
  /** The loaded history entries */
  history: StoredInvoice[];
  /** Loading state */
  loading: boolean;
  /** Saving state */
  saving: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Hook for saving/loading invoices.
 * Routes to localStorage (free) or Supabase (pro) automatically.
 */
export function useInvoiceStorage(): UseInvoiceStorageReturn {
  const { isPro, user } = useAuthStore();
  const invoiceStore = useInvoiceStore();
  const { addToast } = useToastStore();

  const [history, setHistory] = useState<StoredInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const historyRef = useRef<StoredInvoice[]>([]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const userId = isPro && user ? user.id : undefined;

  const persist = useCallback(async (state: InvoiceState): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      // Cast InvoiceState to InvoiceData — they share the same shape
      const invoiceData = state as unknown as InvoiceData;
      await saveInvoice(invoiceData, userId);
      // Invalidate cache so next loadHistory refetches
      loadedRef.current = false;
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save invoice';
      setError(msg);
      console.error('[useInvoiceStorage.save] invoice save failed', {
        error: err,
        userId,
        plan: isPro ? 'pro' : 'free',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId]);

  const save = useCallback(async (): Promise<boolean> => {
    return persist(invoiceStore.getFullState());
  }, [invoiceStore, persist]);

  const saveDetails = useCallback(async (): Promise<boolean> => {
    const state = invoiceStore.getFullState();
    return persist({
      ...state,
      items: [],
    });
  }, [invoiceStore, persist]);

  const loadHistory = useCallback(async (options?: { limit?: number; offset?: number; append?: boolean; force?: boolean }): Promise<StoredInvoice[]> => {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const append = options?.append ?? false;
    const force = options?.force ?? false;

    // Return cached if already loaded this session and the caller did not request a refresh.
    const cachedHistory = historyRef.current;
    if (!force && loadedRef.current && cachedHistory.length > 0 && !append && offset === 0) return cachedHistory;

    setLoading(true);
    setError(null);
    try {
      const data = await getInvoices(userId, limit, offset);
      setHistory(prev => {
        if (!append || offset === 0) return data;
        const merged = [...prev];
        data.forEach(entry => {
          const index = merged.findIndex(item => item.id === entry.id);
          if (index === -1) merged.unshift(entry);
          else merged[index] = entry;
        });
        return merged;
      });
      loadedRef.current = true;
      return data;
    } catch (err) {
      const msg = describeInvoiceHistoryError(err);
      setError(msg);
      console.error('[useInvoiceStorage.loadHistory] history fetch failed', {
        error: err,
        userId,
        limit,
        offset,
        isPro,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await deleteInvoiceStorage(id, userId);
      setHistory(prev => prev.filter(e => e.id !== id));
      addToast('Invoice deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(msg);
      addToast('Failed to delete invoice');
    }
  }, [userId, addToast]);

  const restoreEntry = useCallback((entry: StoredInvoice): void => {
    if (entry.invoice_json) {
      // The stored invoice_json is an InvoiceData which maps to InvoiceState
      invoiceStore.loadState(entry.invoice_json as unknown as Partial<InvoiceState>);
      addToast('Invoice restored');
    }
  }, [invoiceStore, addToast]);

  return {
    save,
    saveDetails,
    loadHistory,
    deleteEntry,
    restoreEntry,
    history,
    loading,
    saving,
    error,
  };
}
