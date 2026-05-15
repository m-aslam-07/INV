import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function RenderTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#2d2d2d', padding: '20px' }} className="w-full">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px' }}>
        <div>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '28px', marginBottom: '12px' }} />}
          <h1 style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase' }}>{state.business.name || 'Your Business'}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', fontWeight: 300, letterSpacing: '4px', color: '#999' }}>{getDocLabel(state.docType)}</p>
          <p style={{ fontSize: '16px', fontWeight: 300, marginTop: '4px' }}>{state.document.number}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '48px', marginBottom: '40px', fontSize: '12px', color: '#999' }}>
        <span>Issued {state.document.date}</span><span>Due {state.document.dueDate}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '48px', fontSize }}>
        <div>
          <p style={{ fontSize: '9px', letterSpacing: '4px', color: '#bbb', marginBottom: '8px' }}>FROM</p>
          <p style={{ fontWeight: 500 }}>{state.business.name}</p>
          {state.business.email && <p style={{ color: '#777' }}>{state.business.email}</p>}
          {state.business.phone && <p style={{ color: '#777' }}>{state.business.phone}</p>}
          {state.business.address1 && <p style={{ color: '#777' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#777' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
          {state.business.gstin && <p style={{ color: '#aaa', fontSize: '11px', marginTop: '6px' }}>GSTIN: {state.business.gstin}</p>}
        </div>
        <div>
          <p style={{ fontSize: '9px', letterSpacing: '4px', color: '#bbb', marginBottom: '8px' }}>TO</p>
          <p style={{ fontWeight: 500 }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#777' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#777' }}>{state.client.address}</p>}
          {state.client.state && <p style={{ color: '#777' }}>{state.client.state}</p>}
          {state.client.gstin && <p style={{ color: '#aaa', fontSize: '11px', marginTop: '6px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '8px', marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr 60px 80px 100px', fontSize: '9px', letterSpacing: '3px', color: '#bbb' }}>
          <span>SERVICE</span><span style={{ textAlign: 'right' }}>QTY</span><span style={{ textAlign: 'right' }}>RATE</span><span style={{ textAlign: 'right' }}>AMOUNT</span>
        </div>
        {state.items.map((item) => item.type === 'heading' ? (
          <div key={item.id} style={{ padding: '10px 0', fontWeight: 500, color: '#555', letterSpacing: '1px', fontSize: '12px' }}>{item.description}</div>
        ) : (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 100px', padding: '14px 0', borderBottom: '1px solid #f5f5f5', fontSize }}>
            <span>{item.description} <span style={{ color: '#ccc', fontSize: '10px' }}>{item.unit}</span></span>
            <span style={{ textAlign: 'right', color: '#777' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right', color: '#777' }}>{fmt(item.rate)}</span>
            <span style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(item.quantity * item.rate)}</span>
          </div>
        ))}
        {state.items.length === 0 && <p style={{ textAlign: 'center', color: '#ddd', padding: '32px 0' }}>No items</p>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
        <div style={{ width: '260px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '6px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 300, fontSize: '20px', letterSpacing: '1px' }}>
            <span>Total</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>
      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize }}>
          <p style={{ fontSize: '9px', letterSpacing: '4px', color: '#bbb', marginBottom: '8px' }}>PAYMENT</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#777' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '9px', letterSpacing: '4px', color: '#bbb', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#777' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '9px', letterSpacing: '4px', color: '#bbb', marginBottom: '4px' }}>TERMS</p><p style={{ color: '#aaa', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

