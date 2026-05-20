import type { InvoiceState } from '../../hooks/useInvoiceStore';
import { calcTotals, formatCurrency } from '../../utils/calculations';
import { amountToWords } from '../../utils/amountToWords';

interface TemplateProps {
  state: InvoiceState;
  isPro: boolean;
}

function getFontSize(size: 'sm' | 'md' | 'lg') {
  return { sm: '11px', md: '13px', lg: '14px' }[size];
}

function getLineHeight(spacing: 'compact' | 'normal' | 'airy') {
  return { compact: 1.3, normal: 1.5, airy: 1.7 }[spacing];
}

function getDocLabel(type: string) {
  return { invoice: 'INVOICE', proforma: 'PROFORMA INVOICE', proposal: 'PROPOSAL', receipt: 'RECEIPT' }[type] || 'INVOICE';
}

export function BoldTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor;

  return (
    <div
      style={{ fontFamily: state.style.fontFamily, fontSize, lineHeight, color: '#111827' }}
      className="w-full"
    >
      {/* Colored Header */}
      <div
        className="p-6 -mx-8 -mt-8 mb-6 text-white rounded-t-lg"
        style={{ backgroundColor: brand, marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', paddingLeft: '32px', paddingRight: '32px' }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {state.business.logoUrl && (
              <img src={state.business.logoUrl} alt="Logo" className="h-12 object-contain" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '4px 8px' }} />
            )}
            <div>
              <h1 className="text-2xl font-bold">{state.business.name || 'Your Business'}</h1>
              {state.business.email && <p className="text-sm opacity-80">{state.business.email}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tracking-wider opacity-80">{getDocLabel(state.docType)}</p>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex justify-between mb-6 text-sm">
        <div className="space-y-1">
          <p><span className="text-gray-400">Invoice #:</span> <span className="font-semibold">{state.document.number}</span></p>
          <p><span className="text-gray-400">Date:</span> {state.document.date}</p>
          <p><span className="text-gray-400">Due:</span> {state.document.dueDate}</p>
        </div>
        {(state.business.gstin || state.business.pan) && (
          <div className="text-right space-y-1 text-gray-500">
            {state.business.gstin && <p>GSTIN: {state.business.gstin}</p>}
            {state.business.pan && <p>PAN: {state.business.pan}</p>}
          </div>
        )}
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-8 mb-8" style={{ fontSize }}>
        <div className="p-4 rounded-lg" style={{ backgroundColor: brand + '08' }}>
          <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: brand }}>From</p>
          <p className="font-semibold">{state.business.name}</p>
          {state.business.phone && <p className="text-gray-500">{state.business.phone}</p>}
          {state.business.address1 && <p className="text-gray-500">{state.business.address1}</p>}
          {(state.business.city || state.business.state) && (
            <p className="text-gray-500">{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div className="p-4 rounded-lg bg-gray-50">
          <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: brand }}>Bill To</p>
          <p className="font-semibold">{state.client.name || 'Client Name'}</p>
          {state.client.email && <p className="text-gray-500">{state.client.email}</p>}
          {state.client.address && <p className="text-gray-500">{state.client.address}</p>}
          {state.client.state && <p className="text-gray-500">{state.client.state}</p>}
          {state.client.gstin && <p className="text-gray-500 mt-1">GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8" style={{ fontSize }}>
        <thead>
          <tr style={{ backgroundColor: brand, color: 'white' }}>
            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider font-bold w-8">#</th>
            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider font-bold">Description</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-bold w-16">Qty</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-bold w-16">Unit</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-bold w-24">Rate</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-bold w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => {
            if (item.type === 'heading') {
              return (
                <tr key={item.id} className="bg-gray-50">
                  <td colSpan={6} className="py-2 px-3 font-bold text-gray-700">{item.description}</td>
                </tr>
              );
            }
            return (
              <tr key={item.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="py-3 px-3 text-gray-400">{idx + 1}</td>
                <td className="py-3 px-3 font-medium">{item.description}</td>
                <td className="py-3 px-3 text-right text-gray-600">{item.quantity}</td>
                <td className="py-3 px-3 text-right text-gray-400 text-xs">{item.unit}</td>
                <td className="py-3 px-3 text-right text-gray-600">{fmt(item.rate)}</td>
                <td className="py-3 px-3 text-right font-bold">{fmt(item.quantity * item.rate)}</td>
              </tr>
            );
          })}
          {state.items.length === 0 && (
            <tr><td colSpan={6} className="py-6 text-center text-gray-300 text-sm">No items added</td></tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2" style={{ fontSize }}>
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div className="flex justify-between text-gray-500"><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (
            <>
              <div className="flex justify-between text-gray-500"><span>CGST ({state.tax.gstRate / 2}%)</span><span>{fmt(totals.cgst)}</span></div>
              <div className="flex justify-between text-gray-500"><span>SGST ({state.tax.gstRate / 2}%)</span><span>{fmt(totals.sgst)}</span></div>
            </>
          )}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && (
            <div className="flex justify-between text-gray-500"><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>
          )}
          <div className="pt-2 flex justify-between font-bold text-xl" style={{ borderTop: `3px solid ${brand}` }}>
            <span>Total</span><span style={{ color: brand }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && (
            <p className="text-xs text-gray-400 italic text-right pt-1">{amountToWords(totals.total)}</p>
          )}
        </div>
      </div>

      {/* Payment */}
      {(state.payment.bankName || state.payment.upiId) && (
        <div className="mb-6 p-4 rounded-lg" style={{ fontSize, backgroundColor: brand + '08' }}>
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

      {state.notes && (
        <div className="mb-4" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: brand }}>Notes</p>
          <p className="text-gray-500">{state.notes}</p>
        </div>
      )}
      {state.terms && (
        <div className="mb-4" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: brand }}>Terms & Conditions</p>
          <p className="text-gray-500 text-xs">{state.terms}</p>
        </div>
      )}

      
    </div>
  );
}

