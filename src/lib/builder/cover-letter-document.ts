import { escapeHtml } from "@/lib/html";

export interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  styles: {
    fontFamily: string;
    accentColor: string;
    headerAlign: "left" | "center";
    paragraphSpacing: string;
    bodyMaxWidth: string;
  };
}

export interface CoverLetterDocument {
  opening: string;
  body: string;
  closing: string;
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "formal",
    name: "Formal",
    description: "Traditional business letter with a grounded serif style.",
    styles: {
      fontFamily: "Georgia, serif",
      accentColor: "#1f2937",
      headerAlign: "left",
      paragraphSpacing: "14px",
      bodyMaxWidth: "7.1in",
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean centered header with direct, compact spacing.",
    styles: {
      fontFamily: "Arial, sans-serif",
      accentColor: "#2563eb",
      headerAlign: "center",
      paragraphSpacing: "12px",
      bodyMaxWidth: "7in",
    },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Warm letter layout with a distinctive accent.",
    styles: {
      fontFamily: "Avenir, Montserrat, Arial, sans-serif",
      accentColor: "#be123c",
      headerAlign: "left",
      paragraphSpacing: "15px",
      bodyMaxWidth: "7.25in",
    },
  },
];

export function getCoverLetterTemplate(templateId: string): CoverLetterTemplate {
  return (
    COVER_LETTER_TEMPLATES.find((template) => template.id === templateId) ??
    COVER_LETTER_TEMPLATES[0]
  );
}

export function splitCoverLetterParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

export function createBlankCoverLetterDocument(): CoverLetterDocument {
  return {
    opening: "",
    body: "",
    closing: "",
  };
}

export function coverLetterContentToDocument(
  content: string
): CoverLetterDocument {
  const paragraphs = splitCoverLetterParagraphs(content);

  if (paragraphs.length === 0) {
    return createBlankCoverLetterDocument();
  }

  if (paragraphs.length === 1) {
    return {
      opening: paragraphs[0],
      body: "",
      closing: "",
    };
  }

  if (paragraphs.length === 2) {
    return {
      opening: paragraphs[0],
      body: "",
      closing: paragraphs[1],
    };
  }

  return {
    opening: paragraphs[0],
    body: paragraphs.slice(1, -1).join("\n\n"),
    closing: paragraphs[paragraphs.length - 1],
  };
}

export function composeCoverLetterContent(
  document: CoverLetterDocument
): string {
  return [document.opening, document.body, document.closing]
    .map((section) => section.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function generateCoverLetterHTML({
  content,
  templateId = "formal",
  candidateName = "Your Name",
  jobTitle,
  company,
}: {
  content: string;
  templateId?: string;
  candidateName?: string;
  jobTitle?: string;
  company?: string;
}): string {
  const template = getCoverLetterTemplate(templateId);
  const paragraphs = splitCoverLetterParagraphs(content);
  const title = [candidateName, company || jobTitle, "Cover Letter"]
    .filter(Boolean)
    .join(" - ");

  return `
<!DOCTYPE html>
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
      color: #1f2937;
      font-family: ${template.styles.fontFamily};
      font-size: 11pt;
      line-height: 1.55;
      margin: 0 auto;
      max-width: 8.5in;
      padding: 0.7in;
    }
    .letter-header {
      border-bottom: 2px solid ${template.styles.accentColor};
      margin-bottom: 28px;
      padding-bottom: 14px;
      text-align: ${template.styles.headerAlign};
    }
    h1 {
      color: ${template.styles.accentColor};
      font-size: 20pt;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .target {
      color: #4b5563;
      font-size: 10pt;
    }
    p {
      margin-bottom: ${template.styles.paragraphSpacing};
    }
    main {
      max-width: ${template.styles.bodyMaxWidth};
      margin: 0 auto;
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
    }
  </style>
</head>
<body>
  <header class="letter-header">
    <h1>${escapeHtml(candidateName)}</h1>
    ${
      company || jobTitle
        ? `<div class="target">${escapeHtml(
            [jobTitle, company].filter(Boolean).join(" at ")
          )}</div>`
        : ""
    }
  </header>
  <main>
    ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n    ")}
  </main>
</body>
</html>
  `.trim();
}
