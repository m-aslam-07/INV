import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function RunningBillTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Arial', sans-serif", fontSize, lineHeight, color: '#000' }} className="w-full">
      <div style={{ border: '2px solid #000', padding: '16px', marginBottom: '16px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>{state.business.name || 'Contractor Name'}</h1>
        <p style={{ fontSize: '12px' }}>{[state.business.address1, state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>
        <p style={{ fontSize: '12px' }}>Ph: {state.business.phone} | Email: {state.business.email}</p>
        {state.business.gstin && <p style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>GSTIN: {state.business.gstin}</p>}
      </div>

      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', borderTop: '2px solid #000', padding: '8px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>{getDocLabel(state.docType)}</h2>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '16px', fontSize: '12px' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 10px', width: '15%', fontWeight: 700 }}>Client Name:</td>
            <td style={{ border: '1px solid #000', padding: '6px 10px', width: '35%' }}>{state.client.name || '—'}</td>
            <td style={{ border: '1px solid #000', padding: '6px 10px', width: '15%', fontWeight: 700 }}>Bill No:</td>
            <td style={{ border: '1px solid #000', padding: '6px 10px', width: '35%' }}>{state.document.number}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 700, verticalAlign: 'top' }}>Site Address:</td>
            <td style={{ border: '1px solid #000', padding: '6px 10px', verticalAlign: 'top' }}>{[state.client.address, state.client.state].filter(Boolean).join(', ') || '—'}</td>
            <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 700, verticalAlign: 'top' }}>Date:<br/><br/>Due Date:</td>
            <td style={{ border: '1px solid #000', padding: '6px 10px', verticalAlign: 'top' }}>{state.document.date}<br/><br/>{state.document.dueDate}</td>
          </tr>
          {state.client.gstin && (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 700 }}>Client GSTIN:</td>
              <td style={{ border: '1px solid #000', padding: '6px 10px' }}>{state.client.gstin}</td>
              <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 700 }}>State:</td>
              <td style={{ border: '1px solid #000', padding: '6px 10px' }}>{state.client.state || '—'}</td>
            </tr>
          )}
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '16px', fontSize }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            {['S.No', 'Description of Work', 'Qty', 'Unit', 'Rate', 'Amount'].map((h, i) => (
              <th key={h} style={{ border: '1px solid #000', padding: '8px', textAlign: i<2 ? 'left' : 'right', fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={6} style={{ border: '1px solid #000', padding: '8px', fontWeight: 700, backgroundColor: '#f9fafb' }}>{item.description}</td></tr>
          ) : (
            <tr key={item.id}>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{item.description}</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{item.unit}</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{fmt(item.rate)}</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={6} style={{ border: '1px solid #000', padding: '24px', textAlign: 'center' }}>No works listed</td></tr>}
          
          {/* Running totals rows integrated into table */}
          <tr>
            <td colSpan={4} rowSpan={state.tax.gstEnabled ? 4 : 2} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ fontWeight: 700, marginBottom: '4px' }}>Amount in Words:</p>
              <p>{amountToWords(totals.total)}</p>
            </td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>Subtotal</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(totals.subtotal)}</td>
          </tr>
          {totals.discount > 0 && (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>Discount</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>-{fmt(totals.discount)}</td>
            </tr>
          )}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>CGST ({state.tax.gstRate/2}%)</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{fmt(totals.cgst)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>SGST ({state.tax.gstRate/2}%)</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{fmt(totals.sgst)}</td>
            </tr>
          </>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, textAlign: 'right' }}>IGST ({state.tax.gstRate}%)</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>{fmt(totals.igst)}</td>
            </tr>
          )}
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <td colSpan={4} style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 800, textAlign: 'right', fontSize: '14px' }}>GRAND TOTAL</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 800, fontSize: '14px' }}>{fmt(totals.total)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px', fontSize: '12px' }}>
        <div style={{ border: '1px solid #000', padding: '12px' }}>
          <p style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: '8px' }}>Payment Details:</p>
          {(state.payment.bankName || state.payment.upiId) ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {state.payment.bankName && <p>Bank Name: {state.payment.bankName}</p>}
              {state.payment.accountHolder && <p>A/C Name: {state.payment.accountHolder}</p>}
              {state.payment.accountNumber && <p>A/C No: {state.payment.accountNumber}</p>}
              {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
              {state.payment.upiId && <p>UPI ID: {state.payment.upiId}</p>}
            </div>
          ) : <p>No payment details provided.</p>}
        </div>
        <div style={{ border: '1px solid #000', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 700, textAlign: 'center' }}>For {state.business.name}</p>
          <div style={{ height: '60px' }}></div>
          <p style={{ textAlign: 'center', borderTop: '1px solid #000', paddingTop: '4px' }}>Authorized Signatory</p>
        </div>
      </div>

      {(state.notes || state.terms) && (
        <div style={{ border: '1px solid #000', padding: '12px', fontSize: '11px' }}>
          {state.notes && <div style={{ marginBottom: state.terms ? '8px' : '0' }}><span style={{ fontWeight: 700 }}>Notes: </span>{state.notes}</div>}
          {state.terms && <div><span style={{ fontWeight: 700 }}>Terms: </span>{state.terms}</div>}
        </div>
      )}
      
    </div>
  );
}

