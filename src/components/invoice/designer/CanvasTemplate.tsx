import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function CanvasTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor;

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize, lineHeight, color: '#111827' }} className="w-full">
      {/* Full-bleed header */}
      <div style={{ backgroundColor: brand, padding: '40px 32px 32px', marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '40px', marginBottom: '12px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />}
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>{state.business.name || 'Your Business'}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>{state.business.email}</p>
          </div>
          <div style={{ textAlign: 'right', color: '#fff' }}>
            <p style={{ fontSize: '32px', fontWeight: 300, opacity: 0.4, letterSpacing: '4px', fontFamily: 'Inter, sans-serif' }}>{getDocLabel(state.docType)}</p>
            <p style={{ fontSize: '14px', opacity: 0.7, fontFamily: 'Inter, sans-serif' }}>{state.document.number}</p>
          </div>
        </div>
      </div>

      {/* Two-column editorial body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '32px', fontFamily: 'Inter, sans-serif', fontSize }}>
        <div>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: brand, marginBottom: '8px', fontWeight: 600 }}>From</p>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{state.business.name}</p>
          {state.business.phone && <p style={{ color: '#6b7280' }}>{state.business.phone}</p>}
          {state.business.address1 && <p style={{ color: '#6b7280' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#6b7280' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
          {state.business.gstin && <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '11px' }}>GSTIN: {state.business.gstin}</p>}
          {state.business.pan && <p style={{ color: '#9ca3af', fontSize: '11px' }}>PAN: {state.business.pan}</p>}
        </div>
        <div>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: brand, marginBottom: '8px', fontWeight: 600 }}>Bill To</p>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#6b7280' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#6b7280' }}>{state.client.address}</p>}
          {state.client.state && <p style={{ color: '#6b7280' }}>{state.client.state}</p>}
          {state.client.gstin && <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '11px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      {/* Dates row */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
        <div><span style={{ color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Date </span><span style={{ fontWeight: 600 }}>{state.document.date}</span></div>
        <div><span style={{ color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Due </span><span style={{ fontWeight: 600 }}>{state.document.dueDate}</span></div>
      </div>

      {/* Items — editorial style */}
      <div style={{ marginBottom: '32px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ borderBottom: `2px solid ${brand}`, paddingBottom: '8px', marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr 60px 60px 80px 80px', gap: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#9ca3af' }}>
          <span>Description</span><span style={{ textAlign: 'right' }}>Qty</span><span style={{ textAlign: 'right' }}>Unit</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Amount</span>
        </div>
        {state.items.map((item) => item.type === 'heading' ? (
          <div key={item.id} style={{ padding: '8px 0', fontWeight: 700, color: brand, fontStyle: 'italic', fontFamily: "'Playfair Display', serif", fontSize: '14px' }}>{item.description}</div>
        ) : (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 80px 80px', gap: '8px', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize }}>
            <span>{item.description}</span>
            <span style={{ textAlign: 'right', color: '#6b7280' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right', color: '#9ca3af', fontSize: '11px' }}>{item.unit}</span>
            <span style={{ textAlign: 'right', color: '#6b7280' }}>{fmt(item.rate)}</span>
            <span style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</span>
          </div>
        ))}
        {state.items.length === 0 && <p style={{ textAlign: 'center', color: '#d1d5db', padding: '24px 0' }}>No items added</p>}
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '4px' }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '4px' }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '4px' }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '4px' }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div>
          </>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '4px' }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: `2px solid ${brand}`, paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}>
            <span>Total</span><span style={{ color: brand }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      {/* Payment & Notes */}
      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: brand, marginBottom: '8px', fontWeight: 600 }}>Payment Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#6b7280' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>A/C Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C No: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif', fontSize }}><p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: brand, marginBottom: '4px', fontWeight: 600 }}>Notes</p><p style={{ color: '#6b7280' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif', fontSize }}><p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: brand, marginBottom: '4px', fontWeight: 600 }}>Terms</p><p style={{ color: '#9ca3af', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

