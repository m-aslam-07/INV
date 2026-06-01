import { InvoiceHistoryBrowser } from './InvoiceHistoryBrowser';

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  return (
    <InvoiceHistoryBrowser compact onClose={onClose} />
  );
}
