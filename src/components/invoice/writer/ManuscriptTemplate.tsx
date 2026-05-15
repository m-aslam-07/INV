import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function ManuscriptTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Merriweather', 'Times New Roman', serif", fontSize, lineHeight, color: '#2c1e16', backgroundColor: '#fffdfa', padding: '24px' }} className="w-full">
      <div style={{ textAlign: 'center', marginBottom: '48px', borderBottom: '1px solid #e8e2d9', paddingBottom: '32px' }}>
        {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '48px', margin: '0 auto 16px', objectFit: 'contain' }} />}
        <h1 style={{ fontSize: '32px', fontWeight: 400, color: '#1a110b', letterSpacing: '1px' }}>{state.business.name || 'Your Name'}</h1>
        <p style={{ color: '#5c4d43', fontSize: '14px', fontStyle: 'italic', marginTop: '8px' }}>
          {[state.business.email, state.business.phone].filter(Boolean).join(' • ')}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase' }}>{getDocLabel(state.docType)} <span style={{ fontSize: '14px', color: '#8c7a6b' }}>No. {state.document.number}</span></h2>
        <div style={{ textAlign: 'right', fontSize: '13px', color: '#5c4d43' }}>
          <p>Date: {state.document.date}</p>
          <p>Due: {state.document.dueDate}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '64px', marginBottom: '48px', fontSize }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#8c7a6b', borderBottom: '1px solid #e8e2d9', paddingBottom: '4px', marginBottom: '12px' }}>Author / Sender</p>
          <p style={{ fontWeight: 700, fontSize: '15px' }}>{state.business.name}</p>
          {state.business.address1 && <p style={{ color: '#4a3f35', marginTop: '4px' }}>{state.business.address1}</p>}
          {(state.business.city || state.business.state) && <p style={{ color: '#4a3f35' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
          {state.business.gstin && <p style={{ color: '#8c7a6b', fontSize: '12px', marginTop: '8px' }}>GSTIN: {state.business.gstin}</p>}
          {state.business.pan && <p style={{ color: '#8c7a6b', fontSize: '12px' }}>PAN: {state.business.pan}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#8c7a6b', borderBottom: '1px solid #e8e2d9', paddingBottom: '4px', marginBottom: '12px' }}>Publisher / Client</p>
          <p style={{ fontWeight: 700, fontSize: '15px' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#4a3f35', marginTop: '4px' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#4a3f35' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#8c7a6b', fontSize: '12px', marginTop: '8px' }}>GSTIN: {state.client.gstin}</p>}
        </div>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <div style={{ borderBottom: '2px solid #2c1e16', paddingBottom: '8px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px', fontSize: '12px', fontStyle: 'italic', color: '#5c4d43' }}>
          <span>Work Description</span><span style={{ textAlign: 'right' }}>Words/Qty</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Amount</span>
        </div>
        {state.items.map((item, idx) => item.type === 'heading' ? (
          <div key={item.id} style={{ padding: '16px 0 8px', fontWeight: 700, color: '#1a110b', fontSize: '16px', textAlign: 'center', borderBottom: '1px dotted #d1c7bd' }}>Chapter {idx + 1}: {item.description}</div>
        ) : (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px', padding: '12px 0', borderBottom: '1px solid #f0ebe1', fontSize, alignItems: 'center' }}>
            <span style={{ color: '#2c1e16' }}>{item.description}</span>
            <span style={{ textAlign: 'right', color: '#5c4d43' }}>{item.quantity} {item.unit !== 'Qty' ? <span style={{ fontSize: '11px' }}>{item.unit}</span> : ''}</span>
            <span style={{ textAlign: 'right', color: '#5c4d43' }}>{fmt(item.rate)}</span>
            <span style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(item.quantity * item.rate)}</span>
          </div>
        ))}
        {state.items.length === 0 && <p style={{ textAlign: 'center', color: '#c4b5a5', padding: '32px 0', fontStyle: 'italic' }}>No works listed</p>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c4d43', marginBottom: '8px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c4d43', marginBottom: '8px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c4d43', marginBottom: '8px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c4d43', marginBottom: '8px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5c4d43', marginBottom: '8px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '2px solid #2c1e16', borderBottom: '1px solid #2c1e16', padding: '12px 0', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '20px' }}>
            <span>Total</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#8c7a6b', fontStyle: 'italic', textAlign: 'right', marginTop: '8px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ marginBottom: '32px', padding: '20px', border: '1px solid #e8e2d9', backgroundColor: '#faf6f0', fontSize }}>
          <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#8c7a6b', marginBottom: '8px', borderBottom: '1px solid #e8e2d9', paddingBottom: '4px' }}>Payment Instructions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#4a3f35' }}>
            {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
            {state.payment.accountHolder && <p>Account Name: {state.payment.accountHolder}</p>}
            {state.payment.accountNumber && <p>Account No: {state.payment.accountNumber}</p>}
            {state.payment.ifsc && <p>IFSC Code: {state.payment.ifsc}</p>}
            {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
          </div>
        </div>
      )}
      {state.notes && <div style={{ marginBottom: '16px', fontSize }}><p style={{ fontSize: '12px', fontStyle: 'italic', color: '#8c7a6b', marginBottom: '4px' }}>Author's Note</p><p style={{ color: '#4a3f35', lineHeight: 1.6 }}>{state.notes}</p></div>}
      {state.terms && <div style={{ marginBottom: '16px', fontSize }}><p style={{ fontSize: '12px', fontStyle: 'italic', color: '#8c7a6b', marginBottom: '4px' }}>Terms of Agreement</p><p style={{ color: '#8c7a6b', fontSize: '12px', lineHeight: 1.6 }}>{state.terms}</p></div>}
      
    </div>
  );
}

