import React from 'react';
import { createRoot } from 'react-dom/client';
import { resolveTemplate } from '../components/invoice/templateRegistry';
import type { InvoiceState } from '../hooks/useInvoiceStore';

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24);
}

export function buildInvoiceFilename(state: InvoiceState, suffix = '.pdf'): string {
  const parts = [
    state.document.number,
    state.client.name,
    state.document.date,
  ].filter(Boolean).map(sanitizeFilenamePart).filter(Boolean);

  return `${parts.join('_') || 'invoice'}${suffix}`;
}

async function renderPdfFromTarget(target: HTMLElement, fileName: string): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: target.scrollWidth || 794,
    height: target.scrollHeight || 1123,
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const imgData = canvas.toDataURL('image/jpeg', 0.97);
  const pageW = 210;
  const pageH = 297;
  const imgH = (canvas.height * pageW) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH);
  let leftHeight = imgH - pageH;
  while (leftHeight > 0) {
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -(imgH - leftHeight), pageW, imgH);
    leftHeight -= pageH;
  }

  pdf.save(fileName);
}

export async function downloadInvoicePdfFromElement(target: HTMLElement, fileName: string): Promise<void> {
  await renderPdfFromTarget(target, fileName);
}

export async function downloadInvoicePdfFromState(state: InvoiceState, fileName: string): Promise<void> {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = '794px';
  host.style.pointerEvents = 'none';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  const root = createRoot(host);
  const Template = resolveTemplate(state.style.template);

  try {
    root.render(
      React.createElement(
        'div',
        { id: 'invoice-pdf-target', style: { width: '794px', minHeight: '1123px', background: '#fff' } },
        React.createElement(React.Suspense, {
          fallback: React.createElement('div', { style: { padding: 24 } }, 'Generating PDF...'),
        }, React.createElement(Template, { state, isPro: true }))
      )
    );

    await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    const target = host.querySelector('#invoice-pdf-target') as HTMLElement | null;
    if (!target) throw new Error('Failed to render invoice preview for PDF download');

    await renderPdfFromTarget(target, fileName);
  } finally {
    root.unmount();
    host.remove();
  }
}
