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

export function ModernTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div
      style={{ fontFamily: state.style.fontFamily, fontSize, lineHeight, color: '#111827' }}
      className="w-full"
    >
      {/* Dark Header */}
      <div className="bg-gray-900 text-white p-6 -mx-8 -mt-8 mb-6 rounded-t-lg"
        style={{ marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', paddingLeft: '32px', paddingRight: '32px' }}
      >
        <div className="flex justify-between items-start">
          <div>
            {state.business.logoUrl && (
              <img src={state.business.logoUrl} alt="Logo" className="h-10 mb-2 object-contain" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '4px 8px' }} />
            )}
            <h1 className="text-2xl font-bold">{state.business.name || 'Your Business'}</h1>
            {state.business.email && <p className="text-gray-400 text-sm mt-1">{state.business.email}</p>}
            {state.business.phone && <p className="text-gray-400 text-sm">{state.business.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-wider opacity-60">{getDocLabel(state.docType)}</p>
            <p className="text-gray-400 mt-2">{state.document.number}</p>
            <p className="text-gray-400">{state.document.date}</p>
            <p className="text-gray-400">Due: {state.document.dueDate}</p>
          </div>
        </div>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-8 mb-8" style={{ fontSize }}>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">From</p>
          {state.business.address1 && <p>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && (
            <p>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>
          )}
          {state.business.gstin && <p className="mt-1 text-gray-500">GSTIN: {state.business.gstin}</p>}
          {state.business.pan && <p className="text-gray-500">PAN: {state.business.pan}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Bill To</p>
          <p className="font-semibold text-base">{state.client.name || 'Client Name'}</p>
          {state.client.email && <p className="text-gray-500">{state.client.email}</p>}
          {state.client.address && <p className="text-gray-500">{state.client.address}</p>}
          {state.client.state && <p className="text-gray-500">{state.client.state}</p>}
          {state.client.gstin && <p className="text-gray-500 mt-1">GSTIN: {state.client.gstin}</p>}
          {state.client.poNumber && <p className="text-gray-500">PO: {state.client.poNumber}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8" style={{ fontSize }}>
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider font-semibold w-8">#</th>
            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider font-semibold">Description</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-semibold w-16">Qty</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-semibold w-16">Unit</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-semibold w-24">Rate</th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider font-semibold w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => {
            if (item.type === 'heading') {
              return (
                <tr key={item.id} className="bg-gray-50">
                  <td colSpan={6} className="py-2 px-3 font-semibold text-gray-700">
                    {item.description}
                  </td>
                </tr>
              );
            }
            return (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 text-gray-400">{idx + 1}</td>
                <td className="py-3 px-3 font-medium">{item.description}</td>
                <td className="py-3 px-3 text-right text-gray-600">{item.quantity}</td>
                <td className="py-3 px-3 text-right text-gray-400 text-xs">{item.unit}</td>
                <td className="py-3 px-3 text-right text-gray-600">{fmt(item.rate)}</td>
                <td className="py-3 px-3 text-right font-semibold">{fmt(item.quantity * item.rate)}</td>
              </tr>
            );
          })}
          {state.items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-300 text-sm">No items added</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2" style={{ fontSize }}>
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{fmt(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Discount</span><span>-{fmt(totals.discount)}</span>
            </div>
          )}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (
            <>
              <div className="flex justify-between text-gray-500">
                <span>CGST ({state.tax.gstRate / 2}%)</span><span>{fmt(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SGST ({state.tax.gstRate / 2}%)</span><span>{fmt(totals.sgst)}</span>
              </div>
            </>
          )}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && (
            <div className="flex justify-between text-gray-500">
              <span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span>
            </div>
          )}
          <div className="border-t-2 border-gray-900 pt-2 flex justify-between font-bold text-xl">
            <span>Total</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && (
            <p className="text-xs text-gray-400 italic text-right pt-1">
              {amountToWords(totals.total)}
            </p>
          )}
        </div>
      </div>

      {/* Payment */}
      {(state.payment.bankName || state.payment.upiId) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Payment Details</p>
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>A/C Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C No: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {state.notes && (
        <div className="mb-4" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">Notes</p>
          <p className="text-gray-500">{state.notes}</p>
        </div>
      )}
      {state.terms && (
        <div className="mb-4" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">Terms & Conditions</p>
          <p className="text-gray-500 text-xs">{state.terms}</p>
        </div>
      )}

      
    </div>
  );
}

