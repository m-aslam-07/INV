import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function AgencyTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor || '#18181b';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#27272a' }} className="w-full">
      <div style={{ backgroundColor: brand, color: '#fff', padding: '32px 40px', marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '40px', marginBottom: '16px', objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '4px 8px' }} />}
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>{state.business.name || 'Creative Agency'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>{[state.business.email, state.business.phone].filter(Boolean).join(' | ')}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{getDocLabel(state.docType)}</p>
          <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{state.document.number}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '48px', padding: '0 8px' }}>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a1a1aa', fontWeight: 600, marginBottom: '12px' }}>Agency Info</p>
          <p style={{ fontWeight: 600, fontSize: '15px', color: '#18181b' }}>{state.business.name}</p>
          {state.business.address1 && <p style={{ color: '#52525b', marginTop: '4px' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#52525b' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
          {state.business.gstin && <p style={{ color: '#71717a', fontSize: '12px', marginTop: '8px' }}>GSTIN: {state.business.gstin}</p>}
        </div>
        <div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a1a1aa', fontWeight: 600, marginBottom: '12px' }}>Client Info</p>
          <p style={{ fontWeight: 600, fontSize: '15px', color: '#18181b' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#52525b', marginTop: '4px' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#52525b', marginTop: '4px' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#71717a', fontSize: '12px', marginTop: '8px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', padding: '16px 24px', backgroundColor: '#f4f4f5', borderRadius: '8px', margin: '0 8px 40px' }}>
        <div><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#71717a', marginBottom: '4px' }}>Date</p><p style={{ fontWeight: 600, color: '#18181b' }}>{state.document.date}</p></div>
        <div><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#71717a', marginBottom: '4px' }}>Due Date</p><p style={{ fontWeight: 600, color: '#18181b' }}>{state.document.dueDate}</p></div>
      </div>

      <div style={{ marginBottom: '48px', padding: '0 8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e4e4e7' }}>
              {['Service Details','Qty','Rate','Total'].map((h,i) => (
                <th key={h} style={{ textAlign: i===0?'left':'right', padding: '12px 8px', fontSize: '12px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={4} style={{ padding: '16px 8px 8px', fontWeight: 700, color: '#18181b', fontSize: '14px' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                <td style={{ padding: '16px 8px' }}>
                  <p style={{ fontWeight: 600, color: '#27272a' }}>{item.description}</p>
                </td>
                <td style={{ padding: '16px 8px', textAlign: 'right', color: '#52525b' }}>{item.quantity} <span style={{ fontSize: '11px' }}>{item.unit}</span></td>
                <td style={{ padding: '16px 8px', textAlign: 'right', color: '#52525b' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 600, color: '#18181b' }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#a1a1aa' }}>No services added</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px', padding: '0 8px' }}>
        <div style={{ width: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', marginBottom: '12px', fontSize: '14px' }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', marginBottom: '12px', fontSize: '14px' }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', marginBottom: '12px', fontSize: '14px' }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', marginBottom: '12px', fontSize: '14px' }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#18181b' }}>Total Amount</span>
            <span style={{ fontWeight: 800, fontSize: '24px', color: brand }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#71717a', textAlign: 'right', marginTop: '8px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', padding: '0 8px' }}>
        <div>
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a1a1aa', fontWeight: 600, marginBottom: '12px' }}>Payment Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '6px', fontSize: '13px', color: '#3f3f46' }}>
                {state.payment.bankName && <><span style={{ color: '#71717a' }}>Bank</span><span style={{ fontWeight: 500 }}>{state.payment.bankName}</span></>}
                {state.payment.accountNumber && <><span style={{ color: '#71717a' }}>A/C No.</span><span style={{ fontWeight: 500 }}>{state.payment.accountNumber}</span></>}
                {state.payment.ifsc && <><span style={{ color: '#71717a' }}>IFSC</span><span style={{ fontWeight: 500 }}>{state.payment.ifsc}</span></>}
                {state.payment.upiId && <><span style={{ color: '#71717a' }}>UPI</span><span style={{ fontWeight: 500 }}>{state.payment.upiId}</span></>}
              </div>
            </div>
          )}
        </div>
        <div>
          {state.notes && <div style={{ marginBottom: '16px' }}><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a1a1aa', fontWeight: 600, marginBottom: '6px' }}>Notes</p><p style={{ color: '#52525b', fontSize: '13px' }}>{state.notes}</p></div>}
          {state.terms && <div><p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a1a1aa', fontWeight: 600, marginBottom: '6px' }}>Terms</p><p style={{ color: '#71717a', fontSize: '11px' }}>{state.terms}</p></div>}
        </div>
      </div>

      
    </div>
  );
}

