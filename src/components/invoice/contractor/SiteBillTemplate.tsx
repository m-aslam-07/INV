import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function SiteBillTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize); // Keeping standard size for compatibility, but scaling up locally
  const scale = state.style.fontSize === 'sm' ? 1.1 : state.style.fontSize === 'md' ? 1.2 : 1.3;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: `calc(${fontSize} * ${scale})`, color: '#000', backgroundColor: '#fff', border: '4px solid #000', padding: '16px' }} className="w-full font-bold">
      <div style={{ borderBottom: '4px solid #000', paddingBottom: '16px', marginBottom: '16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 }}>{getDocLabel(state.docType)}</h1>
        <p style={{ fontSize: '20px', marginTop: '8px' }}>NO: {state.document.number}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px', fontSize: '16px' }}>
          <span>DATE: {state.document.date}</span>
        </div>
      </div>

      <div style={{ borderBottom: '4px solid #000', paddingBottom: '16px', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', textTransform: 'uppercase', color: '#555' }}>CONTRACTOR:</p>
        <p style={{ fontSize: '24px', fontWeight: 900 }}>{state.business.name || 'YOUR NAME'}</p>
        <p style={{ fontSize: '16px' }}>{state.business.phone || '—'}</p>
      </div>

      <div style={{ borderBottom: '4px solid #000', paddingBottom: '16px', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', textTransform: 'uppercase', color: '#555' }}>SITE / CLIENT:</p>
        <p style={{ fontSize: '24px', fontWeight: 900 }}>{state.client.name || 'CLIENT NAME'}</p>
        <p style={{ fontSize: '16px' }}>{state.client.address || '—'}</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '4px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '18px' }}>DETAILS</th>
              <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '18px' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => item.type === 'heading' ? (
              <tr key={item.id}><td colSpan={2} style={{ padding: '12px 0', fontSize: '18px', backgroundColor: '#f0f0f0' }}>{item.description}</td></tr>
            ) : (
              <tr key={item.id} style={{ borderBottom: '2px solid #ccc' }}>
                <td style={{ padding: '12px 0' }}>
                  <p style={{ fontSize: '20px' }}>{item.description}</p>
                  <p style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>{item.quantity} {item.unit} × {fmt(item.rate)}</p>
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '24px' }}>{fmt(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ backgroundColor: '#f0f0f0', padding: '16px', border: '4px solid #000', marginBottom: '24px' }}>
        {totals.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', marginBottom: '8px' }}><span>DISCOUNT:</span><span>-{fmt(totals.discount)}</span></div>}
        {state.tax.gstEnabled && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', marginBottom: '8px' }}><span>GST ({state.tax.gstRate}%):</span><span>{fmt(state.tax.gstType === 'intra' ? totals.cgst + totals.sgst : totals.igst)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '4px solid #000', paddingTop: '8px' }}>
          <span style={{ fontSize: '24px', fontWeight: 900 }}>TOTAL TO PAY:</span>
          <span style={{ fontSize: '32px', fontWeight: 900 }}>{fmt(totals.total)}</span>
        </div>
      </div>

      {(state.payment.bankName || state.payment.upiId) && (
        <div style={{ border: '2px solid #000', padding: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '16px', textTransform: 'uppercase', marginBottom: '4px' }}>PAY TO:</p>
          {state.payment.upiId && <p style={{ fontSize: '20px' }}>UPI: {state.payment.upiId}</p>}
          {state.payment.accountNumber && <p style={{ fontSize: '16px' }}>A/C: {state.payment.accountNumber} ({state.payment.ifsc})</p>}
        </div>
      )}

      {state.notes && <div style={{ borderTop: '2px solid #000', paddingTop: '12px', fontSize: '14px' }}>{state.notes}</div>}
      
      
    </div>
  );
}

