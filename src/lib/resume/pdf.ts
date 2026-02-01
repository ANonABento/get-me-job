import type { TailoredResume } from "./generator";
import { getTemplate, type ResumeTemplate, TEMPLATES } from "./templates";

export { TEMPLATES };

// Generate HTML resume with template support
export function generateResumeHTML(
  resume: TailoredResume,
  templateId: string = "classic"
): string {
  const template = getTemplate(templateId);
  const { contact, summary, experiences, skills, education } = resume;
  const styles = template.styles;

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

  const bulletStyle =
    styles.bulletStyle === "disc"
      ? ""
      : styles.bulletStyle === "dash"
      ? "list-style-type: none; ul li::before { content: '– '; }"
      : styles.bulletStyle === "arrow"
      ? "list-style-type: none;"
      : "list-style-type: none;";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${contact.name} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    h1 {
      font-size: ${styles.headerSize};
      font-weight: 600;
      margin-bottom: 4px;
      color: ${styles.accentColor};
    }
    h2 {
      font-size: ${styles.sectionHeaderSize};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      ${sectionBorder}
      padding-bottom: 3px;
      margin: 14px 0 8px 0;
      color: ${styles.accentColor};
    }
    h3 {
      font-size: 11pt;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .header {
      ${headerAlignment}
      margin-bottom: 12px;
    }
    .contact {
      font-size: 10pt;
      color: #555;
    }
    .contact a {
      color: ${styles.accentColor};
      text-decoration: none;
    }
    .contact span {
      margin: 0 6px;
    }
    .summary {
      margin-bottom: 8px;
    }
    .experience-item {
      margin-bottom: 10px;
    }
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .company {
      font-weight: normal;
      color: #555;
    }
    .dates {
      font-size: 10pt;
      color: #666;
    }
    ul {
      margin-left: 16px;
      margin-top: 4px;
      ${bulletStyle}
    }
    li {
      margin-bottom: 2px;
    }
    ${
      styles.bulletStyle === "arrow"
        ? "li::before { content: '→ '; color: " + styles.accentColor + "; }"
        : ""
    }
    ${
      styles.bulletStyle === "dash"
        ? "li::before { content: '– '; }"
        : ""
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 12px;
    }
    .skill {
      font-size: 10pt;
    }
    .education-item {
      margin-bottom: 6px;
    }
    .edu-header {
      display: flex;
      justify-content: space-between;
    }
    @media print {
      @page {
        size: letter;
        margin: 0.5in;
      }
      body {
        padding: 0;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
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
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
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
        font-family: system-ui, sans-serif;
      "
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download PDF
    </button>
  </div>
  <div class="header">
    <h1>${contact.name}</h1>
    <div class="contact">
      ${contact.email ? `<a href="mailto:${contact.email}">${contact.email}</a>` : ""}
      ${contact.phone ? `<span>|</span>${contact.phone}` : ""}
      ${contact.location ? `<span>|</span>${contact.location}` : ""}
      ${contact.linkedin ? `<span>|</span><a href="https://${contact.linkedin}">${contact.linkedin}</a>` : ""}
      ${contact.github ? `<span>|</span><a href="https://${contact.github}">${contact.github}</a>` : ""}
    </div>
  </div>

  <section class="summary">
    <h2>Summary</h2>
    <p>${summary}</p>
  </section>

  <section>
    <h2>Experience</h2>
    ${experiences
      .map(
        (exp) => `
      <div class="experience-item">
        <div class="experience-header">
          <div>
            <h3>${exp.title}</h3>
            <span class="company">${exp.company}</span>
          </div>
          <span class="dates">${exp.dates}</span>
        </div>
        <ul>
          ${exp.highlights.map((h) => `<li>${h}</li>`).join("")}
        </ul>
      </div>
    `
      )
      .join("")}
  </section>

  <section>
    <h2>Skills</h2>
    <div class="skills">
      ${skills.map((s) => `<span class="skill">${s}</span>`).join(" • ")}
    </div>
  </section>

  ${
    education.length > 0
      ? `
  <section>
    <h2>Education</h2>
    ${education
      .map(
        (edu) => `
      <div class="education-item">
        <div class="edu-header">
          <div>
            <h3>${edu.degree} in ${edu.field}</h3>
            <span class="company">${edu.institution}</span>
          </div>
          <span class="dates">${edu.date}</span>
        </div>
      </div>
    `
      )
      .join("")}
  </section>
  `
      : ""
  }
</body>
</html>
  `.trim();
}

// Generate JSON representation for React-PDF rendering
export function generateResumeJSON(resume: TailoredResume) {
  return resume;
}
