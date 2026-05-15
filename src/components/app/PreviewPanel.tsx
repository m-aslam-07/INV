import { useState, useEffect, useRef, Suspense } from 'react';
import { useInvoiceStore, type InvoiceState } from '../../hooks/useInvoiceStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import { resolveTemplate } from '../invoice/templateRegistry';

export function PreviewPanel() {
  const store = useInvoiceStore();
  const { isPro } = useAuthStore();
  const [zoom, setZoom] = useState(75);
  const [updating, setUpdating] = useState(false);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const state = store.getFullState();
  const Template = resolveTemplate(state.style.template);

  useEffect(() => {
    setUpdating(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setUpdating(false), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.business, state.client, state.document, state.items, state.tax, state.payment, state.notes, state.terms, state.style]);

  // Load font on demand
  useEffect(() => {
    const font = state.style.fontFamily;
    if (font !== 'Inter') {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [state.style.fontFamily]);

  const scale = zoom / 100;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6" ref={containerRef}>
      {/* Zoom controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">Live Preview</p>
        <div className="flex items-center gap-1">
          {updating && (
            <span className="text-xs text-blue-500 mr-2 animate-pulse">Updating...</span>
          )}
          {[50, 75, 100].map(z => (
            <button key={z} onClick={() => setZoom(z)}
              className={`px-2 py-1 text-xs rounded ${zoom === z ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:bg-white/50'}`}>
              {z}%
            </button>
          ))}
        </div>
      </div>

      {/* A4 Preview */}
      <div className="flex justify-center">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '210mm', minHeight: '297mm' }}
        >
          <div
            id="invoice-preview-target"
            className="bg-white shadow-xl rounded-lg p-8"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading Template...</div>}>
              <Template state={state} isPro={isPro} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
