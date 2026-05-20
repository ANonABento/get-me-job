import { escapeHtml } from "@/lib/html";
import type { TailoredResume } from "@/lib/resume/generator";
import type {
  ImportedTemplateStyleTokens,
  ResumeSemanticIR,
  SemanticSection,
  UniversalResumeSectionType,
} from "@/lib/resume/universal-template-import";

export interface ReusableResumeTemplateIR {
  schemaVersion: 4;
  id: string;
  name: string;
  source: {
    filename: string;
    type: ResumeSemanticIR["sourceType"];
  };
  page: ImportedTemplateStyleTokens["page"];
  tokens: ImportedTemplateStyleTokens;
  components: ReusableTemplateComponent[];
  sectionOrder: UniversalResumeSectionType[];
  diagnostics: string[];
}

export type ReusableTemplateComponent = HeaderBlockComponent | SectionComponent;

export interface HeaderBlockComponent {
  kind: "HeaderBlock";
  id: string;
  contactFields: Array<keyof ResumeSemanticIR["contact"]>;
  evidenceRefs: string[];
}

export interface SectionComponent {
  kind: "Section";
  id: string;
  sectionType: UniversalResumeSectionType;
  title: string;
  components: SectionChildComponent[];
  evidenceRefs: string[];
}

export type SectionChildComponent =
  | { kind: "SectionHeading"; id: string; title: string }
  | { kind: "EntryList"; id: string; itemComponent: EntryComponent };

export interface EntryComponent {
  kind: "Entry";
  id: string;
  header: {
    primary: boolean;
    secondary: boolean;
    meta: boolean;
    dateRange: boolean;
  };
  bulletList: boolean;
}

export function buildReusableResumeTemplateIR(
  semantic: ResumeSemanticIR,
  tokens: ImportedTemplateStyleTokens,
): ReusableResumeTemplateIR {
  return {
    schemaVersion: 4,
    id: `reusable-${sanitizeId(semantic.filename)}`,
    name: semantic.filename.replace(/\.[^.]+$/, "") || "Imported template",
    source: {
      filename: semantic.filename,
      type: semantic.sourceType,
    },
    page: tokens.page,
    tokens,
    components: [
      {
        kind: "HeaderBlock",
        id: "header",
        contactFields: ["email", "phone", "location", "linkedin", "github"],
        evidenceRefs: semantic.contact.evidenceRefs,
      },
      ...semantic.sections.map((section) => sectionComponent(section)),
    ],
    sectionOrder: semantic.sections.map((section) => section.type),
    diagnostics: [...semantic.warnings, ...tokens.warnings],
  };
}

export function renderReusableResumeTemplateHTML(
  semantic: ResumeSemanticIR,
  template: ReusableResumeTemplateIR,
): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(semantic.contact.name || template.name)}</title>
  <style>${renderReusableTemplateCSS(template.tokens)}</style>
</head>
<body>
  <article class="resume-template">
    ${template.components
      .map((component) => renderComponent(component, semantic))
      .join("\n")}
    ${renderAdditionalSections(template, semantic)}
  </article>
