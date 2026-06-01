import { useCallback, useRef, useState } from 'react';
import { useInvoiceStore } from '../../../hooks/useInvoiceStore';
import { useAuthStore } from '../../../hooks/useAuthStore';
import { useCompanyProfile } from '../../../hooks/useCompanyProfile';
import { validateGSTIN } from '../../../utils/gstinValidator';
import { stateFromGSTIN } from '../../../utils/gstinStateCodes';
import { ProGated } from '../ProGated';
import { Upload, Check, AlertCircle, Loader2, Trash2, ImagePlus } from 'lucide-react';
import { deleteLogo } from '../../../lib/storage';
import { useToastStore } from '../../../hooks/useToastStore';

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-150 bg-white';
const labelCls = 'text-xs font-medium text-gray-400 uppercase tracking-wider mb-3';

const CURRENCIES = [
  { code: 'INR', symbol: '₹' }, { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
] as const;

export function StepDetails() {
  const store = useInvoiceStore();
  const { user } = useAuthStore();
  const { uploadLogoFile, saveProfile } = useCompanyProfile();
  const { addToast } = useToastStore();
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoRemoving, setLogoRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bizGstinValid = validateGSTIN(store.business.gstin);
  const clientGstinValid = validateGSTIN(store.client.gstin);

  const syncCompanyProfile = useCallback(async () => {
    try {
      await saveProfile();
    } catch (err) {
      console.error('Profile sync failed:', err);
    }
  }, [saveProfile]);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadLogoFile(file);
      if (url) {
        store.updateBusiness({ logoUrl: url });
        await syncCompanyProfile();
        addToast('Logo uploaded', 'success');
      } else {
        addToast('Logo upload failed', 'error');
      }
    } catch (err) {
      console.error('Logo upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      addToast(`Logo upload failed: ${msg}`, 'error');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }, [store, uploadLogoFile, syncCompanyProfile]);

  const handleLogoRemove = useCallback(async () => {
    if (!store.business.logoUrl) return;
    setLogoRemoving(true);
    try {
      await deleteLogo(store.business.logoUrl, user?.id);
      store.updateBusiness({ logoUrl: null });
      await syncCompanyProfile();
      addToast('Logo removed', 'success');
    } catch (err) {
      console.error('Logo removal failed:', err);
      const msg = err instanceof Error ? err.message : 'Remove failed';
      addToast(`Logo removal failed: ${msg}`, 'error');
    } finally {
      setLogoRemoving(false);
    }
  }, [store, syncCompanyProfile, user?.id]);

  const setDueFromTerms = (days: number) => {
    const d = new Date(store.document.date);
    d.setDate(d.getDate() + days);
    store.updateDocument({ dueDate: d.toISOString().split('T')[0] });
  };

  const dueInDays = Math.round((new Date(store.document.dueDate).getTime() - new Date(store.document.date).getTime()) / 86400000);

  return (
    <div className="space-y-6">
      {/* Business Details */}
      <div>
        <p className={labelCls}>Your Business Details</p>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Your business / freelancer name" value={store.business.name} onChange={e => store.updateBusiness({ name: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Email" value={store.business.email} onChange={e => store.updateBusiness({ email: e.target.value })} />
            <input className={inputCls} placeholder="Phone" value={store.business.phone} onChange={e => store.updateBusiness({ phone: e.target.value })} />
          </div>
          <input className={inputCls} placeholder="Address" value={store.business.address1} onChange={e => store.updateBusiness({ address1: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="City" value={store.business.city} onChange={e => store.updateBusiness({ city: e.target.value })} />
            <input className={inputCls} placeholder="State" value={store.business.state} onChange={e => store.updateBusiness({ state: e.target.value })} />
          </div>
          <input className={inputCls} placeholder="PIN Code" value={store.business.pin} onChange={e => store.updateBusiness({ pin: e.target.value })} />
          <div className="relative">
            <input className={inputCls} placeholder="GSTIN (optional)" value={store.business.gstin}
              onChange={e => {
                const v = e.target.value.toUpperCase();
                store.updateBusiness({ gstin: v });
                const st = stateFromGSTIN(v);
                if (st) store.updateBusiness({ state: st });
              }} />
            {store.business.gstin && (
              <span className="absolute right-3 top-2.5">
                {bizGstinValid.valid ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
              </span>
            )}
          </div>
          <input className={inputCls} placeholder="PAN" value={store.business.pan} onChange={e => store.updateBusiness({ pan: e.target.value.toUpperCase() })} />
          <ProGated feature="Logo upload">
            <div className={`border-2 border-dashed border-gray-200 rounded-lg p-4 transition-colors ${logoUploading || logoRemoving ? 'opacity-70' : ''}`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading || logoRemoving}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50/40 transition-colors disabled:cursor-not-allowed"
                >
                  {logoUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                      Uploading logo...
                    </>
                  ) : store.business.logoUrl ? (
                    <>
                      <img src={store.business.logoUrl} alt="Uploaded logo" className="h-12 w-12 rounded-md object-contain bg-white border border-gray-100 p-1" />
                      <span className="flex-1 text-left">
                        <span className="block text-gray-900">Logo uploaded</span>
                        <span className="block text-xs text-gray-400">Click to replace the current logo</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <ImagePlus size={18} />
                      </div>
                      <span className="flex-1 text-left">
                        <span className="block text-gray-900">Upload logo</span>
                        <span className="block text-xs text-gray-400">Shown in the live preview and PDF</span>
                      </span>
                    </>
                  )}
                </button>
                {store.business.logoUrl && (
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    disabled={logoUploading || logoRemoving}
                    className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors disabled:cursor-not-allowed"
                    title="Remove logo"
                  >
                    {logoRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                )}
              </div>
            </div>
          </ProGated>
        </div>
      </div>

      {/* Client Details */}
      <div>
        <p className={labelCls}>Client Details</p>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Client name" value={store.client.name} onChange={e => store.updateClient({ name: e.target.value })} />
          <input className={inputCls} placeholder="Client email" value={store.client.email} onChange={e => store.updateClient({ email: e.target.value })} />
          <textarea className={inputCls + ' resize-none'} rows={2} placeholder="Address" value={store.client.address} onChange={e => store.updateClient({ address: e.target.value })} />
          <div className="relative">
            <input className={inputCls} placeholder="Client GSTIN (optional)" value={store.client.gstin}
              onChange={e => {
                const v = e.target.value.toUpperCase();
                store.updateClient({ gstin: v });
                const st = stateFromGSTIN(v);
                if (st) store.updateClient({ state: st });
              }} />
            {store.client.gstin && (
              <span className="absolute right-3 top-2.5">
                {clientGstinValid.valid ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
              </span>
            )}
          </div>
          <input className={inputCls} placeholder="PO Number (optional)" value={store.client.poNumber} onChange={e => store.updateClient({ poNumber: e.target.value })} />
          <input className={inputCls} placeholder="Client State" value={store.client.state} onChange={e => store.updateClient({ state: e.target.value })} />
        </div>
      </div>

      {/* Invoice Details */}
      <div>
        <p className={labelCls}>Invoice Details</p>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Invoice number" value={store.document.number} onChange={e => store.updateDocument({ number: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Issue Date</label>
              <input type="date" className={inputCls} value={store.document.date} onChange={e => store.updateDocument({ date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
              <input type="date" className={inputCls} value={store.document.dueDate} onChange={e => store.updateDocument({ dueDate: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[7, 15, 30, 45].map(d => (
              <button key={d} onClick={() => setDueFromTerms(d)}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${dueInDays === d ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                Net {d}
              </button>
            ))}
          </div>
          <select className={inputCls} value={store.document.currency} onChange={e => store.updateDocument({ currency: e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP' })}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
