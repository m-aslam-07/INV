import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function StudioTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize, lineHeight, color: '#1a1a1a' }} className="w-full">
      {/* Centered luxury header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', paddingBottom: '24px' }}>
        {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '48px', margin: '0 auto 16px', objectFit: 'contain' }} />}
        <h1 style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '6px', textTransform: 'uppercase', color: '#1a1a1a' }}>{state.business.name || 'Your Business'}</h1>
        <div style={{ width: '40px', height: '1px', backgroundColor: '#1a1a1a', margin: '16px auto' }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#999', letterSpacing: '2px' }}>{getDocLabel(state.docType)}</p>
      </div>

      {/* Invoice meta — elegant */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999' }}>
        <div><span style={{ letterSpacing: '1px' }}>No. </span><span style={{ color: '#1a1a1a' }}>{state.document.number}</span></div>
        <div><span style={{ letterSpacing: '1px' }}>Date </span><span style={{ color: '#1a1a1a' }}>{state.document.date}</span></div>
        <div><span style={{ letterSpacing: '1px' }}>Due </span><span style={{ color: '#1a1a1a' }}>{state.document.dueDate}</span></div>
      </div>

      {/* From / To — generous spacing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '40px', fontFamily: 'Inter, sans-serif', fontSize }}>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#bbb', marginBottom: '8px', textTransform: 'uppercase' }}>From</p>
          <p style={{ fontWeight: 500 }}>{state.business.name}</p>
          {state.business.email && <p style={{ color: '#777' }}>{state.business.email}</p>}
          {state.business.phone && <p style={{ color: '#777' }}>{state.business.phone}</p>}
          {state.business.address1 && <p style={{ color: '#777' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#777' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
          {state.business.gstin && <p style={{ color: '#aaa', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.business.gstin}</p>}
        </div>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#bbb', marginBottom: '8px', textTransform: 'uppercase' }}>To</p>
          <p style={{ fontWeight: 500 }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#777' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#777' }}>{state.client.address}</p>}
          {state.client.state && <p style={{ color: '#777' }}>{state.client.state}</p>}
          {state.client.gstin && <p style={{ color: '#aaa', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      {/* Items as elegant list (not heavy table) */}
      <div style={{ marginBottom: '40px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', fontSize: '10px', letterSpacing: '2px', color: '#bbb', textTransform: 'uppercase' }}>
            <span>Service</span><span style={{ textAlign: 'right' }}>Qty</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Amount</span>
          </div>
        </div>
        {state.items.map((item) => item.type === 'heading' ? (
          <div key={item.id} style={{ padding: '8px 0', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#555', fontSize: '14px' }}>{item.description}</div>
        ) : (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px', gap: '8px', padding: '12px 0', borderBottom: '1px solid #f5f5f5', fontSize }}>
            <span style={{ color: '#333' }}>{item.description} <span style={{ color: '#ccc', fontSize: '10px' }}>{item.unit}</span></span>
            <span style={{ textAlign: 'right', color: '#777' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right', color: '#777' }}>{fmt(item.rate)}</span>
            <span style={{ textAlign: 'right', fontWeight: 500, color: '#1a1a1a' }}>{fmt(item.quantity * item.rate)}</span>
          </div>
        ))}
        {state.items.length === 0 && <p style={{ textAlign: 'center', color: '#ddd', padding: '24px 0' }}>No items added</p>}
      </div>

      {/* Totals — right-aligned with hairline */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div>
          </>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
            <span style={{ fontFamily: "'Playfair Display', serif" }}>Total</span>
            <span style={{ fontWeight: 600 }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '24px', padding: '16px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', fontFamily: 'Inter, sans-serif', fontSize }}>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#bbb', marginBottom: '8px', textTransform: 'uppercase' }}>Payment</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#777' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>A/C Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C No: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '12px', fontFamily: 'Inter, sans-serif', fontSize }}><p style={{ fontSize: '10px', letterSpacing: '3px', color: '#bbb', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#777' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '12px', fontFamily: 'Inter, sans-serif', fontSize }}><p style={{ fontSize: '10px', letterSpacing: '3px', color: '#bbb', marginBottom: '4px' }}>TERMS</p><p style={{ color: '#aaa', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

