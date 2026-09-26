import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer-core';
import fs from 'node:fs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Known executable paths across OSes
function getCandidatePaths(): string[] {
  const paths: (string | undefined)[] = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    // Windows Google Chrome
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : undefined,
    // Windows Microsoft Edge
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  return paths.filter((p): p is string => Boolean(p && fs.existsSync(/*turbopackIgnore: true*/ p)));
}

function getBrowserExecutablePath(): string | null {
  const candidates = getCandidatePaths();
  return candidates[0] || null;
}

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    const executablePath = getBrowserExecutablePath();
    if (!executablePath) {
      return NextResponse.json(
        { error: 'No suitable Chrome or Edge browser executable found on the server' },
        { status: 500 }
      );
    }

    const { html, styles = '', filename = 'Inspection_Report', baseUrl } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
    }

    // Wrap the provided HTML in a full standalone A4 print template with web fonts and vector CSS
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${baseUrl ? `<base href="${baseUrl}/" />` : ''}
  <title>${filename}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  ${styles}
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #1E1035 !important;
      width: 210mm !important;
      font-family: var(--font-geist-sans), "Familjen Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: visible !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    svg {
      shape-rendering: geometricPrecision;
    }
    svg text {
      text-rendering: geometricPrecision;
    }
    /* Neutralize outer flex gaps and padding for exact page slicing without distorting inner items */
    body > div,
    div:has(> .a4-print-page) {
      gap: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 210mm !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
    }
    .a4-print-page {
      width: 210mm !important;
      max-width: 210mm !important;
      min-width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      margin: 0 !important;
      padding: 24px 32px !important;
      overflow: hidden !important;
      position: relative !important;
      box-sizing: border-box !important;
      background: #ffffff !important;
    }
    .a4-print-page-cover,
    .a4-print-page-back,
    #print-page-1,
    #preview-page-1 {
      padding: 0 !important;
    }
    .a4-print-page:last-child,
    .a4-print-page:last-of-type {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--font-render-hinting=medium',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    await page.emulateMediaType('print');

    // Load content into headless browser
    await page.setContent(fullHtml, {
      waitUntil: ['load', 'domcontentloaded'],
      timeout: 30000,
    });

    // Wait for fonts & images to finish loading with a sensible timeout
    await Promise.race([
      page.evaluate(async () => {
        try {
          if (document.fonts) {
            await document.fonts.ready;
          }
          const imgs = Array.from(document.querySelectorAll('img'));
          await Promise.all(
            imgs.map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            })
          );
        } catch {
          // Continue if evaluation fails
        }
      }),
      new Promise(resolve => setTimeout(resolve, 8000)),
    ]);

    // Generate high-fidelity vector A4 PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });

    const asciiFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Inspection_Report';
    const encodedFilename = encodeURIComponent(filename);

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asciiFilename}.pdf"; filename*=UTF-8''${encodedFilename}.pdf`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Puppeteer PDF generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        const closePromise = browser.close();
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
        await Promise.race([closePromise, timeoutPromise]);
        if (browser.process() && !browser.process()?.killed) {
          browser.process()?.kill('SIGKILL');
        }
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
}
