import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInvoiceStore } from '../hooks/useInvoiceStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { useToastStore } from '../hooks/useToastStore';
import { useInvoiceStorage } from '../hooks/useInvoiceStorage';
import { useCompanyProfile } from '../hooks/useCompanyProfile';
import { FormPanel } from '../components/app/FormPanel';
import { PreviewPanel } from '../components/app/PreviewPanel';
import { HistoryPanel } from '../components/app/HistoryPanel';
import { UpgradeModal } from '../components/app/UpgradeModal';
import { LoginModal } from '../components/auth/LoginModal';
import { loadFromHash } from '../utils/shareLink';
import { buildInvoiceFilename, downloadInvoicePdfFromElement } from '../lib/invoicePdf';
import { Zap, Sparkles, LogOut, LogIn } from 'lucide-react';
import { Share2, Clock } from 'lucide-react';
import { ProGated } from '../components/app/ProGated';
import { generateShareLink } from '../utils/shareLink';

export default function AppPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>(() => {
    try { return (localStorage.getItem('sk_tab') as 'edit' | 'preview') || 'edit'; } catch { return 'edit'; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const store = useInvoiceStore();
  const { isPro, user, openLoginModal, signOut } = useAuthStore();
  const { addToast } = useToastStore();
  const invoiceStorage = useInvoiceStorage();
  // Auto-loads and fills company profile for Pro users
  useCompanyProfile();

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
      const source = document.getElementById('invoice-preview-target');
      if (!source) throw new Error('Preview element not found');
      const state = store.getFullState();
      await downloadInvoicePdfFromElement(source, buildInvoiceFilename(state));

      // Save to persistent storage (Supabase for Pro, localStorage for Free)
      try {
        await invoiceStorage.save();
      } catch (saveErr) {
        console.warn('[Invoice save warning]', saveErr);
        // Non-critical — PDF was already downloaded
      }

      setDownloadSuccess(true);
      addToast('PDF downloaded successfully');
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('[PDF generation error]', err);
      addToast('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  }, [store, addToast, invoiceStorage]);

  return (
    <div className="h-[100dvh] flex flex-col bg-white overflow-x-hidden">
      {/* App Navbar */}
      <header className="min-h-14 h-auto md:h-12 border-b border-gray-100 flex items-center justify-between px-3 py-3 md:px-4 md:py-0 flex-shrink-0 bg-white gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Strikin</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 flex-nowrap justify-end min-w-0">
          {!isPro && (
            <button onClick={() => useAuthStore.getState().openUpgradeModal('Pro features')}
              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              <Sparkles size={12} /> Upgrade to Pro
            </button>
          )}
          {/* Share & History (desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <ProGated feature="Shareable link">
              <button onClick={() => { const link = generateShareLink(store.getFullState()); navigator.clipboard.writeText(link); addToast('Link copied to clipboard'); }}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Share2 size={14} /> Share
              </button>
            </ProGated>

            <ProGated feature="Invoice history">
              <button onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Clock size={14} /> History
              </button>
            </ProGated>
          </div>

          {/* Mobile compact icons */}
          <div className="flex sm:hidden items-center gap-1"> 
            <ProGated feature="Shareable link">
              <button onClick={() => { const link = generateShareLink(store.getFullState()); navigator.clipboard.writeText(link); addToast('Link copied to clipboard'); }}
                title="Share" className="p-2 rounded-md text-gray-600 hover:bg-gray-50">
                <Share2 size={16} />
              </button>
            </ProGated>
            <ProGated feature="Invoice history">
              <button onClick={() => setShowHistory(!showHistory)} title="History" className="p-2 rounded-md text-gray-600 hover:bg-gray-50">
                <Clock size={16} />
              </button>
            </ProGated>
          </div>
          {user ? (
            <button onClick={signOut} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-2">
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <button onClick={openLoginModal} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-2">
              <LogIn size={14} /> Sign in
            </button>
          )}
        </div>
      </header>

      {/* Desktop layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Mobile tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex pb-[env(safe-area-inset-bottom)]">
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
        <div className={`w-full lg:w-[420px] lg:border-r border-gray-100 flex-shrink-0 min-h-0 ${activeTab !== 'edit' ? 'hidden lg:block' : ''}`}>
          <FormPanel
            onDownload={handleDownload}
            downloading={downloading}
            downloadSuccess={downloadSuccess}
            onShowHistory={() => setShowHistory(!showHistory)}
          />
        </div>

        {/* Right panel */}
        <div className={`flex-1 min-h-0 min-w-0 ${activeTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          <PreviewPanel />
        </div>

        {/* History panel */}
        {showHistory && (
          <>
            <div
              className="fixed inset-0 z-[90] bg-black/40 lg:hidden"
              onClick={() => setShowHistory(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-0 z-[100] flex lg:hidden bg-white">
              <div className="h-full w-full overflow-hidden bg-white">
                <HistoryPanel onClose={() => setShowHistory(false)} />
              </div>
            </div>
            <div className="hidden lg:block h-full w-[clamp(360px,32vw,420px)] min-w-[360px] max-w-[420px] shrink-0 border-l border-gray-100 bg-white overflow-hidden">
              <HistoryPanel onClose={() => setShowHistory(false)} />
            </div>
          </>
        )}
      </div>

      <UpgradeModal />
      <LoginModal />
    </div>
  );
}
