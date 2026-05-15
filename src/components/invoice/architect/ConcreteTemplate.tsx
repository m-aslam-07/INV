import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function ConcreteTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#374151' }} className="w-full">
      <div style={{ display: 'flex', borderBottom: '4px solid #4b5563', marginBottom: '24px' }}>
        <div style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '24px' }}>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '32px', marginBottom: '12px' }} />}
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', textTransform: 'uppercase' }}>{state.business.name || 'Your Business'}</h1>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{state.business.email} {state.business.phone && `| ${state.business.phone}`}</p>
        </div>
        <div style={{ width: '240px', backgroundColor: '#e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#4b5563', textTransform: 'uppercase' }}>{getDocLabel(state.docType)}</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', marginTop: '4px' }}>{state.document.number}</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', backgroundColor: '#d1d5db', border: '2px solid #d1d5db', marginBottom: '24px', fontSize: '11px' }}>
        {[['DATE', state.document.date], ['DUE DATE', state.document.dueDate], ['GSTIN', state.business.gstin || '—'], ['PAN', state.business.pan || '—']].map(([l, v]) => (
          <div key={l} style={{ backgroundColor: '#fff', padding: '10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>{l}</p>
            <p style={{ fontWeight: 600, color: '#1f2937' }}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', fontSize }}>
        <div style={{ border: '2px solid #e5e7eb', padding: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', display: 'inline-block', marginBottom: '12px', fontSize: '10px', fontWeight: 700, color: '#4b5563' }}>FROM</div>
          <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '14px' }}>{state.business.name}</p>
          {state.business.address1 && <p style={{ color: '#4b5563', marginTop: '4px' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#4b5563' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
        </div>
        <div style={{ border: '2px solid #e5e7eb', padding: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', display: 'inline-block', marginBottom: '12px', fontSize: '10px', fontWeight: 700, color: '#4b5563' }}>TO</div>
          <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '14px' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#4b5563', marginTop: '4px' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#4b5563' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '8px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize }}>
        <thead>
          <tr style={{ backgroundColor: '#4b5563', color: '#fff' }}>
            {['#','Description','Qty','Unit','Rate','Amount'].map((h,i) => (
              <th key={h} style={{ textAlign: i<2?'left':'right', padding: '10px 12px', fontSize: '11px', fontWeight: 600, borderRight: i<5?'1px solid #6b7280':'none' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={6} style={{ padding: '8px 12px', fontWeight: 700, backgroundColor: '#f3f4f6', color: '#1f2937', border: '1px solid #e5e7eb' }}>{item.description}</td></tr>
          ) : (
            <tr key={item.id}>
              <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 500 }}>{idx+1}</td>
              <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontWeight: 500, color: '#1f2937' }}>{item.description}</td>
              <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#6b7280', fontSize: '11px' }}>{item.unit}</td>
              <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', textAlign: 'right' }}>{fmt(item.rate)}</td>
              <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', border: '1px solid #e5e7eb', color: '#9ca3af' }}>No items</td></tr>}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div style={{ width: '280px', border: '2px solid #4b5563' }}>
          <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>Subtotal</span><span style={{ fontWeight: 600 }}>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>Discount</span><span style={{ fontWeight: 600 }}>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span style={{ fontWeight: 600 }}>{fmt(totals.cgst)}</span></div><div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span style={{ fontWeight: 600 }}>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span style={{ fontWeight: 600 }}>{fmt(totals.igst)}</span></div>}
          <div style={{ backgroundColor: '#f3f4f6', padding: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', color: '#1f2937' }}>
            <span>TOTAL</span><span>{fmt(totals.total)}</span>
          </div>
        </div>
      </div>
      {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 500, textAlign: 'right', marginTop: '-16px', marginBottom: '24px' }}>{amountToWords(totals.total)}</p>}

      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', fontSize }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#4b5563', marginBottom: '8px' }}>PAYMENT DETAILS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#374151', fontWeight: 500 }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '16px', fontSize }}><p style={{ fontSize: '10px', fontWeight: 700, color: '#4b5563', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#374151' }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '16px', fontSize }}><p style={{ fontSize: '10px', fontWeight: 700, color: '#4b5563', marginBottom: '4px' }}>TERMS & CONDITIONS</p><p style={{ color: '#6b7280', fontSize: '11px' }}>{state.terms}</p></div>}
      
    </div>
  );
}

