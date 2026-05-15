import { getFontSize, getLineHeight, getDocLabel, calcTotals, formatCurrency, amountToWords, type TemplateProps } from '../templateUtils';

export default function LedgerTemplate({ state, isPro }: TemplateProps) {
  const totals = calcTotals(state);
  const fmt = (n: number) => formatCurrency(n, state.document.currency);
  const fontSize = getFontSize(state.style.fontSize);
  const lineHeight = getLineHeight(state.style.spacing);

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", fontSize, lineHeight, color: '#000', border: '1px solid #000', padding: '24px' }} className="w-full">
      <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '16px', marginBottom: '16px' }}>
        {state.business.logoUrl && <img src={state.business.logoUrl} alt="Logo" style={{ height: '48px', margin: '0 auto 12px', objectFit: 'contain' }} />}
        <h1 style={{ fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{state.business.name || 'FIRM NAME'}</h1>
        <p style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>Chartered Accountants</p>
        <p style={{ fontSize: '12px', marginTop: '4px' }}>{[state.business.address1, state.business.city, state.business.state, state.business.pin].filter(Boolean).join(', ')}</p>
        <p style={{ fontSize: '12px' }}>Email: {state.business.email} | Ph: {state.business.phone}</p>
        {(state.business.gstin || state.business.pan) && (
          <p style={{ fontSize: '12px', marginTop: '4px', fontWeight: 700 }}>
            {state.business.gstin && `GSTIN: ${state.business.gstin}`}
            {state.business.gstin && state.business.pan && ' | '}
            {state.business.pan && `PAN: ${state.business.pan}`}
          </p>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px' }}>{getDocLabel(state.docType)}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '24px', fontSize: '13px' }}>
        <div>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>To,</p>
          <p style={{ fontWeight: 700 }}>{state.client.name || 'Client Name'}</p>
          {state.client.address && <p>{state.client.address}</p>}
          {state.client.state && <p>{state.client.state}</p>}
          {state.client.gstin && <p style={{ marginTop: '4px', fontWeight: 700 }}>GSTIN: {state.client.gstin}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p><span style={{ fontWeight: 700 }}>Invoice No:</span> {state.document.number}</p>
          <p><span style={{ fontWeight: 700 }}>Date:</span> {state.document.date}</p>
          <p><span style={{ fontWeight: 700 }}>Due Date:</span> {state.document.dueDate}</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '2px solid #000', borderBottom: '2px solid #000', marginBottom: '16px', fontSize }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ borderRight: '1px solid #000', padding: '8px', width: '50px' }}>S.No.</th>
            <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'left' }}>Particulars of Professional Services rendered</th>
            <th style={{ padding: '8px', textAlign: 'right', width: '120px' }}>Amount ({state.document.currency})</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((item, idx) => item.type === 'heading' ? (
            <tr key={item.id}><td colSpan={3} style={{ borderBottom: '1px solid #ccc', padding: '8px', fontWeight: 700, fontStyle: 'italic', textAlign: 'center' }}>{item.description}</td></tr>
          ) : (
            <tr key={item.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ borderRight: '1px solid #000', padding: '8px' }}>
                {item.description}
                {item.quantity > 1 && <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>({item.quantity} {item.unit} @ {fmt(item.rate)})</div>}
              </td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
          {state.items.length === 0 && <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center' }}>No particulars provided</td></tr>}
          
          <tr style={{ borderTop: '2px solid #000' }}>
            <td colSpan={2} style={{ borderRight: '1px solid #000', padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>Professional Fees:</td>
            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{fmt(totals.subtotal)}</td>
          </tr>
          {totals.discount > 0 && (
            <tr>
              <td colSpan={2} style={{ borderRight: '1px solid #000', padding: '6px 8px', textAlign: 'right', fontStyle: 'italic' }}>Less: Discount:</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>-{fmt(totals.discount)}</td>
            </tr>
          )}
          {state.tax.gstEnabled && state.tax.gstType === 'intra' && (<>
            <tr>
              <td colSpan={2} style={{ borderRight: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>Add: CGST @ {state.tax.gstRate/2}%:</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(totals.cgst)}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ borderRight: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>Add: SGST @ {state.tax.gstRate/2}%:</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(totals.sgst)}</td>
            </tr>
          </>)}
          {state.tax.gstEnabled && state.tax.gstType === 'inter' && (
            <tr>
              <td colSpan={2} style={{ borderRight: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>Add: IGST @ {state.tax.gstRate}%:</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(totals.igst)}</td>
            </tr>
          )}
          <tr style={{ borderTop: '3px double #000', borderBottom: '3px double #000' }}>
            <td colSpan={2} style={{ borderRight: '1px solid #000', padding: '10px 8px', textAlign: 'right', fontWeight: 700 }}>TOTAL AMOUNT PAYABLE:</td>
            <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, fontSize: '16px' }}>{fmt(totals.total)}</td>
          </tr>
        </tbody>
      </table>

      {state.document.currency === 'INR' && totals.total > 0 && (
        <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '24px' }}>Amount in words: Rupees {amountToWords(totals.total)}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <div style={{ width: '50%' }}>
          {(state.payment.bankName || state.payment.upiId) && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: '4px' }}>Bank Account Details:</p>
              {state.payment.accountHolder && <p>Name: {state.payment.accountHolder}</p>}
              {state.payment.bankName && <p>Bank: {state.payment.bankName}</p>}
              {state.payment.accountNumber && <p>A/C No.: {state.payment.accountNumber}</p>}
              {state.payment.ifsc && <p>IFSC: {state.payment.ifsc}</p>}
              {state.payment.upiId && <p>UPI: {state.payment.upiId}</p>}
            </div>
          )}
          {state.notes && <p style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700 }}>Notes: </span>{state.notes}</p>}
          {state.terms && <p><span style={{ fontWeight: 700 }}>Terms: </span>{state.terms}</p>}
        </div>
        <div style={{ width: '40%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <p style={{ fontWeight: 700, marginBottom: '60px' }}>For {state.business.name}</p>
          <p style={{ borderTop: '1px solid #000', paddingTop: '4px' }}>Authorized Signatory</p>
        </div>
      </div>

      
    </div>
  );
}

