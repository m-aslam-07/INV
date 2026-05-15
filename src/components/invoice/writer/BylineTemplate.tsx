import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function BylineTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor || '#111827';

  return (
    <div style={{ fontFamily: "'Georgia', serif", fontSize, lineHeight, color: '#111827' }} className="w-full">
      {/* Newspaper Masthead */}
      <div style={{ textAlign: 'center', borderBottom: '4px double #111827', paddingBottom: '24px', marginBottom: '32px' }}>
        <p style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '4px', color: '#4b5563', marginBottom: '16px' }}>The Daily Invoice</p>
        {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '40px', margin: '0 auto 16px', objectFit: 'contain' }} />}
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>{state.business.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', fontSize: '13px', fontStyle: 'italic', color: '#4b5563' }}>
          <span>Vol. {state.document.number.replace(/\D/g, '') || '1'}</span>
          <span>{state.document.date}</span>
          <span>Due: {state.document.dueDate}</span>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 700, borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '24px' }}>
        {getDocLabel(state.docType)} <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '16px' }}>#{state.document.number}</span>
      </h2>

      {/* 3-column layout for details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px', fontSize }}>
        <div>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid #111827', paddingBottom: '4px', marginBottom: '8px' }}>Byline (From)</p>
          <p style={{ fontWeight: 700 }}>{state.business.name}</p>
          {state.business.email && <p style={{ color: '#374151' }}>{state.business.email}</p>}
          {state.business.phone && <p style={{ color: '#374151' }}>{state.business.phone}</p>}
          {state.business.address1 && <p style={{ color: '#4b5563', marginTop: '4px' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#4b5563' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
        </div>
        <div>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid #111827', paddingBottom: '4px', marginBottom: '8px' }}>Client</p>
          <p style={{ fontWeight: 700 }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#374151' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#4b5563', marginTop: '4px' }}>{state.client.address}</p>}
          {state.client.state && <p style={{ color: '#4b5563' }}>{state.client.state}</p>}
        </div>
        <div>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid #111827', paddingBottom: '4px', marginBottom: '8px' }}>Tax Info</p>
          {state.business.gstin ? <p style={{ color: '#4b5563' }}>My GSTIN: {state.business.gstin}</p> : <p style={{ color: '#9ca3af' }}>No GSTIN</p>}
          {state.business.pan && <p style={{ color: '#4b5563' }}>My PAN: {state.business.pan}</p>}
          {state.client.gstin && <p style={{ color: '#4b5563', marginTop: '4px' }}>Client GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      {/* Copy / Items */}
      <div style={{ marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize }}>
          <thead>
            <tr style={{ borderTop: '2px solid #111827', borderBottom: '2px solid #111827' }}>
              <th style={{ textAlign: 'left', padding: '12px 0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>Article / Service</th>
              <th style={{ textAlign: 'right', padding: '12px 0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', width: '80px' }}>Words/Qty</th>
              <th style={{ textAlign: 'right', padding: '12px 0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', width: '100px' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '12px 0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', width: '100px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={4} style={{ padding: '16px 0 8px', fontWeight: 700, fontSize: '16px', fontFamily: "'Playfair Display', serif" }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0' }}>
                  <p style={{ fontWeight: 700, color: brand, marginBottom: '2px', fontFamily: 'sans-serif', fontSize: '13px' }}>{item.description}</p>
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right', color: '#4b5563' }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', color: '#4b5563' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={4} style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>No content logged</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '4px double #111827', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '24px', fontFamily: "'Playfair Display', serif" }}>
            <span>Final Total</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', textAlign: 'right', marginTop: '8px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {(state.payment.bankName || state.payment.upiId) && (
          <div style={{ padding: '16px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize }}>
            <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '8px' }}>Remittance Details</p>
            <div style={{ color: '#374151' }}>
              {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
              {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
              {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
              {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
              {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
            </div>
          </div>
        )}
        <div>
          {state.notes && <div style={{ marginBottom: '16px', fontSize }}><p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>Editor's Notes</p><p style={{ color: '#4b5563', fontStyle: 'italic' }}>{state.notes}</p></div>}
          {state.terms && <div style={{ fontSize }}><p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>Terms</p><p style={{ color: '#6b7280', fontSize: '11px' }}>{state.terms}</p></div>}
        </div>
      </div>

      
    </div>
  );
}

