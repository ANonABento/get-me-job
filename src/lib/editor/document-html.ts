import { escapeHtml } from "@/lib/html";
import type {
  CoverLetterTemplateStyles,
  TemplateStyles,
} from "@/lib/resume/template-types";
import { getCoverLetterDocumentStyles } from "@/lib/resume/cover-letter-styles";
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
${getCoverLetterDocumentStyles(templateStyles)}
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
