import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInvoiceStore } from '../hooks/useInvoiceStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { useToastStore } from '../hooks/useToastStore';
import { FormPanel } from '../components/app/FormPanel';
import { PreviewPanel } from '../components/app/PreviewPanel';
import { HistoryPanel } from '../components/app/HistoryPanel';
import { UpgradeModal } from '../components/app/UpgradeModal';
import { calcTotals } from '../utils/calculations';
import { loadFromHash } from '../utils/shareLink';
import { Zap, Sparkles } from 'lucide-react';

export default function AppPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>(() => {
    try { return (localStorage.getItem('sk_tab') as 'edit' | 'preview') || 'edit'; } catch { return 'edit'; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const store = useInvoiceStore();
  const { isPro } = useAuthStore();
  const { addToast } = useToastStore();

  // Load from URL params on mount
  useEffect(() => {
    const profession = searchParams.get('profession');
    if (profession) store.setProfession(profession);
    const template = searchParams.get('template');
    if (template) store.updateStyle({ template });
    
    const hashState = loadFromHash();
    if (hashState) store.loadState(hashState);
  }, []); // eslint-disable-line

  useEffect(() => {
    try { localStorage.setItem('sk_tab', activeTab); } catch {}
  }, [activeTab]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const source = document.getElementById('invoice-preview-target');
      if (!source) throw new Error('Preview element not found');

      // html2canvas clones the entire document into an off-screen iframe before
      // painting. The `onclone` callback gives us the cloned element to modify
      // freely — strip the CSS scale() zoom transform so the clone renders at
      // the template's true A4 dimensions, not the UI zoom level.
      const canvas = await html2canvas(source, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
          // Strip scale() from the zoom wrapper
          const wrapper = clonedEl.parentElement;
          if (wrapper) {
            wrapper.style.transform = 'none';
            wrapper.style.transformOrigin = 'top left';
            wrapper.style.width = 'auto';
          }
          // Ensure the invoice itself is at A4 width (794 px @ 96 dpi)
          clonedEl.style.transform = 'none';
          clonedEl.style.width = '794px';
          clonedEl.style.minHeight = 'auto';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.borderRadius = '0';
          clonedEl.style.overflow = 'visible';
        },
        width: source.scrollWidth || 794,
        height: source.scrollHeight || 1123,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      const pageW = 210;
      const pageH = 297;
      const imgH = (canvas.height * pageW) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH);
      let leftHeight = imgH - pageH;
      while (leftHeight > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -(imgH - leftHeight), pageW, imgH);
        leftHeight -= pageH;
      }

      const state = store.getFullState();
      const fname = [
        state.document.number,
        state.client.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20),
        state.document.date,
      ].filter(Boolean).join('_') + '.pdf';

      pdf.save(fname);

      // Save to history
      const totals = calcTotals(state);
      const historyEntry = {
        id: Math.random().toString(36).substring(2, 9),
        savedAt: new Date().toISOString(),
        invoiceNumber: state.document.number,
        clientName: state.client.name,
        total: totals.total,
        currency: state.document.currency,
        state,
      };
      try {
        const existing = JSON.parse(localStorage.getItem('sk_history') || '[]');
        const updated = [historyEntry, ...existing].slice(0, 50);
        localStorage.setItem('sk_history', JSON.stringify(updated));
      } catch {}

      setDownloadSuccess(true);
      addToast('PDF downloaded successfully');
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('[PDF generation error]', err);
      addToast('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  }, [store, addToast]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* App Navbar */}
      <header className="h-12 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 bg-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Strikin</span>
        </Link>
        <div className="flex items-center gap-2">
          {!isPro && (
            <button onClick={() => useAuthStore.getState().openUpgradeModal('Pro features')}
              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              <Sparkles size={12} /> Upgrade to Pro
            </button>
          )}
        </div>
      </header>

      {/* Desktop layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex">
          <button onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'edit' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-500'}`}>
            Edit
          </button>
          <button onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'preview' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-500'}`}>
            Preview
          </button>
        </div>

        {/* Left panel */}
        <div className={`w-full lg:w-[420px] lg:border-r border-gray-100 flex-shrink-0 ${activeTab !== 'edit' ? 'hidden lg:block' : ''}`}>
          <FormPanel
            onDownload={handleDownload}
            downloading={downloading}
            downloadSuccess={downloadSuccess}
            onShowHistory={() => setShowHistory(!showHistory)}
          />
        </div>

        {/* Right panel */}
        <div className={`flex-1 ${activeTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          <PreviewPanel />
        </div>

        {/* History panel */}
        {showHistory && (
          <div className="w-80 border-l border-gray-100 bg-white flex-shrink-0">
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </div>
        )}
      </div>

      <UpgradeModal />
    </div>
  );
}
