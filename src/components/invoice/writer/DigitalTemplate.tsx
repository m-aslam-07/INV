import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function DigitalTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);
  const brand = state.style.brandColor || '#6366f1';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize, lineHeight, color: '#1e293b' }} className="w-full">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {state.business.logoUrl ? (
            <img src={state.business.logoUrl} alt="Logo" style={{ height: '48px', width: '48px', objectFit: 'contain', borderRadius: '12px', backgroundColor: '#fff', padding: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${brand}, #818cf8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '20px' }}>
              {(state.business.name || 'YB')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{state.business.name || 'Your Business'}</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>{state.business.email}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#eef2ff', color: brand, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {getDocLabel(state.docType)}
          </div>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{state.document.number}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Billed To</p>
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{state.client.name || 'Client Name'}</p>
          {state.client.email && <p style={{ color: '#475569', fontSize: '13px', marginTop: '2px' }}>{state.client.email}</p>}
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Dates</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '2px' }}><span style={{ color: '#64748b' }}>Issued:</span><span style={{ fontWeight: 600 }}>{state.document.date}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#64748b' }}>Due:</span><span style={{ fontWeight: 600, color: '#ef4444' }}>{state.document.dueDate}</span></div>
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Tax Details</p>
          {state.business.gstin && <p style={{ color: '#475569', fontSize: '12px', marginBottom: '2px' }}>Your GSTIN: <span style={{ fontWeight: 500 }}>{state.business.gstin}</span></p>}
          {state.client.gstin && <p style={{ color: '#475569', fontSize: '12px' }}>Client GSTIN: <span style={{ fontWeight: 500 }}>{state.client.gstin}</span></p>}
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Service','Qty','Rate','Total'].map((h,i) => (
                <th key={h} style={{ textAlign: i===0?'left':'right', padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.items.map((item, idx) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={4} style={{ padding: '12px 16px', fontWeight: 600, color: brand, backgroundColor: '#f1f5f9', fontSize: '13px' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: idx === state.items.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px' }}>
                  <p style={{ fontWeight: 600, color: '#0f172a' }}>{item.description}</p>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#64748b' }}>
                  <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{item.quantity} {item.unit}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#64748b' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
            {state.items.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Add services to generate bill</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px', alignItems: 'start' }}>
        <div>
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Payment Method</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#334155' }}>
                {state.payment.bankName && <div><span style={{ color: '#94a3b8' }}>Bank:</span> <span style={{ fontWeight: 500 }}>{state.payment.bankName}</span></div>}
                {state.payment.accountNumber && <div><span style={{ color: '#94a3b8' }}>A/C:</span> <span style={{ fontWeight: 500 }}>{state.payment.accountNumber}</span></div>}
                {state.payment.ifsc && <div><span style={{ color: '#94a3b8' }}>IFSC:</span> <span style={{ fontWeight: 500 }}>{state.payment.ifsc}</span></div>}
                {state.payment.upiId && <div style={{ gridColumn: '1 / -1', marginTop: '8px', padding: '8px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</div>
                  <span style={{ fontWeight: 500 }}>{state.payment.upiId}</span>
                </div>}
              </div>
            </div>
          )}
          {state.notes && <div style={{ marginBottom: '12px' }}><p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Note</p><p style={{ color: '#475569', fontSize: '13px' }}>{state.notes}</p></div>}
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>Subtotal</span><span style={{ fontWeight: 500 }}>{fmt(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}><span>Discount</span><span style={{ fontWeight: 500 }}>-{fmt(totals.discount)}</span></div>}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>CGST ({state.tax.gstRate/2}%)</span><span style={{ fontWeight: 500 }}>{fmt(totals.cgst)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>SGST ({state.tax.gstRate/2}%)</span><span style={{ fontWeight: 500 }}>{fmt(totals.sgst)}</span></div></>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '12px', fontSize: '14px' }}><span>IGST ({state.tax.gstRate}%)</span><span style={{ fontWeight: 500 }}>{fmt(totals.igst)}</span></div>}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '16px' }}>Total Amount</span>
            <span style={{ fontWeight: 800, fontSize: '24px', color: brand }}>{fmt(totals.total)}</span>
          </div>
          {state.document.currency === 'INR' && totals.total > 0 && <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '8px' }}>{amountToWords(totals.total)}</p>}
        </div>
      </div>

      
    </div>
  );
}

