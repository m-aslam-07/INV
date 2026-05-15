import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function CleanShotTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const S = (p: Record<string, unknown>) => p as React.CSSProperties;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#111' }} className="w-full">
      <div style={{ marginBottom: '40px' }}>
        {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '36px', marginBottom: '12px' }} />}
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>{state.business.name || 'Your Business'}</h1>
        <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>{state.business.email} {state.business.phone && `· ${state.business.phone}`}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '3px solid #111' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '4px' }}>{getDocLabel(state.docType)}</p>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 700 }}>{state.document.number}</p>
          <p style={{ color: '#999', fontSize: '12px' }}>{state.document.date} — Due: {state.document.dueDate}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '32px', fontSize }}>
        <div>
          <p style={S({ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#bbb', marginBottom: '6px' })}>FROM</p>
          <p style={{ fontWeight: 600 }}>{state.business.name}</p>
          {state.business.address1 && <p style={{ color: '#666' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#666' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
          {state.business.gstin && <p style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.business.gstin}</p>}
          {state.business.pan && <p style={{ color: '#999', fontSize: '11px' }}>PAN: {state.business.pan}</p>}
        </div>
        <div>
          <p style={S({ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#bbb', marginBottom: '6px' })}>BILL TO</p>
          <p style={{ fontWeight: 600 }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#666' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#666' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>
      <table style={{ width: '100%', marginBottom: '32px', borderCollapse: 'collapse', fontSize }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111' }}>
            {['#','Description','Qty','Unit','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ textAlign: i<2?'left':'right', padding: '10px 6px', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#999' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={6} style={{ padding: '8px 6px', fontWeight: 800, fontSize: '13px', borderBottom: '1px solid #eee' }}>{item.description}</td></tr>
          ) : (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 6px', color: '#bbb' }}>{idx+1}</td>
              <td style={{ padding: '10px 6px', fontWeight: 500 }}>{item.description}</td>
              <td style={{ padding: '10px 6px', textAlign: 'right', color: '#666' }}>{item.quantity}</td>
              <td style={{ padding: '10px 6px', textAlign: 'right', color: '#bbb', fontSize: '11px' }}>{item.unit}</td>
              <td style={{ padding: '10px 6px', textAlign: 'right', color: '#666' }}>{fmt(item.rate)}</td>
              <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#ddd' }}>No items</td></tr>}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '4px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '4px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '4px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '4px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', marginBottom: '4px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '3px solid #111', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '20px' }}>
            <span>Total</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#999', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>
      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize }}>
          <p style={S({ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#bbb', marginBottom: '6px' })}>PAYMENT</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#666' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '12px', fontSize }}><p style={S({ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#bbb', marginBottom: '4px' })}>NOTES</p><p style={{ color: '#666' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '12px', fontSize }}><p style={S({ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#bbb', marginBottom: '4px' })}>TERMS</p><p style={{ color: '#999', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

