import { useState, useEffect } from 'react';
import { useInvoiceStore } from '../../hooks/useInvoiceStore';
import { useInvoiceStorage } from '../../hooks/useInvoiceStorage';
import { useToastStore } from '../../hooks/useToastStore';
import { formatCurrency } from '../../utils/calculations';
import type { StoredInvoice } from '../../lib/types';
import { Clock, Copy, Trash2, Loader2 } from 'lucide-react';

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const store = useInvoiceStore();
  const { addToast } = useToastStore();
  const { loadHistory, deleteEntry, restoreEntry, history, loading } = useInvoiceStorage();

  useEffect(() => {
    loadHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRestore = (entry: StoredInvoice) => {
    restoreEntry(entry);
    onClose();
  };

  const duplicateEntry = (entry: StoredInvoice) => {
    if (!entry.invoice_json) return;
    const last = localStorage.getItem('sk_last_inv');
    const num = last ? parseInt(last) + 1 : 1;
    localStorage.setItem('sk_last_inv', num.toString());
    const newNumber = `INV-${num.toString().padStart(4, '0')}`;

    const newState = {
      ...entry.invoice_json,
      document: { ...entry.invoice_json.document, number: newNumber },
    };
    store.loadState(newState as any);
    addToast('Invoice duplicated with new number');
    onClose();
  };

  const getEntryLabel = (entry: StoredInvoice) => {
    const inv = entry.invoice_json;
    if (!inv) return { name: 'Unnamed', number: entry.id, total: 0, currency: 'INR' };
    return {
      name: inv.client?.name || inv.business?.name || 'Unnamed',
      number: inv.document?.number || entry.id,
      total: 0, // We don't store computed totals — that's intentional to save space
      currency: inv.document?.currency || 'INR',
    };
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <h3 className="font-semibold text-gray-900">Invoice History</h3>
        </div>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
      </div>

      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-400">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 text-center">
          <Clock size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Your invoice history will appear here after your first download</p>
        </div>
      ) : (
        <div className="p-2 space-y-1">
          {history.map(entry => {
            const label = getEntryLabel(entry);
            return (
              <div key={entry.id} className="p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 group"
                onClick={() => handleRestore(entry)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{label.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label.number} · {new Date(entry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); duplicateEntry(entry); }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                    <Copy size={10} /> Duplicate
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded">
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
