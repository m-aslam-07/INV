import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function GrowthTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor || '#ec4899';

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize, lineHeight, color: '#1e293b' }} className="w-full">
      <div style={{ background: `linear-gradient(135deg, ${brand}, #8b5cf6)`, padding: '32px', marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', marginBottom: '32px', color: '#fff', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '40px', marginBottom: '12px', filter: 'brightness(0) invert(1)' }} />}
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{state.business.name || 'Marketing Agency'}</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>{state.business.email} {state.business.phone && `| ${state.business.phone}`}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>{getDocLabel(state.docType)}</p>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>{state.document.number}</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px' }}>
          <div><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>Issued Date</p><p style={{ fontWeight: 600 }}>{state.document.date}</p></div>
          <div><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>Due Date</p><p style={{ fontWeight: 600 }}>{state.document.dueDate}</p></div>
          <div><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Due</p><p style={{ fontWeight: 700, fontSize: '16px' }}>{fmt(totals.total)}</p></div>
          <div><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>GSTIN</p><p style={{ fontWeight: 600 }}>{state.business.gstin || '—'}</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px', padding: '0 8px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: brand, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bill To</p>
          <p style={{ fontWeight: 700, fontSize: '16px' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#64748b', marginTop: '4px' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#64748b', marginTop: '4px' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: brand, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Project Info</p>
          {state.notes ? <p style={{ color: '#64748b' }}>{state.notes}</p> : <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Retainer / Campaign services for the current billing period.</p>}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
              {['Service / Campaign','Qty','Rate','Amount'].map((h,i) => (
                <th key={h} style={{ textAlign: i===0?'left':'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item, idx) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={4} style={{ padding: '16px', fontWeight: 700, color: brand, fontSize: '14px' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: `${brand}15`, color: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{idx+1}</div>
                    <span style={{ fontWeight: 600 }}>{item.description}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#64748b' }}>{item.quantity} <span style={{ fontSize: '11px' }}>{item.unit}</span></td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#64748b' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No services added</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
        <div>
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Payment Instructions</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                {state.payment.bankName && <div><span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>Bank</span><span style={{ fontWeight: 500, color: '#1e293b' }}>{state.payment.bankName}</span></div>}
                {state.payment.accountNumber && <div><span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>Account No.</span><span style={{ fontWeight: 500, color: '#1e293b' }}>{state.payment.accountNumber}</span></div>}
                {state.payment.ifsc && <div><span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>IFSC</span><span style={{ fontWeight: 500, color: '#1e293b' }}>{state.payment.ifsc}</span></div>}
                {state.payment.upiId && <div><span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>UPI</span><span style={{ fontWeight: 500, color: brand }}>{state.payment.upiId}</span></div>}
              </div>
            </div>
          )}
          {state.terms && <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '16px', padding: '0 8px' }}>Terms: {state.terms}</p>}
        </div>
        
        <div style={{ backgroundColor: '#fff', border: '2px solid #f1f5f9', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: '24px', color: brand }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '8px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      
    </div>
  );
}

