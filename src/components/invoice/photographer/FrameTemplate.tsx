import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function FrameTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize, lineHeight, color: '#3d2c1e', backgroundColor: '#faf6f1', border: '6px solid #e8ddd0', borderRadius: '4px', padding: '32px', margin: '-32px', minHeight: 'calc(297mm - 64px)' }} className="w-full">
      {/* Inner frame */}
      <div style={{ border: '1px solid #d4c5b3', padding: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '40px', margin: '0 auto 12px', objectFit: 'contain' }} />}
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#3d2c1e' }}>{state.business.name || 'Your Business'}</h1>
          <p style={{ color: '#8b7355', fontSize: '12px', marginTop: '4px' }}>{[state.business.email, state.business.phone].filter(Boolean).join(' · ')}</p>
          <div style={{ width: '60px', height: '2px', backgroundColor: '#c4a882', margin: '12px auto' }} />
          <p style={{ color: '#8b7355', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>{getDocLabel(state.docType)}</p>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px', fontSize: '12px', color: '#8b7355' }}>
          <span>{state.document.number}</span><span>{state.document.date}</span><span>Due: {state.document.dueDate}</span>
        </div>

        {/* From/To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px', fontSize }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#c4a882', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>From</p>
            <p style={{ fontWeight: 600 }}>{state.business.name}</p>
            {state.business.address1 && <p style={{ color: '#6b5c4c' }}>{state.business.address1}</p>}
            {(state.business.city || state.business.state) && <p style={{ color: '#6b5c4c' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
            {state.business.gstin && <p style={{ color: '#8b7355', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.business.gstin}</p>}
          </div>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#c4a882', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Bill To</p>
            <p style={{ fontWeight: 600 }}>{state.client.name || 'Client Name'}</p>
            {state.client.email && <p style={{ color: '#6b5c4c' }}>{state.client.email}</p>}
            {state.client.address && <p style={{ color: '#6b5c4c' }}>{state.client.address}</p>}
            {state.client.gstin && <p style={{ color: '#8b7355', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.client.gstin}</p>}
          </div>
        </div>

        {/* Items */}
        <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #c4a882', borderTop: '2px solid #c4a882' }}>
              {['#','Description','Qty','Rate','Amount'].map((h,i) => (
                <th key={h} style={{ textAlign: i<2?'left':'right', padding: '8px 6px', fontSize: '10px', letterSpacing: '2px', color: '#8b7355', textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item, idx) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={5} style={{ padding: '6px', fontWeight: 600, color: '#6b5c4c', fontStyle: 'italic', borderBottom: '1px solid #e8ddd0' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: '1px solid #e8ddd0', backgroundColor: idx % 2 === 0 ? 'transparent' : '#f5efe8' }}>
                <td style={{ padding: '8px 6px', color: '#8b7355' }}>{idx+1}</td>
                <td style={{ padding: '8px 6px' }}>{item.description}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: '#6b5c4c' }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: '#6b5c4c' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#c4a882' }}>No items</td></tr>}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ width: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b7355', marginBottom: '4px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b7355', marginBottom: '4px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
            {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b7355', marginBottom: '4px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b7355', marginBottom: '4px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div>
            </>)}
            {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b7355', marginBottom: '4px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
            <div style={{ borderTop: '2px solid #c4a882', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px' }}>
              <span>Total</span><span style={{ color: '#3d2c1e' }}>{fmt(totals.total)}</span>
            </div>
            {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#8b7355', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
          </div>
        </div>

        {(state.payment.bankName || state.payment.upiId) && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f5efe8', borderRadius: '4px', fontSize }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#c4a882', marginBottom: '6px', textTransform: 'uppercase' }}>Payment</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#6b5c4c' }}>
              {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
              {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
              {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
              {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
              {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
            </div>
          </div>
        )}
        {state.notes && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '10px', letterSpacing: '2px', color: '#c4a882', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#6b5c4c' }}>{state.notes}</p></div>}
        {state.terms && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '10px', letterSpacing: '2px', color: '#c4a882', marginBottom: '4px' }}>TERMS</p><p style={{ color: '#8b7355', fontSize: '11px' }}>{state.terms}</p></div>}
        
      </div>
    </div>
  );
}

