import type { InvoiceState } from '../hooks/useInvoiceStore';

export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  const currencyMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  };
  return new Intl.NumberFormat(currencyMap[currency] || 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatINR(amount: number): string {
  return formatCurrency(amount, 'INR');
}

export interface TotalBreakdown {
  subtotal: number;
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstAmount: number;
  total: number;
}

export function calcTotals(state: InvoiceState): TotalBreakdown {
  const subtotal = state.items
    .filter(i => i.type === 'item')
    .reduce((s, i) => s + i.quantity * i.rate, 0);

  const discount = state.tax.discountEnabled
    ? state.tax.discountType === 'percent'
      ? subtotal * state.tax.discountValue / 100
      : state.tax.discountValue
    : 0;

  const taxable = subtotal - discount;

  const gstAmount = state.tax.gstEnabled ? taxable * state.tax.gstRate / 100 : 0;
  const cgst = state.tax.gstType === 'intra' ? gstAmount / 2 : 0;
  const sgst = state.tax.gstType === 'intra' ? gstAmount / 2 : 0;
  const igst = state.tax.gstType === 'inter' ? gstAmount : 0;

  const total = taxable + gstAmount;

  return { subtotal, discount, taxable, cgst, sgst, igst, gstAmount, total };
}

export function detectGSTType(bizState: string, clientState: string): 'intra' | 'inter' {
  if (!bizState || !clientState) return 'intra';
  return bizState.toLowerCase().trim() === clientState.toLowerCase().trim() ? 'intra' : 'inter';
}
