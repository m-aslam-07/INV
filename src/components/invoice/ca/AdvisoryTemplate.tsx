import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function AdvisoryTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#1f2937' }} className="w-full">
      {/* Letterhead Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '48px', objectFit: 'contain' }} />}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '1px', color: '#111827' }}>{state.business.name || 'Advisory Firm'}</h1>
            <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '2px' }}>Financial & Strategic Consultants</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563' }}>
          <p>{[state.business.address1, state.business.city, state.business.state].filter(Boolean).join(', ')}</p>
          <p>{state.business.email} {state.business.phone && `| ${state.business.phone}`}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#111827' }}>{getDocLabel(state.docType)}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', fontSize: '13px' }}>
        <div>
          <p style={{ fontWeight: 700, color: '#111827', marginBottom: '8px' }}>To,</p>
          <p style={{ fontWeight: 600 }}>{state.client.name || 'Client Name'}</p>
          {state.client.address && <p>{state.client.address}</p>}
          {state.client.state && <p>{state.client.state}</p>}
          {state.client.gstin && <p style={{ marginTop: '4px', fontWeight: 600 }}>GSTIN: {state.client.gstin}</p>}
        </div>
        <div style={{ textAlign: 'right', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '4px', backgroundColor: '#f9fafb' }}>
          <table style={{ textAlign: 'left' }}>
            <tbody>
              <tr><td style={{ paddingRight: '16px', color: '#6b7280' }}>Reference No:</td><td style={{ fontWeight: 600 }}>{state.document.number}</td></tr>
              <tr><td style={{ paddingRight: '16px', color: '#6b7280' }}>Date:</td><td style={{ fontWeight: 600 }}>{state.document.date}</td></tr>
              <tr><td style={{ paddingRight: '16px', color: '#6b7280' }}>Due Date:</td><td style={{ fontWeight: 600 }}>{state.document.dueDate}</td></tr>
              {state.business.gstin && <tr><td style={{ paddingRight: '16px', color: '#6b7280', paddingTop: '4px' }}>Our GSTIN:</td><td style={{ fontWeight: 600, paddingTop: '4px' }}>{state.business.gstin}</td></tr>}
              {state.business.pan && <tr><td style={{ paddingRight: '16px', color: '#6b7280' }}>Our PAN:</td><td style={{ fontWeight: 600 }}>{state.business.pan}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 600, fontSize: '14px' }}>Dear Sir/Madam,</p>
        <p style={{ marginTop: '8px', color: '#374151' }}>Please find below the details of professional services rendered as per our engagement:</p>
      </div>

      <table style={{ width: '100%', marginBottom: '32px', borderCollapse: 'collapse', fontSize }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111827' }}>
            {['No.', 'Description of Engagement / Services', 'Hours/Qty', 'Rate', 'Amount'].map((h,i) => (
              <th key={h} style={{ textAlign: i<2?'left':'right', padding: '12px 8px', fontSize: '12px', color: '#4b5563', fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={5} style={{ padding: '12px 8px', fontWeight: 700, backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>{item.description}</td></tr>
          ) : (
            <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 8px', color: '#6b7280' }}>{String(idx + 1).padStart(2, '0')}</td>
              <td style={{ padding: '12px 8px', fontWeight: 500 }}>{item.description}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', color: '#4b5563' }}>{item.quantity} {item.unit}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', color: '#4b5563' }}>{fmt(item.rate)}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No services added</td></tr>}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', padding: '0 8px', fontSize }}><span>Professional Fees</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', padding: '0 8px', fontSize }}><span>Less: Discount</span><span>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', padding: '0 8px', fontSize }}><span>Add: CGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', padding: '0 8px', fontSize }}><span>Add: SGST ({state.tax.gstRate/2}%)</span><span>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '8px', padding: '0 8px', fontSize }}><span>Add: IGST ({state.tax.gstRate}%)</span><span>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '2px solid #111827', borderBottom: '2px solid #111827', padding: '12px 8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px' }}>
            <span>Total Payable</span><span>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', textAlign: 'right', marginTop: '8px', padding: '0 8px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <div>
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ fontSize: '12px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px', color: '#111827' }}>Remittance Instructions:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', color: '#4b5563' }}>
                {state.payment.accountHolder && <><span style={{ color: '#6b7280' }}>Beneficiary:</span><span style={{ fontWeight: 500 }}>{state.payment.accountHolder}</span></>}
                {state.payment.bankName && <><span style={{ color: '#6b7280' }}>Bank Name:</span><span style={{ fontWeight: 500 }}>{state.payment.bankName}</span></>}
                {state.payment.accountNumber && <><span style={{ color: '#6b7280' }}>Account No:</span><span style={{ fontWeight: 500 }}>{state.payment.accountNumber}</span></>}
                {state.payment.ifsc && <><span style={{ color: '#6b7280' }}>IFSC Code:</span><span style={{ fontWeight: 500 }}>{state.payment.ifsc}</span></>}
                {state.payment.upiId && <><span style={{ color: '#6b7280' }}>UPI ID:</span><span style={{ fontWeight: 500 }}>{state.payment.upiId}</span></>}
              </div>
            </div>
          )}
          {state.notes && <div style={{ marginTop: '16px', fontSize: '12px' }}><p style={{ fontWeight: 700, marginBottom: '4px' }}>Notes:</p><p style={{ color: '#4b5563' }}>{state.notes}</p></div>}
          {state.terms && <div style={{ marginTop: '16px', fontSize: '11px' }}><p style={{ fontWeight: 700, marginBottom: '4px' }}>Terms:</p><p style={{ color: '#6b7280' }}>{state.terms}</p></div>}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '16px' }}>
          <p style={{ fontWeight: 700, marginBottom: '60px' }}>For {state.business.name}</p>
          <p style={{ borderTop: '1px solid #111827', paddingTop: '8px', display: 'inline-block', marginLeft: 'auto', width: '200px', textAlign: 'center' }}>Authorized Signatory</p>
        </div>
      </div>

      
    </div>
  );
}

