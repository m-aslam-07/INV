import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function BlueprintTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const navy = '#1e3a5f';

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize, lineHeight, color: '#1e3a5f', backgroundImage: `linear-gradient(${navy}15 1px, transparent 1px), linear-gradient(90deg, ${navy}15 1px, transparent 1px)`, backgroundSize: '16px 16px' }} className="w-full">
      <div style={{ backgroundColor: navy, color: '#fff', padding: '24px 32px', marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '32px', marginBottom: '8px', filter: 'brightness(0) invert(1)' }} />}
            <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '2px' }}>{state.business.name || 'Your Business'}</h1>
            <p style={{ color: '#94b8db', fontSize: '11px' }}>{state.business.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', letterSpacing: '4px', color: '#94b8db' }}>{getDocLabel(state.docType)}</p>
            <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>{state.document.number}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '20px', fontSize: '11px' }}>
        {[['Date', state.document.date], ['Due', state.document.dueDate], ['GSTIN', state.business.gstin || '—'], ['PAN', state.business.pan || '—']].map(([l, v]) => (
          <div key={l} style={{ padding: '6px 8px', border: `1px solid ${navy}30` }}>
            <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#7a9cc6', marginBottom: '2px' }}>{l}</p>
            <p style={{ fontWeight: 600, fontSize: '10px' }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', fontSize }}>
        {[{ label: 'FROM', data: [state.business.name, state.business.address1, [state.business.city, state.business.state].filter(Boolean).join(', ')] },
          { label: 'BILL TO', data: [state.client.name || 'Client Name', state.client.email, state.client.address, state.client.gstin ? `GSTIN: ${state.client.gstin}` : ''] }
        ].map(s => (
          <div key={s.label} style={{ padding: '12px', border: `1px solid ${navy}30` }}>
            <p style={{ fontSize: '9px', letterSpacing: '3px', color: '#7a9cc6', marginBottom: '6px' }}>{s.label}</p>
            {s.data.filter(Boolean).map((line, i) => <p key={i} style={{ color: i === 0 ? navy : '#5a7a9c', fontWeight: i === 0 ? 600 : 400, fontSize: i === 0 ? undefined : '12px' }}>{line}</p>)}
          </div>
        ))}
      </div>
      <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize }}>
        <thead><tr style={{ backgroundColor: navy, color: '#fff' }}>
          {['#','Description','Qty','Unit','Rate','Amount'].map((h,i) => (
            <th key={h} style={{ textAlign: i<2?'left':'right', padding: '8px 6px', fontSize: '10px', letterSpacing: '1px' }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={6} style={{ padding: '6px', fontWeight: 700, color: navy, borderBottom: `1px solid ${navy}30` }}>{item.description}</td></tr>
          ) : (
            <tr key={item.id} style={{ borderBottom: `1px solid ${navy}15` }}>
              <td style={{ padding: '8px 6px', color: '#7a9cc6' }}>{idx+1}</td>
              <td style={{ padding: '8px 6px' }}>{item.description}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: '#5a7a9c' }}>{item.quantity}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: '#7a9cc6', fontSize: '11px' }}>{item.unit}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right' }}>{fmt(item.rate)}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#7a9cc6' }}>No items</td></tr>}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div style={{ width: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a9c', marginBottom: '4px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a9c', marginBottom: '4px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a9c', marginBottom: '4px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a9c', marginBottom: '4px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a9c', marginBottom: '4px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: `3px solid ${navy}`, paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: navy }}>
            <span>Total</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#7a9cc6', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>
      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '20px', padding: '12px', border: `1px solid ${navy}30`, fontSize }}>
          <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#7a9cc6', marginBottom: '6px' }}>PAYMENT</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#5a7a9c' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '9px', letterSpacing: '2px', color: '#7a9cc6', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#5a7a9c' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '9px', letterSpacing: '2px', color: '#7a9cc6', marginBottom: '4px' }}>TERMS</p><p style={{ color: '#7a9cc6', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

