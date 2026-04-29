// Client-safe template definitions (no server/DB imports)
export type {
  CoverLetterTemplate,
  CoverLetterTemplateStyles,
  DocumentTemplate,
  ResumeTemplate,
  TemplateStyles,
} from "./template-types";
import type {
  CoverLetterTemplate,
  DocumentTemplate,
  ResumeTemplate,
  TemplateStyles,
} from "./template-types";

export type TemplateDocumentMode = "resume" | "cover_letter";

export const TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional format, clean and ATS-friendly",
    styles: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: "11pt",
      headerSize: "20pt",
      sectionHeaderSize: "12pt",
      lineHeight: "1.4",
      accentColor: "#333333",
      layout: "single-column",
      headerStyle: "centered",
      bulletStyle: "disc",
      sectionDivider: "line",
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with subtle accent colors",
    styles: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontSize: "10pt",
      headerSize: "24pt",
      sectionHeaderSize: "11pt",
      lineHeight: "1.5",
      accentColor: "#2563eb",
      layout: "single-column",
      headerStyle: "left",
      bulletStyle: "dash",
      sectionDivider: "space",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple, focuses on content",
    styles: {
      fontFamily: "'Georgia', serif",
      fontSize: "11pt",
      headerSize: "18pt",
      sectionHeaderSize: "12pt",
      lineHeight: "1.6",
      accentColor: "#000000",
      layout: "single-column",
      headerStyle: "minimal",
      bulletStyle: "none",
      sectionDivider: "none",
    },
  },
  {
    id: "executive",
    name: "Executive",
    description: "Bold headers, strong visual hierarchy",
    styles: {
      fontFamily: "'Cambria', 'Times New Roman', serif",
      fontSize: "11pt",
      headerSize: "22pt",
      sectionHeaderSize: "13pt",
      lineHeight: "1.4",
      accentColor: "#1e3a5f",
      layout: "single-column",
      headerStyle: "centered",
      bulletStyle: "arrow",
      sectionDivider: "line",
    },
  },
  {
    id: "tech",
    name: "Tech",
    description: "Tech industry focused with clean modern styling",
    styles: {
      fontFamily: "'SF Pro', 'Segoe UI', system-ui, sans-serif",
      fontSize: "10pt",
      headerSize: "22pt",
      sectionHeaderSize: "11pt",
      lineHeight: "1.5",
      accentColor: "#059669",
      layout: "single-column",
      headerStyle: "left",
      bulletStyle: "dash",
      sectionDivider: "space",
    },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold colors and unique styling for creative roles",
    styles: {
      fontFamily: "'Poppins', 'Montserrat', sans-serif",
      fontSize: "10pt",
      headerSize: "26pt",
      sectionHeaderSize: "12pt",
      lineHeight: "1.5",
      accentColor: "#8b5cf6",
      layout: "single-column",
      headerStyle: "left",
      bulletStyle: "arrow",
      sectionDivider: "space",
    },
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout for experienced professionals",
    styles: {
      fontFamily: "'Arial Narrow', Arial, sans-serif",
      fontSize: "9pt",
      headerSize: "16pt",
      sectionHeaderSize: "10pt",
      lineHeight: "1.3",
      accentColor: "#374151",
      layout: "single-column",
      headerStyle: "minimal",
      bulletStyle: "disc",
      sectionDivider: "line",
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "Conservative styling for business and finance",
    styles: {
      fontFamily: "'Garamond', 'Times New Roman', serif",
      fontSize: "11pt",
      headerSize: "20pt",
      sectionHeaderSize: "12pt",
      lineHeight: "1.5",
      accentColor: "#1f2937",
      layout: "single-column",
      headerStyle: "centered",
      bulletStyle: "disc",
      sectionDivider: "line",
    },
  },
  {
    id: "two-column",
    name: "Two Column",
    description: "Space-efficient two-column layout for experienced candidates",
    styles: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontSize: "10pt",
      headerSize: "22pt",
      sectionHeaderSize: "11pt",
      lineHeight: "1.4",
      accentColor: "#2563eb",
      layout: "two-column",
      headerStyle: "left",
      bulletStyle: "disc",
      sectionDivider: "space",
    },
  },
];

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "formal",
    name: "Formal",
    description: "Traditional business letter with measured serif typography",
    styles: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: "11pt",
      headerSize: "18pt",
      lineHeight: "1.68",
      accentColor: "#1f2937",
      layout: "letter",
      headerStyle: "left",
      paragraphSpacing: "15px",
      bodyMaxWidth: "6.9in",
      pagePadding: "0.72in",
      signatureSpacing: "28px",
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Crisp letter layout with a direct centered header",
    styles: {
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      fontSize: "11pt",
      headerSize: "20pt",
      lineHeight: "1.62",
      accentColor: "#2563eb",
      layout: "letter",
      headerStyle: "centered",
      paragraphSpacing: "14px",
      bodyMaxWidth: "6.95in",
      pagePadding: "0.68in",
      signatureSpacing: "26px",
    },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Warm, expressive letter format for creative roles",
    styles: {
      fontFamily: "'Avenir Next', 'Montserrat', Arial, sans-serif",
      fontSize: "11pt",
      headerSize: "21pt",
      lineHeight: "1.65",
      accentColor: "#be123c",
      layout: "letter",
      headerStyle: "left",
      paragraphSpacing: "16px",
      bodyMaxWidth: "7.05in",
      pagePadding: "0.7in",
      signatureSpacing: "30px",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet single-column letter with generous line spacing",
    styles: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: "11pt",
      headerSize: "17pt",
      lineHeight: "1.72",
      accentColor: "#111827",
      layout: "letter",
      headerStyle: "minimal",
      paragraphSpacing: "15px",
      bodyMaxWidth: "6.8in",
      pagePadding: "0.75in",
      signatureSpacing: "32px",
    },
  },
];

