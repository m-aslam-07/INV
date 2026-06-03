import React from 'react';
import { createRoot } from 'react-dom/client';
import { resolveTemplate } from '../components/invoice/templateRegistry';
import type { InvoiceState } from '../hooks/useInvoiceStore';

/* ── Helpers ────────────────────────────────────────────────── */

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

/* ── Constants ──────────────────────────────────────────────── */

/** A4 at 96 DPI (CSS px) */
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

/** A4 in mm (for jsPDF) */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** html2canvas render scale — 3 gives crisp text for print */
const CAPTURE_SCALE = 3;

/* ── Wait utilities ─────────────────────────────────────────── */

/** Wait for every <img> inside `root` to finish loading */
function waitForImages(root: HTMLElement): Promise<void[]> {
  const imgs = Array.from(root.querySelectorAll('img'));
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // don't block PDF on broken images
          }
        }),
    ),
  );
}

/** Poll until no Suspense fallback text is found (max ~5 s) */
function waitForSuspense(root: HTMLElement, maxMs = 5000): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + maxMs;
    function check() {
      // Suspense fallback renders "Loading Template..." or "Generating PDF..."
      if (
        !root.textContent?.includes('Loading Template') &&
        !root.textContent?.includes('Generating PDF')
      ) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        resolve(); // timeout — proceed anyway
        return;
      }
      requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
  });
}

/* ── Core PDF renderer ──────────────────────────────────────── */

async function renderPdfFromTarget(
  source: HTMLElement,
  fileName: string,
): Promise<void> {
  // 1. Dynamically import heavy libs
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // 2. Deep-clone the source so we don't mutate the live preview
  const clone = source.cloneNode(true) as HTMLElement;

  // 3. Create a clean off-screen host at exact A4 width
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-20000px';
  host.style.top = '0';
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.backgroundColor = '#ffffff';
  host.style.zIndex = '-9999';
  host.style.pointerEvents = 'none';
  host.style.overflow = 'visible';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  // 4. Strip any transforms, padding, zoom artifacts from the clone
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.minHeight = `${A4_HEIGHT_PX}px`;
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.overflow = 'visible';
  clone.style.backgroundColor = '#ffffff';

  // Remove id to avoid DOM id conflicts
  clone.removeAttribute('id');

  host.appendChild(clone);

  try {
    // 5. Wait for fonts to be ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 6. Wait for all images inside the clone to load
    await waitForImages(clone);

    // 7. Small settling delay for layout
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // 8. Measure actual content height
    const contentWidth = clone.scrollWidth;
    const contentHeight = clone.scrollHeight;

    // 9. If content is wider than A4, we'll let html2canvas capture at natural width
    //    and then scale it down to fit A4 in the PDF
    const captureWidth = Math.max(contentWidth, A4_WIDTH_PX);
    const captureHeight = Math.max(contentHeight, A4_HEIGHT_PX);

    // 10. Capture with html2canvas — high scale, PNG (no compression artifacts)
    const canvas = await html2canvas(clone, {
      scale: CAPTURE_SCALE,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: captureWidth,
      height: captureHeight,
      // Ensure we capture the full content without clipping
      scrollX: 0,
      scrollY: 0,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
    });

    // 11. Convert to PNG data URL (lossless — no text artifacts)
    const imgData = canvas.toDataURL('image/png');

    // 12. Calculate PDF dimensions
    //     Scale image to fit A4 width exactly
    const imgAspect = canvas.height / canvas.width;
    const pdfImgWidth = A4_WIDTH_MM;
    const pdfImgHeight = pdfImgWidth * imgAspect;

    // 13. Create PDF and slice into pages
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    if (pdfImgHeight <= A4_HEIGHT_MM) {
      // Single page — content fits
      pdf.addImage(imgData, 'PNG', 0, 0, pdfImgWidth, pdfImgHeight);
    } else {
      // Multi-page — slice the image across pages
      const totalPages = Math.ceil(pdfImgHeight / A4_HEIGHT_MM);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // The trick: we place the full image at a negative Y offset
        // so that each page shows the correct slice
        const yOffset = -(page * A4_HEIGHT_MM);
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfImgWidth, pdfImgHeight);
      }
    }

    pdf.save(fileName);
  } finally {
    // 14. Cleanup
    host.remove();
  }
}

/* ── Public API: capture from live preview element ──────────── */

export async function downloadInvoicePdfFromElement(
  target: HTMLElement,
  fileName: string,
): Promise<void> {
  await renderPdfFromTarget(target, fileName);
}

/* ── Public API: render from state (history re-download) ───── */

export async function downloadInvoicePdfFromState(
  state: InvoiceState,
  fileName: string,
): Promise<void> {
  // 1. Create off-screen host
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-20000px';
  host.style.top = '0';
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-9999';
  host.style.overflow = 'visible';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  const root = createRoot(host);
  const Template = resolveTemplate(state.style.template);

  try {
    // 2. Render template into the host
    root.render(
      React.createElement(
        'div',
        {
          id: 'invoice-pdf-offscreen',
          style: {
            width: `${A4_WIDTH_PX}px`,
            minHeight: `${A4_HEIGHT_PX}px`,
            background: '#fff',
            overflow: 'visible',
            padding: 0,
            margin: 0,
          },
        },
        React.createElement(
          React.Suspense,
          {
            fallback: React.createElement(
              'div',
              { style: { padding: 24 } },
              'Generating PDF...',
            ),
          },
          React.createElement(Template, { state, isPro: true }),
        ),
      ),
    );

    // 3. Wait for Suspense to resolve (lazy-loaded templates)
    const offscreenTarget = await new Promise<HTMLElement>((resolve, reject) => {
      const deadline = Date.now() + 8000;
      function poll() {
        const el = host.querySelector('#invoice-pdf-offscreen') as HTMLElement | null;
        if (el) {
          resolve(el);
          return;
        }
        if (Date.now() > deadline) {
          reject(new Error('Failed to render invoice for PDF'));
          return;
        }
        requestAnimationFrame(poll);
      }
      requestAnimationFrame(poll);
    });

    // 4. Wait for Suspense fallback to clear
    await waitForSuspense(offscreenTarget);

    // 5. Wait for fonts
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 6. Load the Google Font if needed
    const fontFamily = state.style?.fontFamily;
    if (fontFamily && fontFamily !== 'Inter') {
      // Check if font link already exists
      const existingLink = document.querySelector(
        `link[href*="${fontFamily.replace(/ /g, '+')}"]`,
      );
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      // Give font time to load
      await new Promise((r) => setTimeout(r, 500));
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    }

    // 7. Wait for images
    await waitForImages(offscreenTarget);

    // 8. Settling delay
    await new Promise((r) => setTimeout(r, 200));

    // 9. Render PDF from the off-screen element
    await renderPdfFromTarget(offscreenTarget, fileName);
  } finally {
    root.unmount();
    host.remove();
  }
}
