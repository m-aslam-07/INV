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

export function ClassicTemplate({ state, isPro }: TemplateProps) {
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
      <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
        {state.business.logoUrl && (
          <img src={state.business.logoUrl} alt="Logo" className="h-12 mx-auto mb-2 object-contain" />
        )}
        <h1 className="text-2xl font-bold uppercase tracking-wider">{state.business.name || 'Your Business'}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {[state.business.address1, state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}
        </p>
        {state.business.phone && <p className="text-sm text-gray-500">Phone: {state.business.phone} | Email: {state.business.email}</p>}
        {state.business.gstin && <p className="text-sm text-gray-500">GSTIN: {state.business.gstin}</p>}
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold border-2 border-gray-800 inline-block px-8 py-1.5 tracking-widest">
          {getDocLabel(state.docType)}
        </h2>
      </div>

      {/* Meta + Client */}
      <div className="grid grid-cols-2 gap-6 mb-6 border border-gray-300 p-4" style={{ fontSize }}>
        <div>
          <table className="text-sm">
            <tbody>
              <tr><td className="pr-3 text-gray-500 font-medium py-0.5">Invoice No:</td><td className="font-semibold">{state.document.number}</td></tr>
              <tr><td className="pr-3 text-gray-500 font-medium py-0.5">Date:</td><td>{state.document.date}</td></tr>
              <tr><td className="pr-3 text-gray-500 font-medium py-0.5">Due Date:</td><td>{state.document.dueDate}</td></tr>
              {state.client.poNumber && <tr><td className="pr-3 text-gray-500 font-medium py-0.5">PO Number:</td><td>{state.client.poNumber}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-l border-gray-300 pl-4">
          <p className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1">Bill To:</p>
          <p className="font-bold">{state.client.name || 'Client Name'}</p>
          {state.client.email && <p className="text-gray-500">{state.client.email}</p>}
          {state.client.address && <p className="text-gray-500">{state.client.address}</p>}
          {state.client.state && <p className="text-gray-500">{state.client.state}</p>}
          {state.client.gstin && <p className="text-gray-500 mt-1">GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      {/* Items Table - Classic bordered */}
      <table className="w-full mb-6 border border-gray-400" style={{ fontSize }}>
        <thead>
          <tr className="bg-gray-100 border-b border-gray-400">
            <th className="text-left py-2 px-3 text-xs uppercase font-bold border-r border-gray-300 w-10">S.No</th>
            <th className="text-left py-2 px-3 text-xs uppercase font-bold border-r border-gray-300">Description</th>
            <th className="text-center py-2 px-3 text-xs uppercase font-bold border-r border-gray-300 w-14">Qty</th>
            <th className="text-center py-2 px-3 text-xs uppercase font-bold border-r border-gray-300 w-14">Unit</th>
            <th className="text-right py-2 px-3 text-xs uppercase font-bold border-r border-gray-300 w-24">Rate</th>
            <th className="text-right py-2 px-3 text-xs uppercase font-bold w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => {
            if (item.type === 'heading') {
              return (
                <tr key={item.id} className="bg-gray-50 border-b border-gray-300">
                  <td colSpan={6} className="py-2 px-3 font-bold text-gray-700">{item.description}</td>
                </tr>
              );
            }
            return (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-2 px-3 text-center border-r border-gray-200">{idx + 1}</td>
                <td className="py-2 px-3 border-r border-gray-200">{item.description}</td>
                <td className="py-2 px-3 text-center border-r border-gray-200">{item.quantity}</td>
                <td className="py-2 px-3 text-center text-gray-400 text-xs border-r border-gray-200">{item.unit}</td>
                <td className="py-2 px-3 text-right border-r border-gray-200">{fmt(item.rate)}</td>
                <td className="py-2 px-3 text-right font-semibold">{fmt(item.quantity * item.rate)}</td>
              </tr>
            );
          })}
          {state.items.length === 0 && (
            <tr><td colSpan={6} className="py-6 text-center text-gray-300 text-sm">No items added</td></tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <table className="border border-gray-400" style={{ fontSize }}>
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="py-1.5 px-4 text-gray-500 border-r border-gray-300">Subtotal</td>
              <td className="py-1.5 px-4 text-right font-medium w-32">{fmt(totals.subtotal)}</td>
            </tr>
            {totals.discount > 0 && (
              <tr className="border-b border-gray-300">
                <td className="py-1.5 px-4 text-gray-500 border-r border-gray-300">Discount</td>
                <td className="py-1.5 px-4 text-right">-{fmt(totals.discount)}</td>
              </tr>
            )}
            {state.tax.gstEnabled && state.tax.gstType === 'intra' && (
              <>
                <tr className="border-b border-gray-300">
                  <td className="py-1.5 px-4 text-gray-500 border-r border-gray-300">CGST ({state.tax.gstRate / 2}%)</td>
                  <td className="py-1.5 px-4 text-right">{fmt(totals.cgst)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1.5 px-4 text-gray-500 border-r border-gray-300">SGST ({state.tax.gstRate / 2}%)</td>
                  <td className="py-1.5 px-4 text-right">{fmt(totals.sgst)}</td>
                </tr>
              </>
            )}
            {state.tax.gstEnabled && state.tax.gstType === 'inter' && (
              <tr className="border-b border-gray-300">
                <td className="py-1.5 px-4 text-gray-500 border-r border-gray-300">IGST ({state.tax.gstRate}%)</td>
                <td className="py-1.5 px-4 text-right">{fmt(totals.igst)}</td>
              </tr>
            )}
            <tr className="bg-gray-100">
              <td className="py-2 px-4 font-bold text-lg border-r border-gray-300">Total</td>
              <td className="py-2 px-4 text-right font-bold text-lg">{fmt(totals.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {state.document.currency === 'INR' && totals.total > 0 && (
        <p className="text-xs text-gray-400 italic text-right mb-6">{amountToWords(totals.total)}</p>
      )}

      {/* Payment */}
      {(state.payment.bankName || state.payment.upiId) && (
        <div className="mb-6 border border-gray-300 p-4" style={{ fontSize }}>
          <p className="font-bold text-xs uppercase tracking-wider mb-2">Bank Details</p>
          <div className="grid grid-cols-2 gap-1 text-gray-600">
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
          <p className="font-bold text-xs uppercase tracking-wider mb-1">Notes</p>
          <p className="text-gray-500">{state.notes}</p>
        </div>
      )}
      {state.terms && (
        <div className="mb-4" style={{ fontSize }}>
          <p className="font-bold text-xs uppercase tracking-wider mb-1">Terms & Conditions</p>
          <p className="text-gray-500 text-xs">{state.terms}</p>
        </div>
      )}

      {/* Signature line */}
      <div className="mt-12 flex justify-end">
        <div className="text-center">
          <div className="border-b border-gray-400 w-48 mb-1" />
          <p className="text-xs text-gray-500">Authorized Signature</p>
        </div>
      </div>

      
    </div>
  );
}

