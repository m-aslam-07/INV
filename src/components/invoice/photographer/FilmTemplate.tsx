import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function FilmTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#e8e0d4' }} className="w-full">
      {/* Film strip header */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '24px 32px', marginLeft: '-32px', marginRight: '-32px', marginTop: '-32px', marginBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginBottom: '16px' }}>
          {Array.from({ length: 20 }).map((_, i) => <div key={i} style={{ width: '8px', height: '6px', backgroundColor: '#333', borderRadius: '1px', flexShrink: 0 }} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '32px', marginBottom: '8px', objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '4px 8px' }} />}
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#d4a847' }}>{state.business.name || 'Your Business'}</h1>
            <p style={{ color: '#666', fontSize: '12px' }}>{state.business.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#d4a847' }}>{getDocLabel(state.docType)}</p>
            <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>{state.document.number}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '16px' }}>
          {Array.from({ length: 20 }).map((_, i) => <div key={i} style={{ width: '8px', height: '6px', backgroundColor: '#333', borderRadius: '1px', flexShrink: 0 }} />)}
        </div>
      </div>

      {/* Body on dark */}
      <div style={{ backgroundColor: '#111', color: '#ccc', padding: '24px 32px', marginLeft: '-32px', marginRight: '-32px' }}>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', fontSize: '12px', color: '#888' }}>
          <span>Date: {state.document.date}</span><span>Due: {state.document.dueDate}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px', fontSize }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#d4a847', marginBottom: '6px' }}>FROM</p>
            <p style={{ fontWeight: 600, color: '#eee' }}>{state.business.name}</p>
            {state.business.phone && <p style={{ color: '#888' }}>{state.business.phone}</p>}
            {state.business.address1 && <p style={{ color: '#888' }}>{state.business.address1}</p>}
            {(state.business.city || state.business.state) && <p style={{ color: '#888' }}>{[state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>}
            {state.business.gstin && <p style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.business.gstin}</p>}
          </div>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#d4a847', marginBottom: '6px' }}>BILL TO</p>
            <p style={{ fontWeight: 600, color: '#eee' }}>{state.client.name || 'Client Name'}</p>
            {state.client.email && <p style={{ color: '#888' }}>{state.client.email}</p>}
            {state.client.address && <p style={{ color: '#888' }}>{state.client.address}</p>}
            {state.client.gstin && <p style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>GSTIN: {state.client.gstin}</p>}
          </div>
        </div>

        {/* Items */}
        <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #d4a847', borderTop: '1px solid #d4a847' }}>
              {['#','Description','Qty','Unit','Rate','Amount'].map((h,i) => (
                <th key={h} style={{ textAlign: i<2?'left':'right', padding: '8px 6px', fontSize: '10px', letterSpacing: '1px', color: '#d4a847' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item, idx) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={6} style={{ padding: '6px', fontWeight: 600, color: '#d4a847', borderBottom: '1px solid #222' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '8px 6px', color: '#666' }}>{idx+1}</td>
                <td style={{ padding: '8px 6px', color: '#ccc' }}>{item.description}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: '#888' }}>{item.quantity}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: '#555', fontSize: '11px' }}>{item.unit}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: '#888' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: '#d4a847' }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#444' }}>No items</td></tr>}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ width: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '4px', fontSize }}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '4px', fontSize }}><span>Discount</span><span>-{fmt(totals.discount)}</span></div>}
            {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '4px', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '4px', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div>
            </>)}
            {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '4px', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
            <div style={{ borderTop: '2px solid #d4a847', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}>
              <span style={{ color: '#d4a847' }}>Total</span><span style={{ color: '#d4a847' }}>{fmt(totals.total)}</span>
            </div>
            {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>{amountToWords(totals.total)}</p>}
          </div>
        </div>

        {(state.payment.bankName || state.payment.upiId) && (
          <div style={{ marginBottom: '20px', padding: '12px', border: '1px solid #333', borderRadius: '4px', fontSize }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#d4a847', marginBottom: '6px' }}>PAYMENT</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#888' }}>
              {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
              {state.payment.accountHolder && <p>Holder: {state.payment.accountHolder}</p>}
              {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
              {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
              {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
            </div>
          </div>
        )}
        {state.notes && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '10px', letterSpacing: '2px', color: '#d4a847', marginBottom: '4px' }}>NOTES</p><p style={{ color: '#888' }}>{state.notes}</p></div>}
        {state.terms && <div style={{ marginBottom: '12px', fontSize }}><p style={{ fontSize: '10px', letterSpacing: '2px', color: '#d4a847', marginBottom: '4px' }}>TERMS</p><p style={{ color: '#666', fontSize: '11px' }}>{state.terms}</p></div>}
        
      </div>
    </div>
  );
}

