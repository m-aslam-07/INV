import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function CampaignTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#334155' }} className="w-full">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '36px', marginBottom: '16px', objectFit: 'contain' }} />}
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{state.business.name || 'Your Business'}</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{[state.business.address1, state.business.city, state.business.state].filter(Boolean).join(', ')}</p>
          <p style={{ color: '#64748b', fontSize: '13px' }}>{state.business.email} {state.business.phone && `| ${state.business.phone}`}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '4px' }}>{getDocLabel(state.docType)}</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>#{state.document.number}</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'flex-end', fontSize: '12px' }}>
            <div><p style={{ color: '#94a3b8', marginBottom: '2px' }}>Issued</p><p style={{ fontWeight: 600 }}>{state.document.date}</p></div>
            <div><p style={{ color: '#94a3b8', marginBottom: '2px' }}>Due</p><p style={{ fontWeight: 600 }}>{state.document.dueDate}</p></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Billed To</p>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#475569', marginTop: '4px' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#475569', marginTop: '4px' }}>{state.client.address}</p>}
          {state.client.state && <p style={{ color: '#475569' }}>{state.client.state}</p>}
          {state.client.gstin && <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Tax & Legal Info</p>
          <table style={{ width: '100%', fontSize: '13px' }}>
            <tbody>
              {state.business.gstin && <tr><td style={{ padding: '4px 0', color: '#64748b' }}>Provider GSTIN:</td><td style={{ fontWeight: 600 }}>{state.business.gstin}</td></tr>}
              {state.business.pan && <tr><td style={{ padding: '4px 0', color: '#64748b' }}>Provider PAN:</td><td style={{ fontWeight: 600 }}>{state.business.pan}</td></tr>}
              {state.business.state && <tr><td style={{ padding: '4px 0', color: '#64748b' }}>State of Supply:</td><td style={{ fontWeight: 600 }}>{state.business.state}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
              {['Campaign / Service','Qty','Rate','Amount'].map((h,i) => (
                <th key={h} style={{ textAlign: i===0?'left':'right', padding: '12px 8px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={4} style={{ padding: '16px 8px 8px', fontWeight: 700, color: '#3b82f6', fontSize: '14px' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 8px' }}>
                  <p style={{ fontWeight: 600, color: '#1e293b' }}>{item.description}</p>
                </td>
                <td style={{ padding: '16px 8px', textAlign: 'right', color: '#64748b' }}>{item.quantity} <span style={{ fontSize: '11px' }}>{item.unit}</span></td>
                <td style={{ padding: '16px 8px', textAlign: 'right', color: '#64748b' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No items added</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
        <div>
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Payment Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', fontSize: '13px', color: '#334155' }}>
                {state.payment.bankName && <><span style={{ color: '#94a3b8' }}>Bank</span><span style={{ fontWeight: 500 }}>{state.payment.bankName}</span></>}
                {state.payment.accountNumber && <><span style={{ color: '#94a3b8' }}>A/C No.</span><span style={{ fontWeight: 500 }}>{state.payment.accountNumber}</span></>}
                {state.payment.ifsc && <><span style={{ color: '#94a3b8' }}>IFSC</span><span style={{ fontWeight: 500 }}>{state.payment.ifsc}</span></>}
                {state.payment.upiId && <><span style={{ color: '#94a3b8' }}>UPI</span><span style={{ fontWeight: 500 }}>{state.payment.upiId}</span></>}
              </div>
            </div>
          )}
          {state.notes && <div style={{ marginBottom: '12px' }}><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Notes</p><p style={{ color: '#475569', fontSize: '13px' }}>{state.notes}</p></div>}
          {state.terms && <div><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Terms</p><p style={{ color: '#64748b', fontSize: '11px' }}>{state.terms}</p></div>}
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Total Amount</span>
            <span style={{ fontWeight: 800, fontSize: '24px', color: '#3b82f6' }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '8px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      
    </div>
  );
}

