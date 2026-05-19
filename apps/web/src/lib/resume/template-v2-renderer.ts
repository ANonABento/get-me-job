import { escapeHtml } from "@/lib/html";
import type { TailoredResume } from "@/lib/resume/generator";
import type {
  DocumentTemplateV2,
  TemplateBlock,
  TemplateBlockStyle,
  TemplateRegion,
  TemplateSlot,
} from "@/lib/resume/template-v2";

interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  color?: string;
  fontWeight?: string;
  textTransform?: "none" | "uppercase";
  letterSpacing?: string;
}

export function generateResumeHTMLV2(
  resume: TailoredResume,
  template: DocumentTemplateV2,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(resume.contact.name || "Resume")} - Resume</title>
  <style>${generateDocumentTemplateV2CSS(template)}</style>
</head>
<body>
  <article class="resume-v2">
    ${template.regions.map((region) => renderRegion(region, resume, template)).join("\n")}
  </article>
</body>
</html>`.trim();
}

export function generateDocumentTemplateV2CSS(
  template: DocumentTemplateV2,
): string {
  const body = tokenFor(template, "body", {
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: "11pt",
    lineHeight: "1.4",
  });
  const heading = tokenFor(template, "heading", {
    fontFamily: body.fontFamily,
    fontSize: "12pt",
    lineHeight: "1.2",
    fontWeight: "700",
    textTransform: "uppercase",
  });
  const name = tokenFor(template, "name", {
    fontFamily: body.fontFamily,
    fontSize: "20pt",
    lineHeight: "1.1",
    fontWeight: "700",
  });
  const meta = tokenFor(template, "meta", {
    fontFamily: body.fontFamily,
    fontSize: "10pt",
    lineHeight: body.lineHeight,
    color: "#555555",
  });
  const strong = tokenFor(template, "body-strong", {
    fontFamily: body.fontFamily,
    fontSize: body.fontSize,
    lineHeight: body.lineHeight,
    fontWeight: "700",
  });
  const pageSize = template.page.size === "a4" ? "A4" : "letter";
  const margins = template.page.margins;
  const sidebar = template.regions.find((region) => region.role === "sidebar");
  const hasSidebar = Boolean(sidebar);
  const sidebarWidth = sidebar?.box?.widthPt
    ? `${Math.round(sidebar.box.widthPt * 100) / 100}pt`
    : "1.7in";

  return `
