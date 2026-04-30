import type { CoverLetterTemplateStyles } from "./template-types";

export function getCoverLetterDocumentStyles(
  styles: CoverLetterTemplateStyles,
): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: white;
      color: #1f2937;
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      margin: 0 auto;
      max-width: 8.5in;
    }
    .cover-letter-document {
      color: #1f2937;
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      margin: 0 auto;
      max-width: 8.5in;
      min-height: 11in;
      padding: ${styles.pagePadding};
    }
    .letter-page {
      margin: 0 auto;
      max-width: ${styles.bodyMaxWidth};
    }
    h1 {
      color: ${styles.accentColor};
      font-size: ${styles.headerSize};
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 6px;
    }
    h2 {
      color: ${styles.accentColor};
      font-size: ${styles.headerSize};
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 12px;
      text-transform: none;
    }
    p {
      margin-bottom: ${styles.paragraphSpacing};
    }
    p:last-child {
      margin-top: ${styles.signatureSpacing};
    }
    ul {
      margin: 0 0 ${styles.paragraphSpacing} 20px;
    }
    li {
      margin-bottom: 4px;
    }
    @media print {
      @page {
        size: letter;
        margin: 0.6in;
      }
      body {
        padding: 0;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .cover-letter-document {
        min-height: auto;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  `.trim();
}
