import { useInvoiceStore } from '../../../hooks/useInvoiceStore';
import { detectGSTType } from '../../../utils/calculations';

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-150 bg-white';
const GST_RATES = [0, 5, 12, 18, 28] as const;

export function StepTaxDiscount() {
  const store = useInvoiceStore();
  const autoGstType = detectGSTType(store.business.state, store.client.state);
  const hasStates = store.business.state && store.client.state;

  return (
    <div className="space-y-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tax & Discount</p>

      {/* Discount */}
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-700 font-medium">Discount</span>
          <input type="checkbox" checked={store.tax.discountEnabled} onChange={e => store.updateTax({ discountEnabled: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </label>
        {store.tax.discountEnabled && (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex rounded-lg bg-gray-50 p-0.5">
              <button onClick={() => store.updateTax({ discountType: 'percent' })}
                className={`px-3 py-1 text-xs rounded-md ${store.tax.discountType === 'percent' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>%</button>
              <button onClick={() => store.updateTax({ discountType: 'fixed' })}
                className={`px-3 py-1 text-xs rounded-md ${store.tax.discountType === 'fixed' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>₹</button>
            </div>
            <input type="number" className={inputCls + ' w-24'} value={store.tax.discountValue || ''} onChange={e => store.updateTax({ discountValue: Number(e.target.value) })} />
          </div>
        )}
      </div>

      {/* GST */}
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-700 font-medium">GST</span>
          <input type="checkbox" checked={store.tax.gstEnabled} onChange={e => store.updateTax({ gstEnabled: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </label>
        {store.tax.gstEnabled && (
          <div className="space-y-3">
            {hasStates && (
              <div className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${autoGstType === 'intra' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                Auto-detected: {autoGstType === 'intra' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)'}
                <button onClick={() => store.updateTax({ gstType: autoGstType === 'intra' ? 'inter' : 'intra' })} className="underline ml-1">Override</button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => store.updateTax({ gstType: 'intra' })}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium ${store.tax.gstType === 'intra' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-500 border-gray-200'}`}>
                CGST + SGST
              </button>
              <button onClick={() => store.updateTax({ gstType: 'inter' })}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium ${store.tax.gstType === 'inter' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-500 border-gray-200'}`}>
                IGST
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {GST_RATES.map(r => (
                <button key={r} onClick={() => store.updateTax({ gstRate: r as 0 | 5 | 12 | 18 | 28 })}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium ${store.tax.gstRate === r ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                  {r}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
