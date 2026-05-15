import LZString from 'lz-string';
import type { InvoiceState } from '../hooks/useInvoiceStore';

export function generateShareLink(state: InvoiceState): string {
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
  return `${window.location.origin}/app#${compressed}`;
}

export function loadFromHash(): InvoiceState | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as InvoiceState;
  } catch {
    return null;
  }
}
