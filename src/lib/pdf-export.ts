import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface ExportPdfOptions {
  containerElement: HTMLElement;
  filename: string;
  onProgress?: (message: string) => void;
}

/**
 * Downscales an image blob to a maximum width/height (1400px) and converts to JPEG data URL.
 * This keeps the payload small (< 200KB per image vs 10MB+) while preserving 300 DPI print quality.
 */
async function compressAndEncodeImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const maxDim = 1400;
        let { naturalWidth: width, naturalHeight: height } = img;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = src;
  });
}

/**
 * Converts all blob: URLs inside an element's img tags to base64 data URLs
 * so they can be processed by server-side Puppeteer or offline generators.
 */
async function inlineBlobImages(container: HTMLElement): Promise<HTMLElement> {
  const clone = container.cloneNode(true) as HTMLElement;
  const images = Array.from(clone.querySelectorAll('img')) as HTMLImageElement[];

  for (const img of images) {
    const currentSrc = img.getAttribute('src') || img.src;

    if (currentSrc && currentSrc.startsWith('blob:')) {
      try {
        // Attempt fast canvas compression first to avoid massive payloads
        const compressedDataUrl = await compressAndEncodeImage(currentSrc);
        img.src = compressedDataUrl;
        img.setAttribute('src', compressedDataUrl);
      } catch {
        // Fallback: direct blob read via FileReader
        try {
          const response = await fetch(currentSrc);
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          img.src = dataUrl;
          img.setAttribute('src', dataUrl);
        } catch (err) {
          console.warn('Failed to inline blob image for PDF:', err);
        }
      }
    } else if (img.src && !img.src.startsWith('data:')) {
      // Ensure relative paths (/assets/...) are fully qualified with origin
      try {
        const absoluteUrl = new URL(img.src, window.location.origin).href;
        img.setAttribute('src', absoluteUrl);
      } catch {
        img.setAttribute('src', img.src);
      }
    }
  }

  return clone;
}

/**
 * Collects all active CSS stylesheets and inline style tags from the current document,
 * fully inlining parsed CSS rules to prevent 403 Forbidden or CORS errors during headless PDF rendering.
 */
function collectDocumentStyles(): string {
  let inlinedStyles = '';

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      inlinedStyles += rules.map(r => r.cssText).join('\n') + '\n';
    } catch {
      if (sheet.href) {
        inlinedStyles += `@import url("${sheet.href}");\n`;
      }
    }
  }

  const styleTags = Array.from(document.querySelectorAll('style'));
  const extraStyles = styleTags.map(s => s.innerHTML).join('\n');

  return `<style>\n${inlinedStyles}\n${extraStyles}\n</style>`;
}

/**
 * Triggers a direct browser file download from a Blob across desktop and mobile.
 */
function downloadBlob(blob: Blob, filename: string) {
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeName;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();

  // Generous timeout to allow mobile browsers to finish saving
  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 10000);
}

/**
 * Client-side fallback generator using html-to-image + jsPDF.
 */
async function generatePdfClientSide(
  container: HTMLElement,
  filename: string,
  onProgress?: (msg: string) => void
): Promise<void> {
  const pages = Array.from(container.querySelectorAll('.a4-print-page')) as HTMLElement[];
  if (pages.length === 0) {
    throw new Error('No printable A4 pages found in container');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (onProgress) {
      onProgress(`Rendering page ${i + 1} of ${pages.length}...`);
    }

    try {
      const imgData = await toPng(page, {
        quality: 0.95,
        pixelRatio: 2,
        width: 794,
        height: 1123,
        skipAutoScale: true,
        cacheBust: true,
      });

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // A4 dimensions in mm: 210 x 297
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    } catch (pageErr) {
      console.warn(`Failed to render page ${i + 1} with high fidelity:`, pageErr);
      // If a page failed due to an external image CORS, attempt fallback without cachebust
      const imgData = await toPng(page, {
        quality: 0.90,
        pixelRatio: 1.5,
      });
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    }
  }

  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(safeName);
}

/**
 * Downloads the exact preview of the inspection report as an A4 PDF file directly,
 * with zero print preview dialogs.
 * Uses headless Puppeteer API first, with automatic client-side jsPDF fallback.
 */
export async function downloadReportAsPdf({
  containerElement,
  filename,
  onProgress,
}: ExportPdfOptions): Promise<void> {
  if (!containerElement) {
    throw new Error('Report container element is missing');
  }

  if (onProgress) {
    onProgress('Preparing report pages...');
  }

  // 1. Inline all temporary session blob images so external processes can load them
  const clonedElement = await inlineBlobImages(containerElement);
  const styles = collectDocumentStyles();
  const html = clonedElement.innerHTML;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // 2. Attempt high-fidelity headless Puppeteer PDF generation
  try {
    if (onProgress) {
      onProgress('Generating PDF document...');
    }

    const response = await fetch('/api/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        styles,
        filename,
        baseUrl,
      }),
    });

    if (response.ok && response.headers.get('content-type')?.includes('application/pdf')) {
      const blob = await response.blob();
      downloadBlob(blob, filename);
      return;
    }

    console.warn('Server PDF generation returned non-OK status. Falling back to client-side generator.');
  } catch (serverErr) {
    console.warn('Server PDF generation failed. Falling back to client-side generator.', serverErr);
  }

  // 3. Fallback to client-side jsPDF + html-to-image
  if (onProgress) {
    onProgress('Compiling client-side PDF...');
  }
  await generatePdfClientSide(containerElement, filename, onProgress);
}