</body>
</html>`;
}

export function renderTailoredResumeWithReusableTemplate(
  resume: TailoredResume,
  template: ReusableResumeTemplateIR,
): string {
  return renderReusableResumeTemplateHTML(
    tailoredResumeToSemanticIR(resume, template),
    template,
  );
}

export function tailoredResumeToSemanticIR(
  resume: TailoredResume,
  template: ReusableResumeTemplateIR,
): ResumeSemanticIR {
  const contact = resume.contact ?? { name: "" };
  return {
    version: 1,
    sourceType: template.source.type,
    filename: template.source.filename,
    contact: {
      name: contact.name ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      location: contact.location ?? "",
      linkedin: contact.linkedin ?? "",
      github: contact.github ?? "",
      confidence: 1,
      evidenceRefs: [],
    },
    sections: [
      resume.summary
        ? {
            id: "section-summary",
            type: "summary",
            title: titleForSection("summary", template),
            items: [
              {
                primary: resume.summary,
                meta: [],
                bullets: [],
                confidence: 1,
                evidenceRefs: [],
              },
            ],
            confidence: 1,
            evidenceRefs: [],
          }
        : null,
      resume.experiences.length
        ? {
            id: "section-experience",
            type: "experience",
            title: titleForSection("experience", template),
            items: resume.experiences.map((experience) => ({
              primary: experience.title,
              secondary: experience.company,
              dateRange: experience.dates,
              meta: [],
              bullets: experience.highlights,
              confidence: 1,
              evidenceRefs: [],
            })),
            confidence: 1,
            evidenceRefs: [],
          }
        : null,
      resume.projects?.length
        ? {
            id: "section-projects",
            type: "projects",
            title: titleForSection("projects", template),
            items: resume.projects.map((project) => ({
              primary: project.name,
              secondary: project.description,
              meta: [],
              bullets: project.highlights,
              confidence: 1,
              evidenceRefs: [],
            })),
            confidence: 1,
            evidenceRefs: [],
          }
        : null,
      resume.skills.length
        ? {
            id: "section-skills",
            type: "skills",
            title: titleForSection("skills", template),
            items: [
              {
                primary: resume.skills.join(", "),
                meta: [],
                bullets: [],
                confidence: 1,
                evidenceRefs: [],
              },
            ],
            confidence: 1,
            evidenceRefs: [],
          }
        : null,
      resume.education.length
        ? {
            id: "section-education",
            type: "education",
            title: titleForSection("education", template),
            items: resume.education.map((education) => ({
              primary: education.institution,
              secondary: [education.degree, education.field]
                .filter(Boolean)
                .join(" — "),
              dateRange: education.date,
              meta: [],
              bullets: [],
              confidence: 1,
              evidenceRefs: [],
            })),
            confidence: 1,
            evidenceRefs: [],
          }
        : null,
      resume.certifications?.length
        ? scalarListSection("certifications", resume.certifications, template)
        : null,
      resume.awards?.length
        ? scalarListSection("awards", resume.awards, template)
        : null,
    ].filter((section): section is ResumeSemanticIR["sections"][number] =>
      Boolean(section),
    ),
    warnings: [],
  };
}

function sectionComponent(section: SemanticSection): SectionComponent {
  return {
    kind: "Section",
    id: `section-${section.type}`,
    sectionType: section.type,
    title: section.title,
    evidenceRefs: section.evidenceRefs,
    components: [
      {
        kind: "SectionHeading",
        id: `section-${section.type}-heading`,
        title: section.title,
      },
      {
        kind: "EntryList",
        id: `section-${section.type}-items`,
        itemComponent: {
          kind: "Entry",
          id: `section-${section.type}-entry`,
          header: {
            primary: true,
            secondary: true,
            meta: true,
            dateRange: true,
          },
          bulletList: true,
        },
      },
    ],
  };
}

function scalarListSection(
  type: Extract<UniversalResumeSectionType, "certifications" | "awards">,
  values: string[],
  template: ReusableResumeTemplateIR,
): SemanticSection {
  return {
    id: `section-${type}`,
    type,
    title: titleForSection(type, template),
    items: values.map((value) => ({
      primary: value,
      meta: [],
      bullets: [],
      confidence: 1,
      evidenceRefs: [],
    })),
    confidence: 1,
    evidenceRefs: [],
  };
}

function titleForSection(
  type: UniversalResumeSectionType,
  template: ReusableResumeTemplateIR,
): string {
  const component = template.components.find(
    (candidate): candidate is SectionComponent =>
      candidate.kind === "Section" && candidate.sectionType === type,
  );
  return component?.title ?? defaultSectionTitle(type);
}

function defaultSectionTitle(type: UniversalResumeSectionType): string {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderComponent(
  component: ReusableTemplateComponent,
  semantic: ResumeSemanticIR,
): string {
  if (component.kind === "HeaderBlock")
    return renderHeader(component, semantic);
  return renderSection(component, semantic);
}

function renderHeader(
  component: HeaderBlockComponent,
  semantic: ResumeSemanticIR,
): string {
  const contact = component.contactFields
    .map((field) => semantic.contact[field])
    .filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    .map(escapeHtml)
    .join(" | ");
  return `<header class="rt-header"><h1>${escapeHtml(
    semantic.contact.name || "Your Name",
  )}</h1>${contact ? `<div class="rt-contact">${contact}</div>` : ""}</header>`;
}

function renderSection(
  component: SectionComponent,
  semantic: ResumeSemanticIR,
): string {
  const section = semantic.sections.find(
    (candidate) => candidate.type === component.sectionType,
  );
  if (!section?.items.length) return "";
  return `<section class="rt-section rt-section-${component.sectionType}">
    <h2>${escapeHtml(component.title)}</h2>
    <div class="rt-items">
      ${section.items.map((item) => renderEntry(item)).join("\n")}
    </div>
  </section>`;
}

function renderAdditionalSections(
  template: ReusableResumeTemplateIR,
  semantic: ResumeSemanticIR,
): string {
  const renderedTypes = new Set(
    template.components
      .filter(
        (component): component is SectionComponent =>
          component.kind === "Section",
      )
      .map((component) => component.sectionType),
  );
  return semantic.sections
    .filter((section) => !renderedTypes.has(section.type))
    .map((section) => renderSection(sectionComponent(section), semantic))
    .join("\n");
}

function renderEntry(item: SemanticSection["items"][number]): string {
  const meta = [...item.meta, item.location].filter(Boolean).join(" | ");
  const secondary = [item.secondary, meta].filter(Boolean).join(" — ");
  return `<section class="rt-entry">
    <div class="rt-entry-head">
      <div>
        <strong>${escapeHtml(item.primary)}</strong>
        ${secondary ? `<span>${escapeHtml(secondary)}</span>` : ""}
      </div>
      ${item.dateRange ? `<time>${escapeHtml(item.dateRange)}</time>` : ""}
    </div>
    ${
      item.bullets.length
        ? `<ul>${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
        : ""
    }
  </section>`;
}

