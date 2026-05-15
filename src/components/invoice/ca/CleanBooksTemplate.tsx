import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function CleanBooksTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor || '#10b981';

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize, lineHeight, color: '#1e293b' }} className="w-full">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'inline-block', backgroundColor: `${brand}15`, color: brand, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            {getDocLabel(state.docType)}
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>{state.document.number}</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Issued on {state.document.date}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '40px', marginBottom: '8px', objectFit: 'contain' }} />}
          <p style={{ fontSize: '18px', fontWeight: 700 }}>{state.business.name || 'Your Business'}</p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{state.business.email}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700, marginBottom: '12px' }}>Billed To</p>
          <p style={{ fontWeight: 700, fontSize: '15px' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#475569', marginTop: '4px' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#475569', marginTop: '4px' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
        <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700, marginBottom: '12px' }}>Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><p style={{ color: '#64748b', fontSize: '12px' }}>Due Date</p><p style={{ fontWeight: 600 }}>{state.document.dueDate}</p></div>
            <div><p style={{ color: '#64748b', fontSize: '12px' }}>Your GSTIN</p><p style={{ fontWeight: 600 }}>{state.business.gstin || '—'}</p></div>
            <div><p style={{ color: '#64748b', fontSize: '12px' }}>Your PAN</p><p style={{ fontWeight: 600 }}>{state.business.pan || '—'}</p></div>
            <div><p style={{ color: '#64748b', fontSize: '12px' }}>State</p><p style={{ fontWeight: 600 }}>{state.business.state || '—'}</p></div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize }}>
          <thead>
            <tr>
              {['Service Details','Qty','Rate','Amount'].map((h,i) => (
                <th key={h} style={{ textAlign: i===0?'left':'right', padding: '0 16px 8px', fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={4} style={{ padding: '16px', fontWeight: 700, color: brand, backgroundColor: `${brand}08`, borderRadius: '8px' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id}>
                <td style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px', borderRight: 'none' }}>
                  <p style={{ fontWeight: 600 }}>{item.description}</p>
                </td>
                <td style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#64748b' }}>
                  {item.quantity} <span style={{ fontSize: '11px' }}>{item.unit}</span>
                </td>
                <td style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#64748b' }}>
                  {fmt(item.rate)}
                </td>
                <td style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0 8px 8px 0', borderLeft: 'none', textAlign: 'right', fontWeight: 700 }}>
                  {fmt(item.quantity * item.rate)}
                </td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>No services added</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700, marginBottom: '12px' }}>Payment Info</p>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '13px' }}>
                {state.payment.bankName && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Bank</span><span style={{ fontWeight: 500 }}>{state.payment.bankName}</span></div>}
                {state.payment.accountNumber && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#64748b' }}>Account No</span><span style={{ fontWeight: 500 }}>{state.payment.accountNumber}</span></div>}
                {state.payment.ifsc && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#64748b' }}>IFSC</span><span style={{ fontWeight: 500 }}>{state.payment.ifsc}</span></div>}
                {state.payment.upiId && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>UPI</span><span style={{ fontWeight: 500 }}>{state.payment.upiId}</span></div>}
              </div>
            </div>
          )}
          {state.notes && <div style={{ marginBottom: '12px' }}><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>Notes</p><p style={{ color: '#475569', fontSize: '13px' }}>{state.notes}</p></div>}
          {state.terms && <div><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>Terms</p><p style={{ color: '#64748b', fontSize: '11px' }}>{state.terms}</p></div>}
        </div>
        
        <div>
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
            {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
            {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Amount</span>
              <span style={{ fontWeight: 800, fontSize: '24px', color: brand }}>{fmt(totals.total)}</span>
            </div>
            {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '8px' }}>{amountToWords(totals.total)}</p>}
          </div>
        </div>
      </div>

      
    </div>
  );
}

