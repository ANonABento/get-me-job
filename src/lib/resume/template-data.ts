// Client-safe template definitions (no server/DB imports)
export type { ResumeTemplate, TemplateStyles } from "./template-types";
import type { TemplateStyles } from "./template-types";
import type { ResumeTemplate } from "./template-types";

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

// Get template by ID (built-in only)
export function getTemplate(id: string): ResumeTemplate {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
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
