import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Copy, Download, Eye, Loader2, PencilLine, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useInvoiceStorage } from '../../hooks/useInvoiceStorage';
import { useInvoiceStore } from '../../hooks/useInvoiceStore';
import { useToastStore } from '../../hooks/useToastStore';
import { formatCurrency } from '../../utils/calculations';
import { buildInvoiceFilename, downloadInvoicePdfFromState } from '../../lib/invoicePdf';
import { resolveTemplate } from '../invoice/templateRegistry';
import type { StoredInvoice } from '../../lib/types';

const PAGE_SIZE = 12;

const actionButtonClass = 'inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 sm:px-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap w-full';

const actionButtonTone = {
  neutral: 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  green: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
  red: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
} as const;

function nextInvoiceNumber(): string {
  try {
    const last = localStorage.getItem('sk_last_inv');
    const next = last ? Number.parseInt(last, 10) + 1 : 1;
    localStorage.setItem('sk_last_inv', String(next));
    return `INV-${String(next).padStart(4, '0')}`;
  } catch {
    return `INV-${Date.now().toString().slice(-6)}`;
  }
}

function getInvoiceDateLabel(date: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getInvoiceAmountLabel(amount: number, currency: StoredInvoice['currency']): string {
  if (!Number.isFinite(amount) || amount <= 0) return '';

  try {
    return formatCurrency(amount, currency);
  } catch {
    return '';
  }
}

function HistoryCardActions({
  onPreview,
  onEdit,
  onDuplicate,
  onDownload,
  onDelete,
}: {
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid w-full gap-2 sm:max-w-[420px] sm:justify-self-end">
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onPreview} className={`${actionButtonClass} ${actionButtonTone.neutral}`}>
          <Eye size={14} /> <span className="truncate">Preview</span>
        </button>
        <button onClick={onEdit} className={`${actionButtonClass} ${actionButtonTone.blue}`}>
          <PencilLine size={14} /> <span className="truncate">Edit</span>
        </button>
        <button onClick={onDuplicate} className={`${actionButtonClass} ${actionButtonTone.neutral}`}>
          <Copy size={14} /> <span className="truncate">Duplicate</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onDownload} className={`${actionButtonClass} ${actionButtonTone.green}`}>
          <Download size={14} /> <span className="truncate">PDF Download</span>
        </button>
        <button onClick={onDelete} className={`${actionButtonClass} ${actionButtonTone.red}`}>
          <Trash2 size={14} /> <span className="truncate">Delete</span>
        </button>
      </div>
    </div>
  );
}

function InvoicePreview({ entry }: { entry: StoredInvoice }) {
  const Template = resolveTemplate(entry.template || entry.invoice_json.style.template);
  const state = entry.invoice_json;

  return (
    <div className="overflow-auto rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
      <div className="mx-auto w-[794px] max-w-none bg-white shadow-lg rounded-xl overflow-hidden" style={{ minHeight: '1123px' }}>
        <Template state={state} isPro />
      </div>
    </div>
  );
}

