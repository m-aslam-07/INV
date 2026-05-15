import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function MinimalInkTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize, lineHeight, color: '#000' }} className="w-full">
      {/* Bold oversized title */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, color: '#000' }}>{getDocLabel(state.docType)}</h1>
        <div style={{ width: '100%', height: '3px', backgroundColor: '#000', marginTop: '8px' }} />
      </div>

      {/* Business + Number row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '32px', marginBottom: '8px', objectFit: 'contain' }} />}
          <p style={{ fontSize: '16px', fontWeight: 700 }}>{state.business.name || 'Your Business'}</p>
          <p style={{ color: '#666', fontSize: '12px' }}>{state.business.email}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '24px', fontWeight: 700 }}>{state.document.number}</p>
          <p style={{ color: '#666', fontSize: '12px' }}>{state.document.date} — {state.document.dueDate}</p>
        </div>
      </div>

      {/* From / To — Swiss grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px', fontSize }}>
        <div style={{ borderLeft: '3px solid #000', paddingLeft: '12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', marginBottom: '6px' }}>FROM</p>
          <p style={{ fontWeight: 600 }}>{state.business.name}</p>
          {state.business.phone && <p style={{ color: '#555' }}>{state.business.phone}</p>}
          {state.business.address1 && <p style={{ color: '#555' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#555' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
          {state.business.gstin && <p style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.business.gstin}</p>}
          {state.business.pan && <p style={{ color: '#999', fontSize: '11px' }}>PAN: {state.business.pan}</p>}
        </div>
        <div style={{ borderLeft: '3px solid #000', paddingLeft: '12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', marginBottom: '6px' }}>TO</p>
          <p style={{ fontWeight: 600 }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#555' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#555' }}>{state.client.address}</p>}
          {state.client.state && <p style={{ color: '#555' }}>{state.client.state}</p>}
          {state.client.gstin && <p style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      {/* Items — no-border grid, typographic */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', paddingBottom: '8px', borderBottom: '3px solid #000', fontSize: '10px', fontWeight: 700, letterSpacing: '3px' }}>
          <span>ITEM</span><span style={{ textAlign: 'right' }}>QTY</span><span style={{ textAlign: 'right' }}>RATE</span><span style={{ textAlign: 'right' }}>AMOUNT</span>
        </div>
        {state.items.map((item) => item.type === 'heading' ? (
          <div key={item.id} style={{ padding: '8px 0', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>{item.description}</div>
        ) : (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', padding: '10px 0', borderBottom: '1px solid #eee', fontSize }}>
            <span>{item.description} <span style={{ color: '#aaa', fontSize: '10px' }}>({item.unit})</span></span>
            <span style={{ textAlign: 'right', color: '#555' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right', color: '#555' }}>{fmt(item.rate)}</span>
            <span style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(item.quantity * item.rate)}</span>
          </div>
        ))}
        {state.items.length === 0 && <p style={{ textAlign: 'center', color: '#ccc', padding: '24px 0' }}>No items</p>}
      </div>

      {/* Totals — bold typographic */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '4px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '4px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '4px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '4px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div>
          </>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '4px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '3px solid #000', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '20px' }}>
            <span>TOTAL</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#999', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '20px', borderLeft: '3px solid #000', paddingLeft: '12px', fontSize }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', marginBottom: '6px' }}>PAYMENT</p>
          <div style={{ color: '#555' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>A/C Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C No: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#555' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', marginBottom: '4px' }}>TERMS</p><p style={{ color: '#999', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

