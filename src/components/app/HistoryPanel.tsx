import { useState, useEffect } from 'react';
import { useInvoiceStore } from '../../hooks/useInvoiceStore';
import { useToastStore } from '../../hooks/useToastStore';
import { formatCurrency } from '../../utils/calculations';
import { Clock, Copy, Trash2 } from 'lucide-react';

interface HistoryEntry {
  id: string;
  savedAt: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  currency: string;
  state: ReturnType<typeof useInvoiceStore.getState>['getFullState'] extends () => infer R ? R : never;
}

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const store = useInvoiceStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sk_history');
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  const loadEntry = (entry: HistoryEntry) => {
    store.loadState(entry.state);
    addToast('Invoice restored from history');
    onClose();
  };

  const duplicateEntry = (entry: HistoryEntry) => {
    const last = localStorage.getItem('ik_last_inv');
    const num = last ? parseInt(last) + 1 : 1;
    localStorage.setItem('ik_last_inv', num.toString());
    const newNumber = `INV-${num.toString().padStart(4, '0')}`;
    const newState = { ...entry.state, document: { ...entry.state.document, number: newNumber } };
    store.loadState(newState);
    addToast('Invoice duplicated with new number');
    onClose();
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('sk_history', JSON.stringify(updated));
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

      {entries.length === 0 ? (
        <div className="p-8 text-center">
          <Clock size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Your invoice history will appear here after your first download</p>
        </div>
      ) : (
        <div className="p-2 space-y-1">
          {entries.map(entry => (
            <div key={entry.id} className="p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 group"
              onClick={() => loadEntry(entry)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{entry.clientName || 'Unnamed'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{entry.invoiceNumber} · {new Date(entry.savedAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(entry.total, entry.currency)}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