export function InvoiceHistoryBrowser({ compact = false, onClose }: { compact?: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const store = useInvoiceStore();
  const { addToast } = useToastStore();
  const { loadHistory, deleteEntry, restoreEntry, history, loading, error, loaded } = useInvoiceStorage();
  const [selectedEntry, setSelectedEntry] = useState<StoredInvoice | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [history]);

  useEffect(() => {
    let mounted = true;
    if (!loaded) {
      console.log('[history-debug] opening history');
      loadHistory({ limit: PAGE_SIZE, offset: 0, force: true }).then((data) => {
        if (!mounted) return;
        setHasMore(data.length === PAGE_SIZE);
      });
    } else {
      setHasMore(history.length >= PAGE_SIZE);
    }
    return () => { mounted = false; };
  }, [loaded, loadHistory, history.length]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await loadHistory({ limit: PAGE_SIZE, offset: sortedHistory.length, append: true });
      setHasMore(data.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleEdit = (entry: StoredInvoice) => {
    restoreEntry(entry);
    addToast('Invoice loaded into the editor');
    navigate('/app');
    onClose?.();
  };

  const handleDuplicate = (entry: StoredInvoice) => {
    const duplicated = {
      ...entry.invoice_json,
      id: undefined,
      document: {
        ...entry.invoice_json.document,
        number: nextInvoiceNumber(),
      },
    };

    store.loadState(duplicated as any);
    addToast('Invoice duplicated. Review and save it from the editor.');
    navigate('/app');
    onClose?.();
  };

  const handleDownload = async (entry: StoredInvoice) => {
    try {
      if (entry.pdf_url) {
        window.open(entry.pdf_url, '_blank', 'noopener,noreferrer');
        return;
      }

      await downloadInvoicePdfFromState(entry.invoice_json, buildInvoiceFilename(entry.invoice_json));
      addToast('PDF generated');
    } catch (downloadError) {
      console.error('Failed to download invoice PDF:', downloadError);
      addToast('Failed to download PDF');
    }
  };

  const handleDelete = async (entry: StoredInvoice) => {
    if (!window.confirm('Delete this invoice?')) return;
    await deleteEntry(entry.id);
  };

  const rows = sortedHistory;

  return (
    <div className={compact ? 'h-full flex flex-col min-h-0 bg-white' : 'min-h-screen bg-gradient-to-b from-gray-50 to-white'}>
      <div className={compact ? 'border-b border-gray-100 px-4 py-4' : 'sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur px-4 sm:px-6 py-4'}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-[0.18em]">
              <Clock size={14} /> Invoice history
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900">Saved invoices</h2>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Review cloud-synced invoices, reopen them in the editor, duplicate a draft, or download a fresh PDF.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
              aria-label="Close history"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={compact ? 'flex-1 min-h-0 overflow-y-auto p-3 sm:p-4' : 'mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8'}>
        {loading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <Loader2 size={22} className="mx-auto animate-spin text-blue-500" />
            <p className="mt-3 text-sm text-gray-500">Loading invoice history...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Unable to load invoice history</p>
            <p className="mt-1 text-red-700/90">{error}</p>
            <button
              onClick={() => loadHistory({ limit: PAGE_SIZE, offset: 0, force: true })}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <Clock size={28} className="mx-auto text-gray-200" />
            <h3 className="mt-3 text-base font-semibold text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your first downloaded PRO invoice will appear here automatically.
            </p>
            <button
              onClick={() => loadHistory({ limit: PAGE_SIZE, offset: 0, force: true })}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retry load
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {rows.map((entry) => {
              const amountLabel = getInvoiceAmountLabel(entry.total_amount, entry.currency);
              const templateLabel = entry.template || entry.invoice_json.style.template;
              const dateLabel = getInvoiceDateLabel(entry.created_at);
              return (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-gray-100 bg-white px-3 py-3 sm:px-4 sm:py-3.5 shadow-sm shadow-gray-100 transition-shadow hover:shadow-md"
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)] sm:gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="truncate text-[15px] font-semibold tracking-tight text-gray-900 sm:text-base">
                          {entry.invoice_number}
                        </h3>
                        {amountLabel && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 whitespace-nowrap">
                            {amountLabel}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-sm text-gray-500">
                        <span className="whitespace-nowrap">{dateLabel}</span>
                        <span className="text-gray-300">•</span>
                        <span className="inline-flex max-w-full items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-600 truncate">
                          {templateLabel}
                        </span>
                      </div>
                    </div>

                    <HistoryCardActions
                      onPreview={() => setSelectedEntry(entry)}
                      onEdit={() => handleEdit(entry)}
                      onDuplicate={() => handleDuplicate(entry)}
                      onDownload={() => handleDownload(entry)}
                      onDelete={() => handleDelete(entry)}
                    />
                  </div>
                </article>
              );
            })}

            <div className="flex justify-center pt-2">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                  Load more
                </button>
              ) : (
                rows.length > PAGE_SIZE && (
                  <button
                    onClick={() => loadHistory({ limit: PAGE_SIZE, offset: 0, force: true })}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronUp size={14} /> Refresh list
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
          <div className="relative z-[121] w-full max-w-6xl max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Preview</p>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEntry.invoice_number}</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(100dvh-7rem)] overflow-auto p-3 sm:p-6 bg-gray-50">
              <InvoicePreview entry={selectedEntry} />
            </div>
          </div>
        </div>
      )}

      {compact && onClose && (
        <div className="border-t border-gray-100 p-3 sm:p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close history
          </button>
        </div>
      )}
    </div>
  );
}