* { box-sizing: border-box; }
body { margin: 0; background: #f4f4f5; color: #222; font-family: ${body.fontFamily}; font-size: ${body.fontSize}; line-height: ${body.lineHeight}; }
.resume-v2 {
  width: ${pageSize === "A4" ? "8.27in" : "8.5in"};
  min-height: ${pageSize === "A4" ? "11.69in" : "11in"};
  margin: 0 auto;
  padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
  background: #fff;
  display: ${hasSidebar ? "grid" : "block"};
  grid-template-columns: ${hasSidebar ? `${sidebarWidth} 1fr` : "1fr"};
  column-gap: ${hasSidebar ? "0.28in" : "0"};
}
.region-header { grid-column: 1 / -1; margin-bottom: 14px; }
.region-sidebar { grid-column: 1; }
.region-main { grid-column: ${hasSidebar ? "2" : "1"}; }
.name { margin: 0 0 4px; font-family: ${name.fontFamily}; font-size: ${name.fontSize}; line-height: ${name.lineHeight}; color: ${name.color ?? "inherit"}; font-weight: ${name.fontWeight ?? "700"}; }
.contact-line { display: flex; flex-wrap: wrap; gap: 4px 8px; font-family: ${meta.fontFamily}; font-size: ${meta.fontSize}; color: ${meta.color ?? "#555"}; }
.contact-line a { color: inherit; text-decoration: none; }
.section { margin: 0 0 12px; }
.section-title { margin: 0 0 6px; padding-bottom: 3px; border-bottom: 1px solid ${heading.color ?? "#333"}; font-family: ${heading.fontFamily}; font-size: ${heading.fontSize}; line-height: ${heading.lineHeight}; color: ${heading.color ?? "inherit"}; font-weight: ${heading.fontWeight ?? "700"}; text-transform: ${heading.textTransform ?? "uppercase"}; letter-spacing: 0; }
.section.divider-none .section-title, .section.divider-space .section-title { border-bottom: 0; padding-bottom: 0; }
.section.bullet-dash ul, .section.bullet-arrow ul, .section.bullet-none ul { list-style: none; margin-left: 0; }
.section.bullet-dash li::before { content: "- "; }
.section.bullet-arrow li::before { content: "→ "; }
.item { margin-bottom: 9px; }
.item-head { display: flex; justify-content: space-between; gap: 12px; }
.strong { font-family: ${strong.fontFamily}; font-size: ${strong.fontSize}; line-height: ${strong.lineHeight}; font-weight: ${strong.fontWeight ?? "700"}; }
.meta { font-family: ${meta.fontFamily}; font-size: ${meta.fontSize}; line-height: ${meta.lineHeight}; color: ${meta.color ?? "#555"}; }
ul { margin: 4px 0 0 16px; padding: 0; }
li { margin-bottom: 2px; }
.skills { display: flex; flex-wrap: wrap; gap: 4px 10px; }
@page { size: ${pageSize}; margin: 0; }
@media print { body { background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; } .resume-v2 { margin: 0; } .item, .section { page-break-inside: avoid; } }
`.trim();
}

export function getDocumentTemplateV2PDFOptions(template: DocumentTemplateV2) {
  return {
    format: template.page.size === "a4" ? ("A4" as const) : ("Letter" as const),
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  };
}

export function generateResumeLatexV2(
  resume: TailoredResume,
  template: DocumentTemplateV2,
): string {
  const body = tokenFor(template, "body", {
    fontFamily: "Helvetica",
    fontSize: "11pt",
    lineHeight: "1.2",
  });
  const heading = tokenFor(template, "heading", {
    fontFamily: body.fontFamily,
    fontSize: "12pt",
    lineHeight: "1.2",
    color: "#111827",
    fontWeight: "700",
  });
  const pageSize = template.page.size === "a4" ? "a4paper" : "letterpaper";
  const accent = latexHexColor(heading.color ?? "#111827");
  const margins = template.page.margins;

  return String.raw`\documentclass[${pageSize},${latexFontSize(body.fontSize)}]{article}
\usepackage[margin=${latexMargin(margins.top)}]{geometry}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\definecolor{accent}{HTML}{${accent}}
\setlength{\parindent}{0pt}
\setlist[itemize]{leftmargin=1.2em,itemsep=2pt,topsep=2pt}
\newcommand{\resumesection}[1]{\vspace{0.7em}{\large\bfseries\color{accent} #1}\par\vspace{0.2em}\hrule\vspace{0.45em}}
\begin{document}
{\LARGE\bfseries ${latexEscape(resume.contact.name || "Resume")}}\par
\vspace{0.25em}
${latexContactLine(resume)}
${latexSection("Summary", resume.summary ? latexEscape(resume.summary) : "")}
${latexExperience(resume)}
${latexProjects(resume)}
${latexListSection("Skills", resume.skills)}
${latexEducation(resume)}
${latexListSection("Certifications", resume.certifications)}
${latexListSection("Awards", resume.awards)}
\end{document}
`.trim();
}

function renderRegion(
  region: TemplateRegion,
  resume: TailoredResume,
  template: DocumentTemplateV2,
): string {
  if (region.role === "header") return renderHeader(resume);
  const content = region.blocks
    .map((block) => renderTemplateBlock(block, resume, template))
    .join("\n");
  return `<section class="region-${region.role}">${content}</section>`;
}

function renderTemplateBlock(
  block: TemplateBlock,
  resume: TailoredResume,
  template: DocumentTemplateV2,
): string {
  if (block.repeat === "experiences" || block.id === "section-experience") {
    return renderExperience(resume, block.text, block.style);
  }
  if (block.repeat === "projects" || block.id === "section-projects") {
    return renderProjects(resume, block.text, block.style);
  }
  if (block.repeat === "education" || block.id === "section-education") {
    return renderEducation(resume, block.text, block.style);
  }
  if (block.repeat === "skills" || block.id === "section-skills") {
    return renderSkills(
      resume,
      block.columns,
      block.text,
      block.style,
      block.columnWidthsPt,
    );
  }
  if (
    block.repeat === "certifications" ||
    block.id === "section-certifications"
  ) {
    return renderList(
      block.text ?? "Certifications",
      resume.certifications,
      block.style,
    );
  }
  if (block.repeat === "awards" || block.id === "section-awards") {
    return renderList(block.text ?? "Awards", resume.awards, block.style);
  }
  if (block.slotPath === "summary" || block.id === "section-summary") {
    return renderSummary(resume, block.text, block.style);
  }
  if (block.slotId) {
    const slot = template.slots.find(
      (candidate) => candidate.id === block.slotId,
    );
    return slot ? renderSlotValue(slot, resume) : "";
  }
  if (block.type === "section") {
    const children = block.children
      .map((childId) => template.slots.find((slot) => slot.id === childId))
      .filter((slot): slot is TemplateSlot => Boolean(slot))
      .map((slot) => renderSlotValue(slot, resume))
      .filter(Boolean)
      .join("");
    if (!children) return "";
    return `<section ${sectionAttrs(block.style)}>${block.text ? `<h2 class="section-title"${headingStyleAttr(block.style)}>${escapeHtml(block.text)}</h2>` : ""}${children}</section>`;
  }
  if (block.type === "text" && block.text)
    return `<p>${escapeHtml(block.text)}</p>`;
  return "";
}

function renderSlotValue(slot: TemplateSlot, resume: TailoredResume): string {
  switch (slot.path) {
    case "contact.name":
      return `<span class="strong">${escapeHtml(resume.contact.name ?? "")}</span>`;
    case "contact.email":
      return resume.contact.email
        ? `<a href="mailto:${escapeHtml(resume.contact.email)}">${escapeHtml(resume.contact.email)}</a>`
        : "";
    case "contact.phone":
      return resume.contact.phone
        ? `<span>${escapeHtml(resume.contact.phone)}</span>`
        : "";
    case "contact.location":
      return resume.contact.location
        ? `<span>${escapeHtml(resume.contact.location)}</span>`
        : "";
    case "contact.linkedin":
      return resume.contact.linkedin
        ? `<span>${escapeHtml(resume.contact.linkedin)}</span>`
        : "";
    case "contact.github":
      return resume.contact.github
        ? `<span>${escapeHtml(resume.contact.github)}</span>`
        : "";
    case "summary":
      return resume.summary ? `<p>${escapeHtml(resume.summary)}</p>` : "";
    case "skills[]":
      return resume.skills.length
        ? `<div class="skills">${resume.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>`
        : "";
    case "certifications[]":
      return valuesList(resume.certifications);
    case "awards[]":
      return valuesList(resume.awards);
    default:
      return "";
  }
}

function renderHeader(resume: TailoredResume): string {
  const contact = resume.contact;
  const links = [
    contact.email
      ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`
      : "",
    contact.phone ? escapeHtml(contact.phone) : "",
    contact.location ? escapeHtml(contact.location) : "",
    contact.linkedin ? escapeHtml(contact.linkedin) : "",
    contact.github ? escapeHtml(contact.github) : "",
  ].filter(Boolean);
  return `<header class="region-header"><h1 class="name">${escapeHtml(contact.name || "Your Name")}</h1><div class="contact-line">${links.join("<span>|</span>")}</div></header>`;
}

function renderSummary(
  resume: TailoredResume,
  title = "Summary",
  style?: TemplateBlockStyle,
): string {
  if (!resume.summary) return "";
  return `<section ${sectionAttrs(style)}><h2 class="section-title"${headingStyleAttr(style)}>${escapeHtml(title)}</h2><p>${escapeHtml(resume.summary)}</p></section>`;
}

function renderExperience(
  resume: TailoredResume,
  title = "Experience",
  style?: TemplateBlockStyle,
): string {
  if (!resume.experiences.length) return "";
  return `<section ${sectionAttrs(style)}><h2 class="section-title"${headingStyleAttr(style)}>${escapeHtml(title)}</h2>${resume.experiences
    .map(
      (experience) =>
        `<div class="item"><div class="item-head"><div><div class="strong">${escapeHtml(experience.title)}</div><div>${escapeHtml(experience.company)}</div></div><div class="meta">${escapeHtml(experience.dates)}</div></div><ul>${experience.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}</ul></div>`,
    )
    .join("")}</section>`;
}

function renderProjects(
  resume: TailoredResume,
  title = "Projects",
  style?: TemplateBlockStyle,
): string {
  const projects = resume.projects ?? [];
  if (!projects.length) return "";
  return `<section ${sectionAttrs(style)}><h2 class="section-title"${headingStyleAttr(style)}>${escapeHtml(title)}</h2>${projects
    .map(
      (project) =>
        `<div class="item"><div class="strong">${escapeHtml(project.name)}</div>${project.description ? `<div>${escapeHtml(project.description)}</div>` : ""}<ul>${project.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}</ul></div>`,
    )
    .join("")}</section>`;
}

function renderSkills(
  resume: TailoredResume,
  columns?: number,
  title = "Skills",
  sectionStyle?: TemplateBlockStyle,
  columnWidthsPt?: number[],
): string {
  if (!resume.skills.length) return "";
  const gridTemplate = columnWidthsPt?.length
    ? columnWidthsPt
        .map((width) => `${Math.round(width * 100) / 100}pt`)
        .join(" ")
    : columns && columns > 1
      ? `repeat(${columns}, minmax(0, 1fr))`
      : "";
  const style = gridTemplate
    ? ` style="display: grid; grid-template-columns: ${escapeHtml(gridTemplate)}; gap: 4px 10px;"`
    : "";
  return `<section ${sectionAttrs(sectionStyle)}><h2 class="section-title"${headingStyleAttr(sectionStyle)}>${escapeHtml(title)}</h2><div class="skills"${style}>${resume.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div></section>`;
}

function renderEducation(
  resume: TailoredResume,
  title = "Education",
  style?: TemplateBlockStyle,
): string {
  if (!resume.education.length) return "";
  return `<section ${sectionAttrs(style)}><h2 class="section-title"${headingStyleAttr(style)}>${escapeHtml(title)}</h2>${resume.education
    .map(
      (education) =>
        `<div class="item"><div class="item-head"><div><div class="strong">${escapeHtml(education.degree)}${education.field ? ` in ${escapeHtml(education.field)}` : ""}</div><div>${escapeHtml(education.institution)}</div></div><div class="meta">${escapeHtml(education.date)}</div></div></div>`,
    )
    .join("")}</section>`;
}

function renderList(
  title: string,
  values: string[] | undefined,
  style?: TemplateBlockStyle,
): string {
  if (!values?.length) return "";
  return `<section ${sectionAttrs(style)}><h2 class="section-title"${headingStyleAttr(style)}>${escapeHtml(title)}</h2>${valuesList(values)}</section>`;
}

function valuesList(values: string[] | undefined): string {
  if (!values?.length) return "";
  return `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function tokenFor(
  template: DocumentTemplateV2,
  name: string,
  fallback: TypographyToken,
): TypographyToken {
  return { ...fallback, ...template.tokens[name] };
}

function latexExperience(resume: TailoredResume): string {
  if (!resume.experiences.length) return "";
  return [
    String.raw`\resumesection{Experience}`,
    ...resume.experiences.map(
      (
        experience,
      ) => String.raw`\textbf{${latexEscape(experience.title)}} \hfill ${latexEscape(experience.dates)}
${latexEscape(experience.company)}
${latexItemize(experience.highlights)}`,
    ),
  ].join("\n\n");
}

function latexProjects(resume: TailoredResume): string {
  const projects = resume.projects ?? [];
  if (!projects.length) return "";
  return [
    String.raw`\resumesection{Projects}`,
    ...projects.map(
      (
        project,
      ) => String.raw`\textbf{${latexEscape(project.name)}}${project.description ? ` -- ${latexEscape(project.description)}` : ""}
${latexItemize(project.highlights)}`,
    ),
  ].join("\n\n");
}

function latexEducation(resume: TailoredResume): string {
  if (!resume.education.length) return "";
  return [
    String.raw`\resumesection{Education}`,
    ...resume.education.map(
      (
        education,
      ) => String.raw`\textbf{${latexEscape(education.degree)}${education.field ? ` in ${latexEscape(education.field)}` : ""}} \hfill ${latexEscape(education.date)}
${latexEscape(education.institution)}`,
    ),
  ].join("\n\n");
}

function latexSection(title: string, body: string): string {
  if (!body) return "";
  return `${String.raw`\resumesection`}{${latexEscape(title)}}\n${body}`;
}

function latexListSection(title: string, values: string[] | undefined): string {
  if (!values?.length) return "";
  return `${String.raw`\resumesection`}{${latexEscape(title)}}\n${latexItemize(values)}`;
}

function latexItemize(values: string[]): string {
  if (!values.length) return "";
  return [
    String.raw`\begin{itemize}`,
    ...values.map((value) => String.raw`\item ${latexEscape(value)}`),
    String.raw`\end{itemize}`,
  ].join("\n");
}

function latexContactLine(resume: TailoredResume): string {
  const contact = resume.contact;
  const values = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
  ].filter((value): value is string => Boolean(value));
  return values.length ? `${values.map(latexEscape).join(" $\\mid$ ")}\n` : "";
}

function latexEscape(value: string): string {
  return value
    .replace(/\\/g, String.raw`\textbackslash{}`)
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/\^/g, String.raw`\textasciicircum{}`)
    .replace(/~/g, String.raw`\textasciitilde{}`);
}

function latexHexColor(value: string): string {
  const normalized = value.trim().replace(/^#/, "");
  return /^[0-9A-Fa-f]{6}$/.test(normalized)
    ? normalized.toUpperCase()
    : "111827";
}

function latexFontSize(value: string): string {
  const pt = Number.parseFloat(value);
  if (!Number.isFinite(pt)) return "11pt";
  if (pt <= 10) return "10pt";
  if (pt >= 12) return "12pt";
  return "11pt";
}

function latexMargin(value: string): string {
  return /^\d+(?:\.\d+)?(?:in|cm|mm|pt)$/.test(value.trim())
    ? value.trim()
    : "0.75in";
}

function sectionAttrs(style?: TemplateBlockStyle): string {
  const classes = [
    "section",
    `divider-${style?.divider ?? "line"}`,
    `bullet-${style?.bulletStyle ?? "disc"}`,
  ];
  const declarations = [
    style?.marginBottom ? `margin-bottom: ${style.marginBottom}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  return `class="${classes.join(" ")}"${declarations ? ` style="${escapeHtml(declarations)}"` : ""}`;
}

function headingStyleAttr(style?: TemplateBlockStyle): string {
  const declarations = [
    style?.headingMarginBottom
      ? `margin-bottom: ${style.headingMarginBottom}`
      : "",
  ]
    .filter(Boolean)
    .join("; ");
  return declarations ? ` style="${escapeHtml(declarations)}"` : "";
}