// Get template by ID (built-in only)
export function getTemplate(id: string): ResumeTemplate {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}

export function getCoverLetterTemplate(id: string): CoverLetterTemplate {
  return (
    COVER_LETTER_TEMPLATES.find((template) => template.id === id) ||
    COVER_LETTER_TEMPLATES[0]
  );
}

export function getDefaultTemplateIdForDocumentMode(
  documentMode: TemplateDocumentMode
): string {
  return documentMode === "cover_letter"
    ? COVER_LETTER_TEMPLATES[0].id
    : TEMPLATES[0].id;
}

export function getTemplatesForDocumentMode(
  documentMode: TemplateDocumentMode
): DocumentTemplate[] {
  return documentMode === "cover_letter" ? COVER_LETTER_TEMPLATES : TEMPLATES;
}

export function getTemplateForDocumentMode(
  documentMode: TemplateDocumentMode,
  id: string
): DocumentTemplate {
  return documentMode === "cover_letter"
    ? getCoverLetterTemplate(id)
    : getTemplate(id);
}

// Generate CSS from template styles
export function generateTemplateCSS(styles: TemplateStyles): string {
  const bulletChar =
    styles.bulletStyle === "disc"
      ? "disc"
      : styles.bulletStyle === "dash"
      ? '"-  "'
      : styles.bulletStyle === "arrow"
      ? '"→ "'
      : "none";

  const sectionBorder =
    styles.sectionDivider === "line"
      ? `border-bottom: 1.5px solid ${styles.accentColor};`
      : "";

  const sectionMargin =
    styles.sectionDivider === "space" ? "margin-bottom: 16px;" : "margin-bottom: 8px;";

  return `
    body {
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
    }
    h1 {
      font-size: ${styles.headerSize};
      ${styles.headerStyle === "centered" ? "text-align: center;" : ""}
    }
    h2 {
      font-size: ${styles.sectionHeaderSize};
      color: ${styles.accentColor};
      ${sectionBorder}
      ${sectionMargin}
    }
    ul {
      list-style-type: ${bulletChar === "disc" ? "disc" : "none"};
    }
    ${
      bulletChar !== "disc" && bulletChar !== "none"
        ? `ul li::before { content: ${bulletChar}; }`
        : ""
    }
  `;
}
