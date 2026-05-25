import { useState, useRef, useEffect } from 'react';
import { useInvoiceStore } from '../../../hooks/useInvoiceStore';
import { Plus, GripVertical, Trash2 } from 'lucide-react';

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-150 bg-white';

const CURRENCIES = [
  { code: 'INR', symbol: '₹' }, { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
];

export function StepLineItems() {
  const store = useInvoiceStore();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!currencyRef.current) return;
      if (!currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      store.reorderItems(dragIdx, idx);
      setDragIdx(idx);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Line Items</p>
      {store.items.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400">
          No items yet. Click '+ Add item' to get started.
        </div>
      )}
      {store.items.map((item, idx) => {
        // compute serial number skipping headings
        const serial = store.items.slice(0, idx).filter(it => it.type !== 'heading').length + 1;
        return (
          <div key={item.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={e => handleDragOver(e, idx)} onDragEnd={() => setDragIdx(null)}
            className={`flex items-start gap-2 p-2 rounded-lg border border-gray-100 bg-white ${item.type === 'heading' ? 'bg-gray-50' : ''}`}>
            <GripVertical size={14} className="text-gray-300 mt-2.5 cursor-grab flex-shrink-0" />
            <div className="w-8 mt-2.5 text-center text-sm text-gray-500 flex-shrink-0">
              {item.type === 'heading' ? null : <span className="font-medium">{serial}.</span>}
            </div>
            {item.type === 'heading' ? (
              <input className={inputCls + ' font-semibold flex-1'} placeholder="Section heading" value={item.description} onChange={e => store.updateItem(item.id, { description: e.target.value })} />
            ) : (
              <div className="flex-1 grid grid-cols-12 gap-1.5">
                <input className={inputCls + ' col-span-5'} placeholder="Description" value={item.description} onChange={e => store.updateItem(item.id, { description: e.target.value })} />
                <input type="number" className={inputCls + ' col-span-2 text-center'} placeholder="Qty" value={item.quantity || ''} onChange={e => store.updateItem(item.id, { quantity: Number(e.target.value) })} />
                <input className={inputCls + ' col-span-2 text-center'} placeholder="Unit" value={item.unit} onChange={e => store.updateItem(item.id, { unit: e.target.value })} />
                <input type="number" className={inputCls + ' col-span-3'} placeholder="Rate" value={item.rate || ''} onChange={e => store.updateItem(item.id, { rate: Number(e.target.value) })} />
              </div>
            )}
            <button onClick={() => store.removeItem(item.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mt-1 flex-shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      <div className="flex gap-2 mt-2 items-center">
        <button onClick={() => store.addItem()} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <Plus size={14} /> Add item
        </button>
        <button onClick={() => store.addHeading()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-600 font-medium">
          <Plus size={14} /> Add heading
        </button>
        <div className="ml-auto relative" ref={currencyRef}>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 mr-2">Currency</div>
            <button onClick={() => setCurrencyOpen(v => !v)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded border border-gray-200 bg-white">
              <span className="text-lg">{CURRENCIES.find(c => c.code === store.document.currency)?.symbol || '₹'}</span>
              <span className="text-xs text-gray-600">{store.document.currency}</span>
            </button>
          </div>
          {currencyOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-40">
              {CURRENCIES.map(c => (
                <button key={c.code} onClick={() => { store.updateDocument({ currency: c.code as any }); setCurrencyOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50">
                  <span className="text-lg mr-2">{c.symbol}</span>
                  <span className="text-sm text-gray-700">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment & Notes */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Payment Details</p>
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Bank name" value={store.payment.bankName} onChange={e => store.updatePayment({ bankName: e.target.value })} />
          <input className={inputCls} placeholder="Account holder" value={store.payment.accountHolder} onChange={e => store.updatePayment({ accountHolder: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Account number" value={store.payment.accountNumber} onChange={e => store.updatePayment({ accountNumber: e.target.value })} />
          <input className={inputCls} placeholder="IFSC code" value={store.payment.ifsc} onChange={e => store.updatePayment({ ifsc: e.target.value.toUpperCase() })} />
        </div>
        <input className={inputCls} placeholder="UPI ID (e.g. name@upi)" value={store.payment.upiId} onChange={e => store.updatePayment({ upiId: e.target.value })} />
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Notes & Terms</p>
        <textarea className={inputCls + ' resize-none'} rows={2} placeholder="Thank you for your business!" value={store.notes} onChange={e => store.setNotes(e.target.value)} />
        <textarea className={inputCls + ' resize-none'} rows={3} placeholder="Payment terms..." value={store.terms} onChange={e => store.setTerms(e.target.value)} />
      </div>
    </div>
  );
}
