import type { TemplateStyles } from "@/lib/resume/template-types";

interface ResumeStyleOptions {
  rootSelector?: string;
  includePrintStyles?: boolean;
}

function selector(rootSelector: string, childSelector: string): string {
  return childSelector ? `${rootSelector} ${childSelector}` : rootSelector;
}

function bulletListStyles(
  styles: TemplateStyles,
  rootSelector: string,
  markerListSelector = "ul"
): string {
  const listStyle = styles.bulletStyle === "disc" ? "" : "list-style-type: none;";
  const markerSelector = selector(rootSelector, `${markerListSelector} li::before`);
  const markerStyle =
    styles.bulletStyle === "arrow"
      ? `${markerSelector} { content: "\\2192 "; color: ${styles.accentColor}; }`
      : styles.bulletStyle === "dash"
      ? `${markerSelector} { content: "\\2013 "; }`
      : "";

  return `
    ${selector(rootSelector, "ul")} {
      margin-left: 16px;
      margin-top: 4px;
      ${listStyle}
    }
    ${selector(rootSelector, "li")} {
      margin-bottom: 2px;
    }
    ${markerStyle}
  `;
}

function singleColumnStyles(
  styles: TemplateStyles,
  rootSelector: string,
  includePrintStyles: boolean
): string {
  const headerAlignment =
    styles.headerStyle === "centered"
      ? "text-align: center;"
      : styles.headerStyle === "minimal"
      ? ""
      : "text-align: left;";

  const sectionBorder =
    styles.sectionDivider === "line"
      ? `border-bottom: 1.5px solid ${styles.accentColor};`
      : "";

  return `
    ${rootSelector}, ${rootSelector} * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    ${rootSelector} {
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    ${selector(rootSelector, "h1")} {
      font-size: ${styles.headerSize};
      font-weight: 600;
      margin-bottom: 4px;
      color: ${styles.accentColor};
    }
    ${selector(rootSelector, "h2")} {
      font-size: ${styles.sectionHeaderSize};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      ${sectionBorder}
      padding-bottom: 3px;
      margin: 14px 0 8px 0;
      color: ${styles.accentColor};
    }
    ${selector(rootSelector, "h3")} {
      font-size: 11pt;
      font-weight: 600;
      margin-bottom: 2px;
    }
    ${selector(rootSelector, ".header")} {
      ${headerAlignment}
      margin-bottom: 12px;
    }
    ${selector(rootSelector, ".contact")} {
      font-size: 10pt;
      color: #555;
    }
    ${selector(rootSelector, ".contact a")} {
      color: ${styles.accentColor};
      text-decoration: none;
    }
    ${selector(rootSelector, ".contact span")} {
      margin: 0 6px;
    }
    ${selector(rootSelector, ".summary")} {
      margin-bottom: 8px;
    }
    ${selector(rootSelector, ".experience-item")} {
      margin-bottom: 10px;
    }
    ${selector(rootSelector, ".experience-header")} {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    ${selector(rootSelector, ".company")} {
      font-weight: normal;
      color: #555;
    }
    ${selector(rootSelector, ".dates")} {
      font-size: 10pt;
      color: #666;
    }
    ${bulletListStyles(styles, rootSelector)}
    ${selector(rootSelector, ".skills")} {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 12px;
    }
    ${selector(rootSelector, ".skill")} {
      font-size: 10pt;
    }
    ${selector(rootSelector, ".education-item")} {
      margin-bottom: 6px;
    }
    ${selector(rootSelector, ".edu-header")} {
      display: flex;
      justify-content: space-between;
    }
    ${printStyles(rootSelector, includePrintStyles, "0.5in", false)}
  `;
}

function twoColumnStyles(
  styles: TemplateStyles,
  rootSelector: string,
  includePrintStyles: boolean
): string {
  const sidebarBg = `${styles.accentColor}0d`;

  return `
    ${rootSelector}, ${rootSelector} * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    ${rootSelector} {
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
    }
    ${selector(rootSelector, ".two-col-header")} {
      padding: 0.4in 0.5in 0.3in;
      border-bottom: 2px solid ${styles.accentColor};
    }
    ${selector(rootSelector, ".two-col-header h1")} {
      font-size: ${styles.headerSize};
      font-weight: 600;
      color: ${styles.accentColor};
      margin-bottom: 4px;
    }
    ${selector(rootSelector, ".two-col-header .contact")} {
      font-size: 10pt;
      color: #555;
    }
    ${selector(rootSelector, ".two-col-header .contact a")} {
      color: ${styles.accentColor};
      text-decoration: none;
    }
    ${selector(rootSelector, ".two-col-header .contact span")} {
      margin: 0 6px;
    }
    ${selector(rootSelector, ".two-col-container")} {
      display: flex;
    }
    ${selector(rootSelector, ".two-col-left")} {
      width: 35%;
      background: ${sidebarBg};
      padding: 0.4in 0.35in;
      border-right: 1px solid #e5e7eb;
    }
    ${selector(rootSelector, ".two-col-right")} {
      width: 65%;
      padding: 0.4in 0.5in;
    }
    ${selector(rootSelector, "h2")} {
      font-size: ${styles.sectionHeaderSize};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding-bottom: 3px;
      margin: 0 0 8px 0;
      color: ${styles.accentColor};
    }
    ${selector(rootSelector, ".two-col-left h2")} {
      margin-top: 16px;
    }
    ${selector(rootSelector, ".two-col-left h2:first-child")} {
      margin-top: 0;
    }
    ${selector(rootSelector, ".two-col-right h2:first-child")} {
      margin-top: 0;
    }
    ${selector(rootSelector, ".two-col-right h2")} {
      margin-top: 14px;
      border-bottom: 1.5px solid ${styles.accentColor};
    }
    ${selector(rootSelector, "h3")} {
      font-size: 11pt;
      font-weight: 600;
      margin-bottom: 2px;
    }
    ${selector(rootSelector, ".summary p")} {
      margin-bottom: 0;
    }
    ${selector(rootSelector, ".experience-item")} {
      margin-bottom: 10px;
    }
    ${selector(rootSelector, ".experience-header")} {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    ${selector(rootSelector, ".company")} {
      font-weight: normal;
      color: #555;
    }
    ${selector(rootSelector, ".dates")} {
      font-size: 10pt;
      color: #666;
    }
    ${bulletListStyles(styles, rootSelector, "ul:not(.skills-list)")}
    ${selector(rootSelector, ".skills-list")} {
      list-style: none;
      margin-left: 0;
    }
    ${selector(rootSelector, ".skills-list li")} {
      padding: 2px 0;
      font-size: 10pt;
    }
    ${selector(rootSelector, ".education-item")} {
      margin-bottom: 8px;
    }
    ${selector(rootSelector, ".education-item h3")} {
      font-size: 10pt;
    }
    ${selector(rootSelector, ".education-item .company")} {
      font-size: 9pt;
    }
    ${selector(rootSelector, ".education-item .dates")} {
      font-size: 9pt;
    }
    ${printStyles(rootSelector, includePrintStyles, "0", true)}
  `;
}

