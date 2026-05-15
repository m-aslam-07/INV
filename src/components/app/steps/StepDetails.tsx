import { useCallback } from 'react';
import { useInvoiceStore } from '../../../hooks/useInvoiceStore';
import { validateGSTIN } from '../../../utils/gstinValidator';
import { stateFromGSTIN } from '../../../utils/gstinStateCodes';
import { ProGated } from '../ProGated';
import { Upload, Check, AlertCircle } from 'lucide-react';

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-150 bg-white';
const labelCls = 'text-xs font-medium text-gray-400 uppercase tracking-wider mb-3';

const CURRENCIES = [
  { code: 'INR', symbol: '₹' }, { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
] as const;

export function StepDetails() {
  const store = useInvoiceStore();
  const bizGstinValid = validateGSTIN(store.business.gstin);
  const clientGstinValid = validateGSTIN(store.client.gstin);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => store.updateBusiness({ logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  }, [store]);

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
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Email" value={store.business.email} onChange={e => store.updateBusiness({ email: e.target.value })} />
            <input className={inputCls} placeholder="Phone" value={store.business.phone} onChange={e => store.updateBusiness({ phone: e.target.value })} />
          </div>
          <input className={inputCls} placeholder="Address" value={store.business.address1} onChange={e => store.updateBusiness({ address1: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
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
            <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer block hover:border-blue-300 transition-colors">
              {store.business.logoUrl ? (
                <img src={store.business.logoUrl} alt="Logo" className="h-12 mx-auto object-contain" />
              ) : (
                <div className="text-gray-400 text-sm"><Upload size={20} className="mx-auto mb-1" />Upload logo</div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Issue Date</label>
              <input type="date" className={inputCls} value={store.document.date} onChange={e => store.updateDocument({ date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
              <input type="date" className={inputCls} value={store.document.dueDate} onChange={e => store.updateDocument({ dueDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
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
