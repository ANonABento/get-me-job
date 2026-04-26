import type { TailoredResume } from "./generator";
import { getTemplateWithCustom, type ResumeTemplate, TEMPLATES } from "./templates";
import type { ContactInfo } from "@/types";
import { getResumeDocumentStyles } from "@/lib/editor/styles";

export { TEMPLATES };

function renderPrintButton(): string {
  return `
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
  </div>`;
}

function renderContactInfo(contact: ContactInfo): string {
  return `
      ${contact.email ? `<a href="mailto:${contact.email}">${contact.email}</a>` : ""}
      ${contact.phone ? `<span>|</span>${contact.phone}` : ""}
      ${contact.location ? `<span>|</span>${contact.location}` : ""}
      ${contact.linkedin ? `<span>|</span><a href="https://${contact.linkedin}">${contact.linkedin}</a>` : ""}
      ${contact.github ? `<span>|</span><a href="https://${contact.github}">${contact.github}</a>` : ""}`;
}

// Generate HTML resume with template support
export function generateResumeHTML(
  resume: TailoredResume,
  templateId: string = "classic",
  userId?: string
): string {
  const template = getTemplateWithCustom(templateId, userId);
  const { contact, summary, experiences, skills, education } = resume;
  const styles = template.styles;

  if (styles.layout === "two-column") {
    return generateTwoColumnHTML(resume, template);
  }

  const documentStyles = getResumeDocumentStyles(styles);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${contact.name} - Resume</title>
  <style>
    ${documentStyles}
  </style>
</head>
<body>
  ${renderPrintButton()}
  <div class="header">
    <h1>${contact.name}</h1>
    <div class="contact">
      ${renderContactInfo(contact)}
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

function generateTwoColumnHTML(
  resume: TailoredResume,
  template: ResumeTemplate
): string {
  const { contact, summary, experiences, skills, education } = resume;
  const styles = template.styles;
  const documentStyles = getResumeDocumentStyles(styles);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${contact.name} - Resume</title>
  <style>
    ${documentStyles}
  </style>
</head>
<body>
  ${renderPrintButton()}

  <div class="two-col-header">
    <h1>${contact.name}</h1>
    <div class="contact">
      ${renderContactInfo(contact)}
    </div>
  </div>

  <div class="two-col-container">
    <div class="two-col-left">
      <h2>Skills</h2>
      <ul class="skills-list">
        ${skills.map((s) => `<li>${s}</li>`).join("")}
      </ul>

      ${
        education.length > 0
          ? `
      <h2>Education</h2>
      ${education
        .map(
          (edu) => `
        <div class="education-item">
          <h3>${edu.degree} in ${edu.field}</h3>
          <span class="company">${edu.institution}</span><br/>
          <span class="dates">${edu.date}</span>
        </div>
      `
        )
        .join("")}
      `
          : ""
      }
    </div>

    <div class="two-col-right">
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
    </div>
  </div>
</body>
</html>
  `.trim();
}