function printStyles(
  rootSelector: string,
  includePrintStyles: boolean,
  pageMargin: string,
  includeTwoColumnContainer: boolean
): string {
  if (!includePrintStyles) return "";
  const twoColumnPrintStyles = includeTwoColumnContainer
    ? `
      ${selector(rootSelector, ".two-col-container")} {
        min-height: calc(11in - 1.1in);
      }`
    : "";

  return `
    @media print {
      @page {
        size: letter;
        margin: ${pageMargin};
      }
      ${rootSelector} {
        padding: 0;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      ${twoColumnPrintStyles}
      ${selector(rootSelector, "h1")},
      ${selector(rootSelector, "h2")},
      ${selector(rootSelector, "h3")} {
        page-break-after: avoid;
      }
      ${selector(rootSelector, ".experience-item")},
      ${selector(rootSelector, ".education-item")} {
        page-break-inside: avoid;
      }
      ${selector(rootSelector, "a")} {
        text-decoration: none;
        color: inherit;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
}

export function getResumeDocumentStyles(
  styles: TemplateStyles,
  options: ResumeStyleOptions = {}
): string {
  const rootSelector = options.rootSelector ?? "body";
  const includePrintStyles = options.includePrintStyles ?? true;

  return styles.layout === "two-column"
    ? twoColumnStyles(styles, rootSelector, includePrintStyles).trim()
    : singleColumnStyles(styles, rootSelector, includePrintStyles).trim();
}

function editorInteractionStyles(
  rootSelector: string,
  accentColor: string
): string {
  const sectionSelector = selector(rootSelector, ".resume-section");
  const handleSelector = selector(rootSelector, ".resume-section-drag-handle");

  return `
    ${rootSelector} {
      caret-color: ${accentColor};
      cursor: text;
      min-height: calc(11in - 1in);
      outline: none;
      user-select: text;
    }
    ${rootSelector} ::selection {
      background: color-mix(in srgb, ${accentColor} 24%, #dbeafe);
      color: inherit;
    }
    ${selector(rootSelector, ".ProseMirror-selectednode")} {
      outline: 2px solid color-mix(in srgb, ${accentColor} 48%, transparent);
      outline-offset: 3px;
    }
    ${sectionSelector} {
      position: relative;
    }
    ${handleSelector} {
      align-items: center;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      box-shadow: 0 1px 2px rgb(15 23 42 / 0.08);
      color: #64748b;
      cursor: grab;
      display: flex;
      height: 24px;
      justify-content: center;
      left: -34px;
      opacity: 0;
      padding: 0;
      position: absolute;
      top: 10px;
      transition: opacity 120ms ease, color 120ms ease, border-color 120ms ease;
      width: 24px;
      z-index: 2;
    }
    ${handleSelector}:active {
      cursor: grabbing;
    }
    ${handleSelector}::before {
      background-image: radial-gradient(currentColor 1.4px, transparent 1.6px);
      background-size: 6px 6px;
      content: "";
      display: block;
      height: 15px;
      width: 12px;
    }
    ${sectionSelector}:hover > .resume-section-drag-handle,
    ${sectionSelector}:focus-within > .resume-section-drag-handle,
    ${handleSelector}:focus-visible {
      opacity: 1;
    }
    ${handleSelector}:hover,
    ${handleSelector}:focus-visible {
      border-color: ${accentColor};
      color: ${accentColor};
      outline: none;
    }
    ${selector(rootSelector, "p.is-empty:first-child::before")} {
      color: #94a3b8;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  `;
}

export function getResumeEditorStyles(styles: TemplateStyles): string {
  const rootSelector = ".resume-editor .ProseMirror";
  const documentStyles = getResumeDocumentStyles(styles, {
    rootSelector,
    includePrintStyles: false,
  });
  return `${documentStyles}\n${editorInteractionStyles(
    rootSelector,
    styles.accentColor
  )}`.trim();
}
