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

export function MinimalTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div
      style={{ fontFamily: state.style.fontFamily, fontSize, lineHeight, color: '#111827' }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          {state.business.logoUrl && (
            <img src={state.business.logoUrl} alt="Logo" className="h-10 mb-2 object-contain" />
          )}
          <h1 className="text-2xl font-semibold" style={{ color: state.style.brandColor }}>
            {state.business.name || 'Your Business'}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-400 tracking-wider">
            {getDocLabel(state.docType)}
          </p>
          <p className="text-sm text-gray-600 mt-1">{state.document.number}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-200 mb-6" />

      {/* From / To */}
      <div className="grid grid-cols-2 gap-8 mb-6" style={{ fontSize }}>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">From</p>
          <p className="font-medium">{state.business.name}</p>
          {state.business.email && <p className="text-gray-500">{state.business.email}</p>}
          {state.business.phone && <p className="text-gray-500">{state.business.phone}</p>}
          {state.business.address1 && <p className="text-gray-500">{state.business.address1}</p>}
          {(state.business.city || state.business.state) && (
            <p className="text-gray-500">
              {[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}
            </p>
          )}
          {state.business.gstin && (
            <p className="text-gray-500 mt-1">GSTIN: {state.business.gstin}</p>
          )}
          {state.business.pan && <p className="text-gray-500">PAN: {state.business.pan}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Bill To</p>
          <p className="font-medium">{state.client.name || 'Client Name'}</p>
          {state.client.email && <p className="text-gray-500">{state.client.email}</p>}
          {state.client.address && <p className="text-gray-500">{state.client.address}</p>}
          {state.client.state && <p className="text-gray-500">{state.client.state}</p>}
          {state.client.gstin && (
            <p className="text-gray-500 mt-1">GSTIN: {state.client.gstin}</p>
          )}
          {state.client.poNumber && <p className="text-gray-500">PO: {state.client.poNumber}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-6 mb-6 text-sm text-gray-500">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400">Date: </span>
          {state.document.date}
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400">Due: </span>
          {state.document.dueDate}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6" style={{ fontSize }}>
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 text-xs uppercase tracking-wider text-gray-400 font-medium w-8">#</th>
            <th className="text-left py-2 text-xs uppercase tracking-wider text-gray-400 font-medium">Description</th>
            <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-400 font-medium w-16">Qty</th>
            <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-400 font-medium w-16">Unit</th>
            <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-400 font-medium w-24">Rate</th>
            <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-400 font-medium w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => {
            if (item.type === 'heading') {
              return (
                <tr key={item.id}>
                  <td colSpan={6} className="py-2 font-semibold text-gray-700 border-b border-gray-100">
                    {item.description}
                  </td>
                </tr>
              );
            }
            return (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-400">{idx + 1}</td>
                <td className="py-2.5">{item.description}</td>
                <td className="py-2.5 text-right text-gray-600">{item.quantity}</td>
                <td className="py-2.5 text-right text-gray-400 text-xs">{item.unit}</td>
                <td className="py-2.5 text-right text-gray-600">{fmt(item.rate)}</td>
                <td className="py-2.5 text-right font-medium">{fmt(item.quantity * item.rate)}</td>
              </tr>
            );
          })}
          {state.items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-300 text-sm">
                No items added
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1.5" style={{ fontSize }}>
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{fmt(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Discount</span>
              <span>-{fmt(totals.discount)}</span>
            </div>
          )}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (
            <>
              <div className="flex justify-between text-gray-500">
                <span>CGST ({state.tax.gstRate / 2}%)</span>
                <span>{fmt(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SGST ({state.tax.gstRate / 2}%)</span>
                <span>{fmt(totals.sgst)}</span>
              </div>
            </>
          )}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && (
            <div className="flex justify-between text-gray-500">
              <span>IGST ({state.tax.gstRate}%)</span>
              <span>{fmt(totals.igst)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span style={{ color: state.style.brandColor }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && (
            <p className="text-xs text-gray-400 italic text-right pt-1">
              {amountToWords(totals.total)}
            </p>
          )}
        </div>
      </div>

      {/* Payment Details */}
      {(state.payment.bankName || state.payment.upiId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Payment Details</p>
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            {state.payment.bankName && (
              <p>Bank: {state.payment.bankName}</p>
            )}
            {state.payment.accountHolder && (
              <p>A/C Holder: {state.payment.accountHolder}</p>
            )}
            {state.payment.accountNumber && (
              <p>A/C No: {state.payment.accountNumber}</p>
            )}
            {state.payment.ifsc && (
              <p>IFSC: {state.payment.ifsc}</p>
            )}
            {state.payment.upiId && (
              <p>UPI: {state.payment.upiId}</p>
            )}
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {state.notes && (
        <div className="mb-4" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-medium">Notes</p>
          <p className="text-gray-500">{state.notes}</p>
        </div>
      )}
      {state.terms && (
        <div className="mb-4" style={{ fontSize }}>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-medium">Terms & Conditions</p>
          <p className="text-gray-500 text-xs">{state.terms}</p>
        </div>
      )}


    </div>
  );
}