function renderReusableTemplateCSS(
  tokens: ImportedTemplateStyleTokens,
): string {
  const page = tokens.page;
  const body = tokens.typography.body;
  const name = tokens.typography.name ?? body;
  const heading = tokens.typography.sectionHeading ?? body;
  const metadata = tokens.typography.metadata ?? body;
  const accent = tokens.color.accent?.value ?? heading?.color ?? "#111111";
  const bodyColor = tokens.color.body?.value ?? body?.color ?? "#171717";
  const ruleColor = tokens.color.rule?.value ?? accent;
  const margins = page.margins ?? {
    top: "42pt",
    right: "42pt",
    bottom: "42pt",
    left: "42pt",
  };

  return `
* { box-sizing: border-box; }
body { margin: 0; background: #f4f4f5; color: ${bodyColor}; font-family: ${fontFamily(body)}; font-size: ${pt(body?.fontSizePt, 10)}; line-height: ${body?.lineHeight ?? "1.25"}; }
.resume-template { width: ${page.widthPt}pt; min-height: ${page.heightPt}pt; margin: 0 auto; padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left}; background: ${page.background ?? "#fff"}; }
.rt-header { display: flex; justify-content: space-between; gap: 18pt; align-items: flex-start; margin-bottom: ${pt(tokens.spacing.sectionGapPt?.value, 10)}; min-width: 0; }
.rt-header h1 { margin: 0; font-family: ${fontFamily(name)}; font-size: ${pt(name?.fontSizePt, 24)}; line-height: 1; color: ${name?.color ?? accent}; font-weight: ${name?.fontWeight ?? "700"}; }
.rt-contact { max-width: 55%; min-width: 0; text-align: right; font-family: ${fontFamily(metadata)}; font-size: ${pt(metadata?.fontSizePt, 9)}; color: ${metadata?.color ?? bodyColor}; line-height: ${metadata?.lineHeight ?? "1.25"}; overflow-wrap: anywhere; }
.rt-section { margin-top: ${pt(tokens.spacing.sectionGapPt?.value, 8)}; }
.rt-section h2 { margin: 0 0 4pt; padding-bottom: 2pt; border-bottom: ${tokens.rules.sectionDivider?.widthPt ?? 0.75}pt ${tokens.rules.sectionDivider?.style ?? "solid"} ${ruleColor}; font-family: ${fontFamily(heading)}; font-size: ${pt(heading?.fontSizePt, 11)}; color: ${heading?.color ?? accent}; font-weight: ${heading?.fontWeight ?? "700"}; text-transform: ${heading?.textTransform ?? "uppercase"}; }
.rt-items { display: grid; gap: ${pt(tokens.spacing.itemGapPt?.value, 4)}; }
.rt-entry-head { display: flex; justify-content: space-between; gap: 12pt; align-items: baseline; min-width: 0; }
.rt-entry-head > div { min-width: 0; }
.rt-entry-head strong { font-weight: 700; }
.rt-entry-head span { margin-left: 3pt; }
.rt-entry-head time { white-space: nowrap; text-align: right; font-size: ${pt(metadata?.fontSizePt, 9)}; color: ${metadata?.color ?? bodyColor}; }
.rt-entry ul { margin: 2pt 0 0 13pt; padding: 0; }
.rt-entry li { margin: 0 0 ${pt(tokens.spacing.bulletGapPt?.value, 1.5)}; }
@page { size: ${page.widthPt}pt ${page.heightPt}pt; margin: 0; }
@media print { body { background: #fff; } .resume-template { margin: 0; } }
`.trim();
}

function fontFamily(token: { fontFamily?: string } | undefined): string {
  return token?.fontFamily ?? "Arial, sans-serif";
}

function pt(value: number | undefined, fallback: number): string {
  return `${Math.round((value ?? fallback) * 100) / 100}pt`;
}

function sanitizeId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
