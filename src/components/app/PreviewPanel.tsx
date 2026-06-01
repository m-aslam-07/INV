import { useState, useEffect, useRef, Suspense, type TouchEvent } from 'react';
import { Loader2, Save, Check } from 'lucide-react';
import { useInvoiceStore, type InvoiceState } from '../../hooks/useInvoiceStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useInvoiceStorage } from '../../hooks/useInvoiceStorage';
import { useToastStore } from '../../hooks/useToastStore';
import { resolveTemplate } from '../invoice/templateRegistry';
import { ElementRemover } from './ElementRemover';

export function PreviewPanel() {
  const store = useInvoiceStore();
  const { isPro } = useAuthStore();
  const { saveDetails, saving } = useInvoiceStorage();
  const { addToast } = useToastStore();
  const [isMobilePreview, setIsMobilePreview] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [zoom, setZoom] = useState(() => {
    if (typeof window === 'undefined') return 75;
    return window.innerWidth < 768 ? 50 : 75;
  });
  const [updating, setUpdating] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const timerRef = useRef<number | null>(null);
  const detailsTimerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const pinchStateRef = useRef<{
    startDistance: number;
    startZoom: number;
    centerX: number;
    centerY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);

  const state = store.getFullState();
  const Template = resolveTemplate(state.style.template);
  const [editingLogo, setEditingLogo] = useState(false);
  const [logoSize, setLogoSize] = useState<number>(state.business.logoSize ?? 64);
  const [popoverPos, setPopoverPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  useEffect(() => {
    setUpdating(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setUpdating(false), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.business, state.client, state.document, state.items, state.tax, state.payment, state.notes, state.terms, state.style]);

  useEffect(() => {
    const updatePreviewMode = () => setIsMobilePreview(window.innerWidth < 768);
    updatePreviewMode();
    window.addEventListener('resize', updatePreviewMode);
    return () => window.removeEventListener('resize', updatePreviewMode);
  }, []);

  // Sync CSS variable for logo size on the preview target
  useEffect(() => {
    const el = document.getElementById('invoice-preview-target');
    if (el) {
      el.style.setProperty('--sk-logo-size', `${logoSize}px`);
    }
  }, [logoSize]);

  // Attach click handler to open logo size editor when logo image is clicked
  useEffect(() => {
    const wrapper = document.getElementById('invoice-preview-target');
    if (!wrapper) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName.toLowerCase() === 'img' && (target.getAttribute('alt') === 'Logo' || target.getAttribute('alt') === 'Business logo')) {
        const rect = wrapper.getBoundingClientRect();
        const scale = zoom / 100;
        // Position popover near click, accounting for scale
        const left = (e as MouseEvent).clientX - rect.left;
        const top = (e as MouseEvent).clientY - rect.top;
        setPopoverPos({ left: left / scale, top: top / scale });
        setLogoSize(state.business.logoSize ?? 64);
        setEditingLogo(true);
      }
    };

    wrapper.addEventListener('click', handler);
    return () => wrapper.removeEventListener('click', handler);
  }, [zoom, state.business.logoSize]);

  const applyLogoSize = (size: number) => {
    setLogoSize(size);
    store.updateBusiness({ logoSize: size });
    // persist to draft
  };

  const handlePreviewTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobilePreview || event.touches.length !== 2 || !previewViewportRef.current) return;

    const [firstTouch, secondTouch] = Array.from(event.touches);
    const firstPoint = { x: firstTouch.clientX, y: firstTouch.clientY };
    const secondPoint = { x: secondTouch.clientX, y: secondTouch.clientY };
    const centerX = (firstPoint.x + secondPoint.x) / 2 - previewViewportRef.current.getBoundingClientRect().left;
    const centerY = (firstPoint.y + secondPoint.y) / 2 - previewViewportRef.current.getBoundingClientRect().top;

    pinchStateRef.current = {
      startDistance: Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y),
      startZoom: zoom,
      centerX,
      centerY,
      startScrollLeft: previewViewportRef.current.scrollLeft,
      startScrollTop: previewViewportRef.current.scrollTop,
    };
  };

  const handlePreviewTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobilePreview || !pinchStateRef.current || !previewViewportRef.current || event.touches.length !== 2) return;

    event.preventDefault();
    const [firstTouch, secondTouch] = Array.from(event.touches);
    const currentDistance = Math.hypot(
      firstTouch.clientX - secondTouch.clientX,
      firstTouch.clientY - secondTouch.clientY
    );

    const nextZoom = Math.max(35, Math.min(180, (pinchStateRef.current.startZoom * currentDistance) / pinchStateRef.current.startDistance));
    const nextScale = nextZoom / 100;
    const currentScale = pinchStateRef.current.startZoom / 100;

    const contentX = (pinchStateRef.current.startScrollLeft + pinchStateRef.current.centerX) / currentScale;
    const contentY = (pinchStateRef.current.startScrollTop + pinchStateRef.current.centerY) / currentScale;

    previewViewportRef.current.scrollLeft = contentX * nextScale - pinchStateRef.current.centerX;
    previewViewportRef.current.scrollTop = contentY * nextScale - pinchStateRef.current.centerY;
    setZoom(Math.round(nextZoom));
  };

  const handlePreviewTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) {
      pinchStateRef.current = null;
    }
  };

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

  useEffect(() => {
    return () => {
      if (detailsTimerRef.current) clearTimeout(detailsTimerRef.current);
    };
  }, []);

  const handleSaveDetails = async () => {
    const ok = await saveDetails();
    if (!ok) {
      addToast('Failed to save invoice details');
      return;
    }

    setDetailsSaved(true);
    addToast('Invoice details saved');
    if (detailsTimerRef.current) clearTimeout(detailsTimerRef.current);
    detailsTimerRef.current = window.setTimeout(() => setDetailsSaved(false), 1800);
  };

  const scale = zoom / 100;
  const mobilePageWidth = `calc(210mm * ${scale})`;
  const mobilePageHeight = `calc(297mm * ${scale})`;

  return (
    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden bg-gray-50 p-3 sm:p-6" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">Live Preview</p>
          <ElementRemover />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={handleSaveDetails}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : detailsSaved ? <Check size={13} /> : <Save size={13} />}
            {saving ? 'Saving...' : detailsSaved ? 'Saved' : 'Save details'}
          </button>
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

      {/* A4 Preview with relative wrapper for overlay positioning */}
      <div className={isMobilePreview ? 'flex justify-center' : 'flex justify-center'}>
        {isMobilePreview ? (
          <div className="relative w-full max-w-full">
            <div
              ref={previewViewportRef}
              className="w-full overflow-auto overscroll-contain rounded-xl border border-gray-100 bg-gray-100/40"
              style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch', maxHeight: 'calc(100dvh - 10rem)' }}
              onTouchStart={handlePreviewTouchStart}
              onTouchMove={handlePreviewTouchMove}
              onTouchEnd={handlePreviewTouchEnd}
              onTouchCancel={handlePreviewTouchEnd}
            >
              <div className="relative" style={{ width: mobilePageWidth, height: mobilePageHeight }} id="invoice-preview-wrapper">
                <div
                  id="invoice-preview-target"
                  className="absolute left-0 top-0 bg-white shadow-xl rounded-lg p-4 sm:p-8"
                  style={{ width: '210mm', minHeight: '297mm', transform: `scale(${scale})`, transformOrigin: 'top left' }}
                >
                  <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading Template...</div>}>
                    <Template state={state} isPro={isPro} />
                  </Suspense>
                </div>
              </div>
            </div>
            {/* Logo size popover */}
            {editingLogo && (
              <div
                className="absolute bg-white shadow-lg rounded-md p-3 z-50 max-w-[calc(100vw-2rem)]"
                style={{ left: popoverPos.left, top: popoverPos.top, transform: 'translate(-50%, -120%)', minWidth: 220 }}
              >
                <div className="text-sm text-gray-700 mb-2">Logo size</div>
                <input type="range" min={32} max={200} value={logoSize} onChange={e => applyLogoSize(Number(e.target.value))} />
                <div className="flex items-center justify-between mt-2 gap-2">
                  <input className="border rounded px-2 py-1 text-sm w-20" value={logoSize} onChange={e => applyLogoSize(Number(e.target.value || 0))} />
                  <div className="flex gap-2">
                    <button className="px-2 py-1 text-sm border rounded" onClick={() => { setEditingLogo(false); store.updateBusiness({ logoSize }); }}>Done</button>
                    <button className="px-2 py-1 text-sm border rounded" onClick={() => { setEditingLogo(false); setLogoSize(state.business.logoSize ?? 64); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full max-w-full" id="invoice-preview-wrapper">
            <div
              className="mx-auto"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '210mm', minHeight: '297mm' }}
            >
              <div
                id="invoice-preview-target"
                className="bg-white shadow-xl rounded-lg p-4 sm:p-8"
                style={{ width: '210mm', minHeight: '297mm' }}
              >
                <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading Template...</div>}>
                  <Template state={state} isPro={isPro} />
                </Suspense>
              </div>
            </div>
            {/* Logo size popover */}
            {editingLogo && (
              <div
                className="absolute bg-white shadow-lg rounded-md p-3 z-50 max-w-[calc(100vw-2rem)]"
                style={{ left: popoverPos.left, top: popoverPos.top, transform: 'translate(-50%, -120%)', minWidth: 220 }}
              >
                <div className="text-sm text-gray-700 mb-2">Logo size</div>
                <input type="range" min={32} max={200} value={logoSize} onChange={e => applyLogoSize(Number(e.target.value))} />
                <div className="flex items-center justify-between mt-2 gap-2">
                  <input className="border rounded px-2 py-1 text-sm w-20" value={logoSize} onChange={e => applyLogoSize(Number(e.target.value || 0))} />
                  <div className="flex gap-2">
                    <button className="px-2 py-1 text-sm border rounded" onClick={() => { setEditingLogo(false); store.updateBusiness({ logoSize }); }}>Done</button>
                    <button className="px-2 py-1 text-sm border rounded" onClick={() => { setEditingLogo(false); setLogoSize(state.business.logoSize ?? 64); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
