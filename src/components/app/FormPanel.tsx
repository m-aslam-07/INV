import { useState } from 'react';
import { useInvoiceStore } from '../../hooks/useInvoiceStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useToastStore } from '../../hooks/useToastStore';
import { ProGated } from './ProGated';
import { generateShareLink } from '../../utils/shareLink';
import { WizardProgress } from './WizardProgress';
import { StepProfession } from './steps/StepProfession';
import { StepDetails } from './steps/StepDetails';
import { StepLineItems } from './steps/StepLineItems';
import { StepTaxDiscount } from './steps/StepTaxDiscount';
import { StepDesign } from './steps/StepDesign';
import {
  ArrowLeft, ArrowRight, Download, Share2, Clock, Trash2,
  Loader2, Check,
} from 'lucide-react';

interface FormPanelProps {
  onDownload: () => void;
  downloading: boolean;
  downloadSuccess: boolean;
  onShowHistory: () => void;
}

export function FormPanel({ onDownload, downloading, downloadSuccess, onShowHistory }: FormPanelProps) {
  const [step, setStep] = useState(1);
  const [showClearModal, setShowClearModal] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');

  const store = useInvoiceStore();
  const { addToast } = useToastStore();

  const goNext = () => {
    if (step < 5) { setSlideDir('right'); setStep(s => s + 1); }
  };
  const goBack = () => {
    if (step > 1) { setSlideDir('left'); setStep(s => s - 1); }
  };
  const goTo = (s: number) => {
    setSlideDir(s > step ? 'right' : 'left');
    setStep(s);
  };

  const handleCopyLink = () => {
    const link = generateShareLink(store.getFullState());
    navigator.clipboard.writeText(link);
    addToast('Link copied to clipboard');
  };

  const handleClear = () => {
    store.clearForm();
    setShowClearModal(false);
    setStep(1);
    addToast('Form cleared');
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <StepProfession />;
      case 2: return <StepDetails />;
      case 3: return <StepLineItems />;
      case 4: return <StepTaxDiscount />;
      case 5: return <StepDesign />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress bar */}
      <WizardProgress current={step} onChange={goTo} />

      {/* Step content */}
      <div
        key={step}
        className={`flex-1 overflow-y-auto p-5 pb-32 animate-wizard-${slideDir}`}
      >
        {renderStep()}
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex-shrink-0">
        {step < 5 ? (
          /* Steps 1–4: Back + Next */
          <div className="flex gap-3">
            {step > 1 ? (
              <button onClick={goBack}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div className="flex-1" />}
            <button onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
              Next <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Step 5: Download + small buttons */
          <div className="space-y-2">
            <button onClick={onDownload} disabled={downloading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
              {downloading
                ? <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
                : downloadSuccess
                ? <><Check size={16} /> Downloaded! ✓</>
                : <><Download size={16} /> Download PDF</>}
            </button>
            <div className="flex gap-2">
              <ProGated feature="Shareable link">
                <button onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Share2 size={12} /> Share link
                </button>
              </ProGated>
              <ProGated feature="Invoice history">
                <button onClick={onShowHistory}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Clock size={12} /> History
                </button>
              </ProGated>
              <button onClick={() => setShowClearModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-red-600 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear confirmation modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowClearModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">Clear form?</h3>
            <p className="text-sm text-gray-500 mb-4">This will clear all fields. Are you sure?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleClear} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
