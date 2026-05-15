import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function StartupTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor;

  return (
    <div style={{ fontFamily: state.style.fontFamily, fontSize, lineHeight, color: '#111827' }} className="w-full flex">
      <div className="w-3 flex-shrink-0 rounded-l-lg" style={{ backgroundColor: brand, marginLeft: '-32px', marginTop: '-32px', marginBottom: '-32px' }} />
      <div className="flex-1 pl-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" className="h-10 mb-2 object-contain" />}
            <h1 className="text-2xl font-bold" style={{ color: brand }}>{state.business.name || 'Your Business'}</h1>
            <p className="text-sm text-gray-400 mt-1">{[state.business.email, state.business.phone].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: brand }}>{getDocLabel(state.docType)}</p>
            <p className="text-2xl font-bold mt-1">{state.document.number}</p>
          </div>
        </div>
        <div className="flex gap-8 mb-8">
          {[['Issued', state.document.date], ['Due', state.document.dueDate]].map(([l, v]) => (
            <div key={l} className="px-4 py-2 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-400 uppercase tracking-wider">{l}</p>
              <p className="font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8" style={{ fontSize }}>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: brand }}>From</p>
            <p className="font-medium">{state.business.name}</p>
            {state.business.address1 && <p className="text-gray-500">{state.business.address1}</p>}
            {(state.business.city || state.business.state) && <p className="text-gray-500">{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
            {state.business.gstin && <p className="text-gray-400 mt-1 text-xs">GSTIN: {state.business.gstin}</p>}
            {state.business.pan && <p className="text-gray-400 text-xs">PAN: {state.business.pan}</p>}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: brand }}>Bill To</p>
            <p className="font-medium">{state.client.name || 'Client Name'}</p>
            {state.client.email && <p className="text-gray-500">{state.client.email}</p>}
            {state.client.address && <p className="text-gray-500">{state.client.address}</p>}
            {state.client.state && <p className="text-gray-500">{state.client.state}</p>}
            {state.client.gstin && <p className="text-gray-400 mt-1 text-xs">GSTIN: {state.client.gstin}</p>}
          </div>
        </div>
        <table className="w-full mb-8" style={{ fontSize }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${brand}` }}>
              {['#','Description','Qty','Unit','Rate','Amount'].map((h,i) => (
                <th key={h} className={`py-2 text-xs uppercase tracking-wider font-bold ${i<2?'text-left':'text-right'}`} style={{ color: brand, width: i===0?'32px':i>1?'64px':undefined }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item, idx) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={6} className="py-2 font-bold text-gray-700 border-b border-gray-100">{item.description}</td></tr>
            ) : (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-400">{idx + 1}</td>
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-gray-400 text-xs">{item.unit}</td>
                <td className="py-3 text-right text-gray-600">{fmt(item.rate)}</td>
                <td className="py-3 text-right font-semibold">{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-300 text-sm">No items added</td></tr>}
          </tbody>
        </table>
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-1.5" style={{ fontSize }}>
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between text-gray-500"><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
            {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
              <div className="flex justify-between text-gray-500"><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div>
              <div className="flex justify-between text-gray-500"><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div>
            </>)}
            {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div className="flex justify-between text-gray-500"><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
            <div className="pt-2 flex justify-between items-center" style={{ borderTop: `2px solid ${brand}` }}>
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl" style={{ color: brand }}>{fmt(totals.total)}</span>
            </div>
            {state.document.currency === 'INR' && totals.total > 0 && <p className="text-xs text-gray-400 italic text-right pt-1">{amountToWords(totals.total)}</p>}
          </div>
        </div>
        {(state.payment.bankName || state.payment.upiId) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg" style={{ fontSize }}>
            <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: brand }}>Payment Details</p>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
              {state.payment.accountHolder && <p>A/C Holder: {state.payment.accountHolder}</p>}
              {state.payment.accountNumber && <p>A/C No: {state.payment.accountNumber}</p>}
              {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
              {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
            </div>
          </div>
        )}
        {state.notes && <div className="mb-4" style={{ fontSize }}><p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: brand }}>Notes</p><p className="text-gray-500">{state.notes}</p></div>}
        {state.terms && <div className="mb-4" style={{ fontSize }}><p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: brand }}>Terms & Conditions</p><p className="text-gray-500 text-xs">{state.terms}</p></div>}
        
      </div>
    </div>
  );
}

