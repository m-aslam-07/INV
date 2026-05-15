import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function TerminalTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace", fontSize, lineHeight, color: '#e2e8f0' }} className="w-full">
      {/* Terminal Header */}
      <div
        className="p-6 -mx-8 -mt-8 mb-0 rounded-t-lg"
        style={{ backgroundColor: '#1e293b', marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', paddingLeft: '32px', paddingRight: '32px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>~/invoices/{state.document.number.toLowerCase().replace(/[^a-z0-9]/g, '-')}</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            {state.business.logoUrl && (
              <img src={state.business.logoUrl} alt="Logo" className="h-8 mb-2 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            )}
            <h1 className="text-xl font-bold" style={{ color: '#38bdf8' }}>{state.business.name || 'Your Business'}</h1>
            <p style={{ color: '#64748b', fontSize: '12px' }}>{state.business.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#22c55e', fontSize: '12px', letterSpacing: '2px' }}>$ {getDocLabel(state.docType).toLowerCase()}</p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>#{state.document.number}</p>
          </div>
        </div>
      </div>

      {/* Terminal body */}
      <div style={{ backgroundColor: '#0f172a', color: '#e2e8f0', padding: '24px 32px', marginLeft: '-32px', marginRight: '-32px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', fontSize: '12px' }}>
          <span><span style={{ color: '#22c55e' }}>date</span> <span style={{ color: '#94a3b8' }}>=</span> <span style={{ color: '#fbbf24' }}>"{state.document.date}"</span></span>
          <span><span style={{ color: '#22c55e' }}>due</span> <span style={{ color: '#94a3b8' }}>=</span> <span style={{ color: '#fbbf24' }}>"{state.document.dueDate}"</span></span>
        </div>

        {/* From / To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <p style={{ color: '#22c55e', fontSize: '11px', marginBottom: '4px' }}>// sender</p>
            <p style={{ color: '#e2e8f0', fontWeight: 600 }}>{state.business.name}</p>
            {state.business.phone && <p style={{ color: '#94a3b8', fontSize: '12px' }}>{state.business.phone}</p>}
            {state.business.address1 && <p style={{ color: '#94a3b8', fontSize: '12px' }}>{state.business.address1}</p>}
            {(state.business.city || state.business.state) && (
              <p style={{ color: '#94a3b8', fontSize: '12px' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>
            )}
            {state.business.gstin && <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.business.gstin}</p>}
            {state.business.pan && <p style={{ color: '#64748b', fontSize: '11px' }}>PAN: {state.business.pan}</p>}
          </div>
          <div>
            <p style={{ color: '#22c55e', fontSize: '11px', marginBottom: '4px' }}>// client</p>
            <p style={{ color: '#e2e8f0', fontWeight: 600 }}>{state.client.name || 'Client Name'}</p>
            {state.client.email && <p style={{ color: '#94a3b8', fontSize: '12px' }}>{state.client.email}</p>}
            {state.client.address && <p style={{ color: '#94a3b8', fontSize: '12px' }}>{state.client.address}</p>}
            {state.client.state && <p style={{ color: '#94a3b8', fontSize: '12px' }}>{state.client.state}</p>}
            {state.client.gstin && <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.client.gstin}</p>}
          </div>
        </div>

        {/* Items with line numbers */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 60px 50px 80px 80px', gap: '0', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '4px', fontSize: '11px', color: '#64748b' }}>
            <span>ln</span><span>description</span><span style={{ textAlign: 'right' }}>qty</span><span style={{ textAlign: 'right' }}>unit</span><span style={{ textAlign: 'right' }}>rate</span><span style={{ textAlign: 'right' }}>amount</span>
          </div>
          {state.items.map((item, idx) => {
            if (item.type === 'heading') {
              return (
                <div key={item.id} style={{ padding: '4px 0', color: '#fbbf24', fontSize: '12px' }}>
                  <span style={{ color: '#475569', marginRight: '8px' }}>{String(idx + 1).padStart(2, '0')}</span>
                  {'// '}{item.description}
                </div>
              );
            }
            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 60px 50px 80px 80px', gap: '0', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#475569', fontSize: '11px' }}>{String(idx + 1).padStart(2, '0')}</span>
                <span style={{ color: '#e2e8f0' }}>{item.description}</span>
                <span style={{ textAlign: 'right', color: '#94a3b8' }}>{item.quantity}</span>
                <span style={{ textAlign: 'right', color: '#475569', fontSize: '11px' }}>{item.unit}</span>
                <span style={{ textAlign: 'right', color: '#94a3b8' }}>{fmt(item.rate)}</span>
                <span style={{ textAlign: 'right', color: '#38bdf8', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</span>
              </div>
            );
          })}
          {state.items.length === 0 && (
            <p style={{ color: '#475569', textAlign: 'center', padding: '20px 0', fontSize: '12px' }}>// no items</p>
          )}
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ width: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
              <span>subtotal</span><span>{fmt(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                <span>discount</span><span>-{fmt(totals.discount)}</span>
              </div>
            )}
            {state.tax.gstEnabled && state.tax.gstType === 'intra' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>cgst ({state.tax.gstRate / 2}%)</span><span>{fmt(totals.cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>sgst ({state.tax.gstRate / 2}%)</span><span>{fmt(totals.sgst)}</span>
                </div>
              </>
            )}
            {state.tax.gstEnabled && state.tax.gstType === 'inter' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                <span>igst ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span>
              </div>
            )}
            <div style={{ borderTop: '2px solid #22c55e', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
              <span style={{ color: '#22c55e' }}>total</span>
              <span style={{ color: '#22c55e' }}>{fmt(totals.total)}</span>
            </div>
            {state.document.currency === 'INR' && totals.total > 0 && (
              <p style={{ color: '#475569', fontSize: '10px', textAlign: 'right', marginTop: '4px', fontStyle: 'italic' }}>{amountToWords(totals.total)}</p>
            )}
          </div>
        </div>

        {/* Payment */}
        {(state.payment.bankName || state.payment.upiId) && (
          <div style={{ marginBottom: '20px', padding: '12px', border: '1px solid #334155', borderRadius: '6px' }}>
            <p style={{ color: '#22c55e', fontSize: '11px', marginBottom: '8px' }}>// payment</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#94a3b8', fontSize: '12px' }}>
              {state.payment.bankName && <p>bank: {state.payment.bankName}</p>}
              {state.payment.accountHolder && <p>holder: {state.payment.accountHolder}</p>}
              {state.payment.accountNumber && <p>account: {state.payment.accountNumber}</p>}
              {state.payment.ifsc && <p>ifsc: {state.payment.ifsc}</p>}
              {state.payment.upiId && <p>upi: {state.payment.upiId}</p>}
            </div>
          </div>
        )}

        {/* Notes & Terms */}
        {state.notes && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#22c55e', fontSize: '11px', marginBottom: '4px' }}>// notes</p>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>{state.notes}</p>
          </div>
        )}
        {state.terms && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#22c55e', fontSize: '11px', marginBottom: '4px' }}>// terms</p>
            <p style={{ color: '#64748b', fontSize: '11px' }}>{state.terms}</p>
          </div>
        )}

        
      </div>
    </div>
  );
}

