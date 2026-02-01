// PDF export utilities using browser print functionality
// This approach works universally without heavy dependencies like puppeteer

export interface PDFExportOptions {
  paperSize?: "letter" | "a4";
  orientation?: "portrait" | "landscape";
}

/**
 * Opens resume HTML in a new window and triggers print dialog
 * Users can select "Save as PDF" in the print dialog
 */
export function printResume(htmlUrl: string): void {
  const printWindow = window.open(htmlUrl, "_blank");
  if (printWindow) {
    printWindow.addEventListener("load", () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    });
  }
}

/**
 * Creates a blob URL from HTML content for printing
 */
export function createPrintableBlob(htmlContent: string): string {
  const blob = new Blob([htmlContent], { type: "text/html" });
  return URL.createObjectURL(blob);
}

/**
 * Enhanced print CSS for better PDF output
 */
export const PRINT_STYLES = `
@media print {
  @page {
    size: letter;
    margin: 0.5in;
  }

  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    font-size: 11pt;
    line-height: 1.4;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }

  .experience-item, .education-item {
    page-break-inside: avoid;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Hide any navigation or UI elements */
  .no-print {
    display: none !important;
  }
}
`;

/**
 * Injects print button into resume HTML
 */
export function injectPrintButton(html: string): string {
  const buttonHtml = `
<div class="no-print" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">
  <button
    onclick="window.print()"
    style="
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    "
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Download PDF
  </button>
</div>`;

  // Insert button after <body> tag
  return html.replace("<body>", `<body>${buttonHtml}`);
}
