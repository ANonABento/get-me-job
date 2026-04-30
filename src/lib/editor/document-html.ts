import { escapeHtml } from "@/lib/html";
import type {
  CoverLetterTemplateStyles,
  TemplateStyles,
} from "@/lib/resume/template-types";
import { generateHTML } from "@tiptap/react";
import { resumeEditorExtensions } from "./extensions";
import { getResumeDocumentStyles } from "./styles";
import type { TipTapJSONContent } from "./types";

const EDITOR_PRINT_CLEANUP_STYLES = `
.resume-section-drag-handle {
  display: none !important;
}
`;

export function createEditorBodyHtml(content: TipTapJSONContent): string {
  return generateHTML(content, resumeEditorExtensions);
}

export function createPrintableEditorHtml(
  bodyHtml: string,
  templateStyles: TemplateStyles,
  title = "Resume"
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
${getResumeDocumentStyles(templateStyles)}
${EDITOR_PRINT_CLEANUP_STYLES}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export function createPrintableCoverLetterEditorHtml(
  bodyHtml: string,
  templateStyles: CoverLetterTemplateStyles,
  title = "Cover Letter"
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: white;
      color: #1f2937;
      font-family: ${templateStyles.fontFamily};
      font-size: ${templateStyles.fontSize};
      line-height: ${templateStyles.lineHeight};
      margin: 0 auto;
      max-width: 8.5in;
    }
    .cover-letter-document {
      color: #1f2937;
      font-family: ${templateStyles.fontFamily};
      font-size: ${templateStyles.fontSize};
      line-height: ${templateStyles.lineHeight};
      margin: 0 auto;
      max-width: 8.5in;
      min-height: 11in;
      padding: ${templateStyles.pagePadding};
    }
    .letter-page {
      margin: 0 auto;
      max-width: ${templateStyles.bodyMaxWidth};
    }
    h1 {
      color: ${templateStyles.accentColor};
      font-size: ${templateStyles.headerSize};
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 6px;
    }
    h2 {
      color: ${templateStyles.accentColor};
      font-size: ${templateStyles.headerSize};
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 12px;
      text-transform: none;
    }
    p {
      margin-bottom: ${templateStyles.paragraphSpacing};
    }
    p:last-child {
      margin-top: ${templateStyles.signatureSpacing};
    }
    ul {
      margin: 0 0 ${templateStyles.paragraphSpacing} 20px;
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
    }
  </style>
</head>
<body>
  <article class="cover-letter-document">
    <main class="letter-page">
${bodyHtml}
    </main>
  </article>
</body>
</html>`;
}
