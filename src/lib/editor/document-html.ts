import { escapeHtml } from "@/lib/html";
import type { TemplateStyles } from "@/lib/resume/template-types";
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
