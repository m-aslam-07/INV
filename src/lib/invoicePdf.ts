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

  // 3. Capture padding — must match the preview wrapper's p-8 (32px) so that
  //    templates using negative margins (e.g. -32px for full-bleed headers)
  //    don't extend outside the captured area and get clipped.
  const CAPTURE_PAD = 32; // px — matches preview's Tailwind p-8
  const CAPTURE_TOTAL_WIDTH = A4_WIDTH_PX + CAPTURE_PAD * 2; // 858px

  // 4. Create a clean off-screen host wide enough to hold clone + padding
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-20000px';
  host.style.top = '0';
  host.style.width = `${CAPTURE_TOTAL_WIDTH}px`;
  host.style.backgroundColor = '#ffffff';
  host.style.zIndex = '-9999';
  host.style.pointerEvents = 'none';
  host.style.overflow = 'visible';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  // 5. Style the clone: border-box keeps the inner content at A4_WIDTH_PX
  //    while the padding gives decorative borders/shadows breathing room.
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.boxSizing = 'border-box';
  clone.style.width = `${CAPTURE_TOTAL_WIDTH}px`;
  clone.style.minHeight = `${A4_HEIGHT_PX}px`;
  clone.style.margin = '0';
  clone.style.padding = `${CAPTURE_PAD}px`;
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

    // 8. Measure actual content dimensions (clone now includes padding)
    const contentWidth = clone.scrollWidth;
    const contentHeight = clone.scrollHeight;

    // 9. Capture at the padded width — never smaller than CAPTURE_TOTAL_WIDTH
    const captureWidth = Math.max(contentWidth, CAPTURE_TOTAL_WIDTH);
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

    // 12. PDF layout — the captured image already contains 32px (~8.5mm) of
    //     whitespace padding on all sides. We add a small page margin (5mm)
    //     for printer safety. Total effective margin ≈ 13.5mm per side.
    const PAGE_MARGIN = 5; // mm — small printer-safe margin
    const usableWidth = A4_WIDTH_MM - PAGE_MARGIN * 2;   // 200mm
    const usableHeight = A4_HEIGHT_MM - PAGE_MARGIN * 2; // 287mm

    // Scale image to fit within the usable width, preserving aspect ratio
    const imgAspect = canvas.height / canvas.width;
    const pdfImgWidth = usableWidth;
    const pdfImgHeight = pdfImgWidth * imgAspect;

    // 13. Create PDF and slice into pages
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    if (pdfImgHeight <= usableHeight) {
      // Single page — content fits within margins
      pdf.addImage(imgData, 'PNG', PAGE_MARGIN, PAGE_MARGIN, pdfImgWidth, pdfImgHeight);
    } else {
      // Multi-page — slice the image across pages, respecting margins
      const totalPages = Math.ceil(pdfImgHeight / usableHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // Place the full image at a negative Y offset so each page
        // shows the correct slice, shifted down by the top margin
        const yOffset = PAGE_MARGIN - page * usableHeight;
        pdf.addImage(imgData, 'PNG', PAGE_MARGIN, yOffset, pdfImgWidth, pdfImgHeight);
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
