import { escapeHtml } from "@/lib/html";
import type { TemplateStyles } from "@/lib/resume/template-types";
import { getResumeDocumentStyles } from "./styles";

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
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
