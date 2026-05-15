import type { InvoiceState } from '../../hooks/useInvoiceStore';
import { calcTotals, formatCurrency } from '../../utils/calculations';
import { amountToWords } from '../../utils/amountToWords';

export interface TemplateProps {
  state: InvoiceState;
  isPro: boolean;
}

export function getFontSize(size: 'sm' | 'md' | 'lg') {
  return { sm: '11px', md: '13px', lg: '14px' }[size];
}

export function getLineHeight(spacing: 'compact' | 'normal' | 'airy') {
  return { compact: 1.3, normal: 1.5, airy: 1.7 }[spacing];
}

export function getDocLabel(type: string) {
  return { invoice: 'INVOICE', proforma: 'PROFORMA INVOICE', proposal: 'PROPOSAL', receipt: 'RECEIPT' }[type] || 'INVOICE';
}

export { calcTotals, formatCurrency, amountToWords };

