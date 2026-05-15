import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function BlueprintTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const grid = { backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' };

  return (
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize, lineHeight, color: '#1e293b', ...grid }} className="w-full">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #334155' }}>
        <div>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '36px', marginBottom: '8px', objectFit: 'contain' }} />}
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>{state.business.name || 'Your Business'}</h1>
          <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>{[state.business.email, state.business.phone].filter(Boolean).join(' | ')}</p>
        </div>
        <div style={{ textAlign: 'right', padding: '8px 12px', border: '2px solid #334155' }}>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#64748b' }}>SPEC</p>
          <p style={{ fontSize: '18px', fontWeight: 700 }}>{getDocLabel(state.docType)}</p>
          <p style={{ fontSize: '12px', color: '#64748b' }}>{state.document.number}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px', fontSize: '11px' }}>
        {[['REV DATE', state.document.date], ['DUE DATE', state.document.dueDate], ['GSTIN', state.business.gstin || '—'], ['PAN', state.business.pan || '—']].map(([l, v]) => (
          <div key={l} style={{ padding: '8px', border: '1px dashed #94a3b8' }}>
            <p style={{ color: '#64748b', fontSize: '9px', letterSpacing: '2px', marginBottom: '2px' }}>{l}</p>
            <p style={{ fontWeight: 600, fontSize: '10px' }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', border: '1px solid #cbd5e1' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', color: '#64748b', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>SENDER</p>
          <p style={{ fontWeight: 600 }}>{state.business.name}</p>
          {state.business.address1 && <p style={{ color: '#475569', fontSize: '12px' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#475569', fontSize: '12px' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
        </div>
        <div style={{ padding: '12px', border: '1px solid #cbd5e1' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', color: '#64748b', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>RECIPIENT</p>
          <p style={{ fontWeight: 600 }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#475569', fontSize: '12px' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#475569', fontSize: '12px' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>
      <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize }}>
        <thead>
          <tr style={{ borderTop: '2px solid #334155', borderBottom: '2px solid #334155' }}>
            {['NO.','SPECIFICATION','QTY','UNIT','RATE','AMOUNT'].map((h,i) => (
              <th key={h} style={{ textAlign: i < 2 ? 'left' : 'right', padding: '8px 6px', fontSize: '9px', letterSpacing: '2px', color: '#64748b', width: i===0?'32px':i>1?'70px':undefined }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={6} style={{ padding: '6px', fontWeight: 700, color: '#334155', borderBottom: '1px dashed #cbd5e1', fontSize: '12px' }}>▸ {item.description}</td></tr>
          ) : (
            <tr key={item.id} style={{ borderBottom: '1px dashed #e2e8f0' }}>
              <td style={{ padding: '8px 6px', color: '#94a3b8', fontSize: '11px' }}>{String(idx+1).padStart(2,'0')}</td>
              <td style={{ padding: '8px 6px' }}>{item.description}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: '#475569' }}>{item.quantity}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: '#94a3b8', fontSize: '10px' }}>{item.unit}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right' }}>{fmt(item.rate)}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#cbd5e1' }}>No specifications</td></tr>}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div style={{ width: '240px', border: '1px solid #334155' }}>
          {[['Subtotal', fmt(totals.subtotal)], ...(totals.discount > 0 ? [['Discount', '-'+fmt(totals.discount)]] : []),
            ...(state.tax.gstEnabled && state.tax.gstType === 'intra' ? [['CGST ('+state.tax.gstRate/2+'%)', fmt(totals.cgst)],['SGST ('+state.tax.gstRate/2+'%)', fmt(totals.sgst)]] : []),
            ...(state.tax.gstEnabled && state.tax.gstType === 'inter' ? [['IGST ('+state.tax.gstRate+'%)', fmt(totals.igst)]] : []),
          ].map(([l,v]) => (
            <div key={String(l)} style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', color: '#64748b', borderBottom: '1px dashed #e2e8f0' }}>
              <span>{l}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', backgroundColor: '#f1f5f9' }}>
            <span>TOTAL</span><span>{fmt(totals.total)}</span>
          </div>
        </div>
      </div>
      {state.document.currency === 'INR' && totals.total > 0 && <p style={{ textAlign: 'right', color: '#94a3b8', fontSize: '10px', fontStyle: 'italic', marginBottom: '16px' }}>{amountToWords(totals.total)}</p>}
      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '20px', padding: '12px', border: '1px dashed #94a3b8' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', color: '#64748b', marginBottom: '8px' }}>PAYMENT</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#475569', fontSize: '12px' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '12px' }}><p style={{ fontSize: '9px', letterSpacing: '3px', color: '#64748b', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#475569', fontSize: '12px' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '12px' }}><p style={{ fontSize: '9px', letterSpacing: '3px', color: '#64748b', marginBottom: '4px' }}>TERMS</p><p style={{ color: '#94a3b8', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

