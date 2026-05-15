import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function WorkOrderTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor || '#1d4ed8';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#1f2937' }} className="w-full">
      {/* Official Letterhead Header */}
      <div style={{ borderBottom: `4px solid ${brand}`, paddingBottom: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '64px', objectFit: 'contain' }} />}
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: brand, textTransform: 'uppercase', letterSpacing: '1px' }}>{state.business.name || 'Your Company'}</h1>
            <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '4px' }}>{[state.business.address1, state.business.city, state.business.state].filter(Boolean).join(', ')}</p>
            <p style={{ color: '#4b5563', fontSize: '12px' }}>Ph: {state.business.phone} | Email: {state.business.email}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#eff6ff', border: `1px solid ${brand}`, padding: '8px 16px', borderRadius: '4px' }}>
            <p style={{ fontSize: '14px', fontWeight: 800, color: brand, textTransform: 'uppercase' }}>{getDocLabel(state.docType)}</p>
            <p style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{state.document.number}</p>
          </div>
        </div>
      </div>

      {/* Prominent Site Address Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '16px' }}>
          <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>Client Details</h3>
          <p style={{ fontWeight: 700, fontSize: '14px' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#4b5563' }}>{state.client.email}</p>}
          {state.client.address && <p style={{ color: '#4b5563' }}>{state.client.address}</p>}
          {state.client.gstin && <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>GSTIN: {state.client.gstin}</p>}
        </div>
        <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '16px', backgroundColor: '#f9fafb' }}>
          <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>Project / Site Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', fontSize: '13px' }}>
            <span style={{ color: '#6b7280' }}>Date:</span><span style={{ fontWeight: 600 }}>{state.document.date}</span>
            <span style={{ color: '#6b7280' }}>Due Date:</span><span style={{ fontWeight: 600 }}>{state.document.dueDate}</span>
            <span style={{ color: '#6b7280' }}>Site State:</span><span style={{ fontWeight: 600 }}>{state.client.state || '—'}</span>
            <span style={{ color: '#6b7280' }}>My GSTIN:</span><span style={{ fontWeight: 600 }}>{state.business.gstin || '—'}</span>
          </div>
        </div>
      </div>

      <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse', fontSize }}>
        <thead>
          <tr style={{ backgroundColor: brand, color: '#fff' }}>
            <th style={{ padding: '10px', textAlign: 'center', width: '50px' }}>#</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Work Description</th>
            <th style={{ padding: '10px', textAlign: 'right', width: '80px' }}>Qty</th>
            <th style={{ padding: '10px', textAlign: 'right', width: '100px' }}>Rate</th>
            <th style={{ padding: '10px', textAlign: 'right', width: '120px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={5} style={{ padding: '8px 10px', fontWeight: 700, backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>{item.description}</td></tr>
          ) : (
            <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
              <td style={{ padding: '10px', fontWeight: 500 }}>{item.description}</td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#4b5563' }}>{item.quantity} <span style={{ fontSize: '11px', color: '#9ca3af' }}>{item.unit}</span></td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#4b5563' }}>{fmt(item.rate)}</td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No items added</td></tr>}
        </tbody>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '32px' }}>
        <div>
          {state.document.currency === 'INR' && totals.total > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Amount in Words</p>
              <p style={{ fontWeight: 500 }}>{amountToWords(totals.total)}</p>
            </div>
          )}
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb', fontSize: '12px' }}>
              <p style={{ fontWeight: 700, marginBottom: '4px' }}>Bank Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#4b5563' }}>
                {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
                {state.payment.accountNumber && <p>A/C: {state.payment.accountNumber}</p>}
                {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
                {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
              </div>
            </div>
          )}
        </div>
        <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>Subtotal</span><span style={{ fontWeight: 600 }}>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>Discount</span><span style={{ fontWeight: 600 }}>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>CGST ({state.tax.gstRate/2}%)</span><span style={{ fontWeight: 600 }}>{fmt(totals.cgst)}</span></div><div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>SGST ({state.tax.gstRate/2}%)</span><span style={{ fontWeight: 600 }}>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', fontSize }}><span>IGST ({state.tax.gstRate}%)</span><span style={{ fontWeight: 600 }}>{fmt(totals.igst)}</span></div>}
          <div style={{ backgroundColor: brand, color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px' }}>
            <span>TOTAL</span><span>{fmt(totals.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', alignItems: 'end', marginTop: '48px' }}>
        <div style={{ fontSize: '11px', color: '#4b5563' }}>
          {state.notes && <p style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700 }}>Notes: </span>{state.notes}</p>}
          {state.terms && <p><span style={{ fontWeight: 700 }}>Terms: </span>{state.terms}</p>}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', border: '2px dashed #d1d5db', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px' }}>STAMP</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #1f2937', marginBottom: '8px', height: '40px' }}></div>
          <p style={{ fontWeight: 600, fontSize: '12px' }}>Authorized Signatory</p>
        </div>
      </div>

      
    </div>
  );
}

