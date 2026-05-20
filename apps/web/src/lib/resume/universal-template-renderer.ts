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
  | { kind: "EntryList"; id: string; itemComponent: EntryComponent }
  | { kind: "SkillList"; id: string; separator: "comma" | "bullet" };

export interface ReusableTemplateSourceEvidence {
  blocks: Array<{
    id: string;
    type?: string;
    text?: string;
    cellMetadata?: Array<{
      text?: string;
      blocks?: Array<{ type?: string; text?: string; listMarker?: string }>;
    }>;
    listMarker?: string;
  }>;
}

function layoutClassValue(value: string | undefined, fallback: string): string {
  return (value || fallback).replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

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
  bulletMarker?: "disc" | "decimal" | "dash" | "none";
}

export function buildReusableResumeTemplateIR(
  semantic: ResumeSemanticIR,
  tokens: ImportedTemplateStyleTokens,
  sourceEvidence?: ReusableTemplateSourceEvidence,
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
      ...semantic.sections.map((section) =>
        sectionComponent(section, sourceEvidence),
      ),
    ],
    sectionOrder: semantic.sections.map((section) => section.type),
    diagnostics: [...semantic.warnings, ...tokens.warnings],
  };
}

export function renderReusableResumeTemplateHTML(
  semantic: ResumeSemanticIR,
  template: ReusableResumeTemplateIR,
): string {
  const headerMode = layoutClassValue(
    template.tokens.layout.headerMode?.value,
    "split",
  );
  const dateAlignment = layoutClassValue(
    template.tokens.layout.dateAlignment?.value,
    "right-column",
  );
  const sectionTitlePlacement = layoutClassValue(
    template.tokens.layout.sectionTitlePlacement?.value,
    "above",
  );
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(semantic.contact.name || template.name)}</title>
  <style>${renderReusableTemplateCSS(template.tokens)}</style>
</head>
<body>
  <article class="resume-template rt-header-${headerMode} rt-date-${dateAlignment} rt-section-title-${sectionTitlePlacement}">
    ${renderTemplateBody(template, semantic)}
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

function sectionComponent(
  section: SemanticSection,
  sourceEvidence?: ReusableTemplateSourceEvidence,
): SectionComponent {
  const bodyComponent: SectionChildComponent =
    section.type === "skills"
      ? {
          kind: "SkillList",
          id: `section-${section.type}-skills`,
          separator: "comma",
        }
      : {
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
            bulletList: inferSectionBulletList(section, sourceEvidence),
            bulletMarker: inferSectionBulletMarker(section, sourceEvidence),
          },
        };

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
      bodyComponent,
    ],
  };
}

function inferSectionBulletList(
  section: SemanticSection,
  sourceEvidence?: ReusableTemplateSourceEvidence,
): boolean {
  if (
    !section.items.some((item) => item.bullets.some((bullet) => bullet.trim()))
  ) {
    return true;
  }
  if (!sourceEvidence?.blocks.length) return true;
  const sourceBlocksById = new Map(
    sourceEvidence.blocks.map((block) => [block.id, block]),
  );
  const referencedBlocks = section.items
    .flatMap((item) => item.evidenceRefs)
    .map((ref) => sourceBlocksById.get(ref))
    .filter(
      (block): block is ReusableTemplateSourceEvidence["blocks"][number] =>
        Boolean(block),
    );
  if (!referencedBlocks.length) return true;
  return (
    referencedBlocks.some(hasVisualBulletEvidence) ||
    sourceEvidence.blocks.some(hasVisualBulletEvidence)
  );
}

function inferSectionBulletMarker(
  section: SemanticSection,
  sourceEvidence?: ReusableTemplateSourceEvidence,
): EntryComponent["bulletMarker"] {
  if (!sourceEvidence?.blocks.length) return undefined;
  const sourceBlocksById = new Map(
    sourceEvidence.blocks.map((block) => [block.id, block]),
  );
  const referencedMarkers = section.items
    .flatMap((item) => item.evidenceRefs)
    .map((ref) => sourceBlocksById.get(ref))
    .filter(
      (block): block is ReusableTemplateSourceEvidence["blocks"][number] =>
        Boolean(block),
    )
    .flatMap(visualBulletMarkers);
  const markers = referencedMarkers.length
    ? referencedMarkers
    : sourceEvidence.blocks.flatMap(visualBulletMarkers);
  return mostCommonMarker(markers);
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

function renderTemplateBody(
  template: ReusableResumeTemplateIR,
  semantic: ResumeSemanticIR,
): string {
  const header = template.components.find(
    (component): component is HeaderBlockComponent =>
      component.kind === "HeaderBlock",
  );
  const sectionComponents = template.components.filter(
    (component): component is SectionComponent => component.kind === "Section",
  );
  const componentByType = new Map(
    sectionComponents.map((component) => [component.sectionType, component]),
  );
  const semanticTypes = new Set(
    semantic.sections.map((section) => section.type),
  );
  const orderedTypes = [
    ...template.sectionOrder.filter((type) => semanticTypes.has(type)),
    ...semantic.sections
      .map((section) => section.type)
      .filter((type) => !template.sectionOrder.includes(type)),
  ];
  const uniqueOrderedTypes = [...new Set(orderedTypes)];
  const renderedSections = uniqueOrderedTypes
    .map((type) => {
      const section = semantic.sections.find(
        (candidate) => candidate.type === type,
      );
      if (!section) return "";
      return renderSection(
        componentByType.get(type) ?? sectionComponent(section),
        semantic,
      );
    })
    .filter(Boolean);

  return [
    header
      ? renderHeader(header, semantic, template.tokens.color.link?.value)
      : "",
    ...renderedSections,
  ].join("\n");
}

function renderHeader(
  component: HeaderBlockComponent,
  semantic: ResumeSemanticIR,
  linkColor?: string,
): string {
  const contact = component.contactFields
    .map((field) => renderContactField(field, semantic.contact[field]))
    .filter(Boolean)
    .join(" | ");
  return `<header class="rt-header"><h1>${escapeHtml(
    semantic.contact.name || "Your Name",
  )}</h1>${contact ? `<div class="rt-contact${linkColor ? " rt-contact-linked" : ""}">${contact}</div>` : ""}</header>`;
}

function renderContactField(
  field: keyof ResumeSemanticIR["contact"],
  value: ResumeSemanticIR["contact"][keyof ResumeSemanticIR["contact"]],
): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const text = value.trim();
  if (field === "email") {
    return `<a href="mailto:${escapeHtml(text)}">${escapeHtml(text)}</a>`;
  }
  if (field === "linkedin" || field === "github") {
    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    return `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
  }
  return escapeHtml(text);
}

function renderSection(
  component: SectionComponent,
  semantic: ResumeSemanticIR,
): string {
  const section = semantic.sections.find(
    (candidate) => candidate.type === component.sectionType,
  );
  if (!section?.items.length) return "";
  const children = component.components.length
    ? component.components
    : defaultSectionChildren(component);
  const body = children
    .map((child) => {
      if (child.kind === "SectionHeading") {
        return `<h2>${escapeHtml(child.title)}</h2>`;
      }
      if (child.kind === "SkillList") {
        return renderSkillList(section, child);
      }
      return `<div class="rt-items">
      ${section.items
        .map((item) => renderEntry(item, child.itemComponent))
        .join("\n")}
    </div>`;
    })
    .filter(Boolean)
    .join("\n");
  return `<section class="rt-section rt-section-${component.sectionType}">
    ${body}
  </section>`;
}

function defaultSectionChildren(
  component: SectionComponent,
): SectionChildComponent[] {
  return [
    {
      kind: "SectionHeading",
      id: `${component.id}-heading`,
      title: component.title,
    },
    component.sectionType === "skills"
      ? {
          kind: "SkillList",
          id: `${component.id}-skills`,
          separator: "comma",
        }
      : {
          kind: "EntryList",
          id: `${component.id}-items`,
          itemComponent: defaultEntryComponent(component.id),
        },
  ];
}

function defaultEntryComponent(id: string): EntryComponent {
  return {
    kind: "Entry",
    id: `${id}-entry`,
    header: {
      primary: true,
      secondary: true,
      meta: true,
      dateRange: true,
    },
    bulletList: true,
    bulletMarker: undefined,
  };
}

function hasVisualBulletEvidence(
  block: ReusableTemplateSourceEvidence["blocks"][number],
): boolean {
  if (block.type === "list-item") return true;
  if (looksLikeBulletText(block.text ?? "")) return true;
  return (block.cellMetadata ?? []).some((cell) => {
    if (looksLikeBulletText(cell.text ?? "")) return true;
    return (cell.blocks ?? []).some(
      (cellBlock) =>
        cellBlock.type === "list-item" ||
        looksLikeBulletText(cellBlock.text ?? ""),
    );
  });
}

function visualBulletMarkers(
  block: ReusableTemplateSourceEvidence["blocks"][number],
): Array<NonNullable<EntryComponent["bulletMarker"]>> {
  const markers: Array<NonNullable<EntryComponent["bulletMarker"]>> = [];
  if (block.type === "list-item") {
    markers.push(normalizeBulletMarker(block.listMarker) ?? "disc");
  } else {
    const marker = markerFromText(block.text ?? "");
    if (marker) markers.push(marker);
  }
  for (const cell of block.cellMetadata ?? []) {
    const marker = markerFromText(cell.text ?? "");
    if (marker) markers.push(marker);
    for (const cellBlock of cell.blocks ?? []) {
      if (cellBlock.type === "list-item") {
        markers.push(normalizeBulletMarker(cellBlock.listMarker) ?? "disc");
      } else {
        const cellBlockMarker = markerFromText(cellBlock.text ?? "");
        if (cellBlockMarker) markers.push(cellBlockMarker);
      }
    }
  }
  return markers;
}

function normalizeBulletMarker(
  value: string | undefined,
): EntryComponent["bulletMarker"] {
  if (value === "decimal") return "decimal";
  if (value === "dash") return "dash";
  if (value === "none") return "none";
  if (value === "disc") return "disc";
  return undefined;
}

function markerFromText(text: string): EntryComponent["bulletMarker"] {
  if (/^\s*\d+[.)]\s+/.test(text)) return "decimal";
  if (/^\s*[-\u2043]\s+/.test(text)) return "dash";
  if (/^\s*(?:[*]|\u2022|\u2023|\u25e6)\s+/.test(text)) return "disc";
  return undefined;
}

function mostCommonMarker(
  markers: Array<NonNullable<EntryComponent["bulletMarker"]>>,
): EntryComponent["bulletMarker"] {
  if (!markers.length) return undefined;
  const counts = new Map<NonNullable<EntryComponent["bulletMarker"]>, number>();
  for (const marker of markers)
    counts.set(marker, (counts.get(marker) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function looksLikeBulletText(text: string): boolean {
  return /^\s*(?:[-*]|\u2022|\u2023|\u25e6|\u2043|\d+[.)])\s+/.test(text);
}

function renderEntry(
  item: SemanticSection["items"][number],
  component: EntryComponent,
): string {
  const meta = component.header.meta
    ? [...item.meta, item.location].filter(Boolean).join(" | ")
    : "";
  const secondary = [component.header.secondary ? item.secondary : "", meta]
    .filter(Boolean)
    .join(" — ");
  const bullets = item.bullets.filter((bullet) => bullet.trim());
  return `<section class="rt-entry">
    <div class="rt-entry-head">
      <div>
        ${
          component.header.primary
            ? `<strong>${escapeHtml(item.primary)}</strong>`
            : ""
        }
        ${secondary ? `<span>${escapeHtml(secondary)}</span>` : ""}
      </div>
      ${
        component.header.dateRange && item.dateRange
          ? `<time>${escapeHtml(item.dateRange)}</time>`
          : ""
      }
    </div>
    ${
      bullets.length && component.bulletList
        ? `<ul class="rt-list-${component.bulletMarker ?? "disc"}">${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
        : bullets.length
          ? `<div class="rt-entry-lines">${bullets
              .map((bullet) => `<p>${escapeHtml(bullet)}</p>`)
              .join("")}</div>`
          : ""
    }
  </section>`;
}

function renderSkillList(
  section: SemanticSection,
  component: Extract<SectionChildComponent, { kind: "SkillList" }>,
): string {
  const skills = section.items
    .flatMap((item) => [
      ...splitSkillValue(item.primary),
      ...item.meta.flatMap(splitSkillValue),
      ...item.bullets.flatMap(splitSkillValue),
    ])
    .filter(Boolean);
  const uniqueSkills = [...new Set(skills)];
  if (!uniqueSkills.length) return "";
  const separatorClass =
    component.separator === "bullet" ? "rt-skills-bullet" : "rt-skills-comma";
  return `<div class="rt-skills ${separatorClass}">${uniqueSkills
    .map((skill) => `<span>${escapeHtml(skill)}</span>`)
    .join("")}</div>`;
}

function splitSkillValue(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function renderReusableTemplateCSS(
  tokens: ImportedTemplateStyleTokens,
): string {
  const page = tokens.page;
  const body = tokens.typography.body;
  const name = tokens.typography.name ?? body;
  const heading = tokens.typography.sectionHeading ?? body;
  const entryTitle = tokens.typography.entryTitle ?? body;
  const metadata = tokens.typography.metadata ?? body;
  const accent = tokens.color.accent?.value ?? heading?.color ?? "#111111";
  const bodyColor = tokens.color.body?.value ?? body?.color ?? "#171717";
  const ruleColor = tokens.color.rule?.value ?? accent;
  const linkColor = tokens.color.link?.value ?? metadata?.color ?? bodyColor;
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
.rt-header-stacked .rt-header { flex-direction: column; gap: 4pt; }
.rt-header-stacked .rt-contact { max-width: 100%; text-align: left; }
.rt-header-single-line .rt-header { align-items: baseline; }
.rt-header-single-line .rt-header h1 { font-size: ${pt(name?.fontSizePt, 20)}; }
.rt-header-sidebar .rt-header { display: grid; grid-template-columns: 30% 1fr; gap: 18pt; }
.rt-header-sidebar .rt-contact { max-width: none; text-align: left; }
.rt-header h1 { margin: 0; font-family: ${fontFamily(name)}; font-size: ${pt(name?.fontSizePt, 24)}; line-height: 1; color: ${name?.color ?? accent}; font-weight: ${name?.fontWeight ?? "700"}; }
.rt-contact { max-width: 55%; min-width: 0; text-align: right; font-family: ${fontFamily(metadata)}; font-size: ${pt(metadata?.fontSizePt, 9)}; color: ${metadata?.color ?? bodyColor}; line-height: ${metadata?.lineHeight ?? "1.25"}; overflow-wrap: anywhere; }
.rt-contact a { color: ${linkColor}; text-decoration: none; }
.rt-section { margin-top: ${pt(tokens.spacing.sectionGapPt?.value, 8)}; }
.rt-section-title-left-rail .rt-section { display: grid; grid-template-columns: 24% 1fr; column-gap: 14pt; align-items: start; }
.rt-section-title-left-rail .rt-section h2 { border-bottom: 0; padding-bottom: 0; }
.rt-section-title-inline .rt-section h2 { display: inline-block; margin-right: 8pt; }
.rt-section h2 { margin: 0 0 4pt; padding-bottom: 2pt; border-bottom: ${tokens.rules.sectionDivider?.widthPt ?? 0.75}pt ${tokens.rules.sectionDivider?.style ?? "solid"} ${ruleColor}; font-family: ${fontFamily(heading)}; font-size: ${pt(heading?.fontSizePt, 11)}; color: ${heading?.color ?? accent}; font-weight: ${heading?.fontWeight ?? "700"}; text-transform: ${heading?.textTransform ?? "uppercase"}; }
.rt-items { display: grid; gap: ${pt(tokens.spacing.itemGapPt?.value, 4)}; }
.rt-entry-head { display: flex; justify-content: space-between; gap: 12pt; align-items: baseline; min-width: 0; }
.rt-entry-head > div { min-width: 0; }
.rt-entry-head strong { font-family: ${fontFamily(entryTitle)}; font-size: ${pt(entryTitle?.fontSizePt, body?.fontSizePt ?? 10)}; color: ${entryTitle?.color ?? bodyColor}; font-weight: ${entryTitle?.fontWeight ?? "700"}; }
.rt-entry-head span { margin-left: 3pt; }
.rt-entry-head time { white-space: nowrap; text-align: right; font-size: ${pt(metadata?.fontSizePt, 9)}; color: ${metadata?.color ?? bodyColor}; }
.rt-date-inline .rt-entry-head { justify-content: flex-start; flex-wrap: wrap; }
.rt-date-inline .rt-entry-head time { margin-left: 4pt; }
.rt-date-below .rt-entry-head { display: block; }
.rt-date-below .rt-entry-head time { display: block; margin-top: 1pt; text-align: left; }
.rt-entry ul { margin: 2pt 0 0 13pt; padding: 0; }
.rt-entry ul.rt-list-decimal { list-style-type: decimal; }
.rt-entry ul.rt-list-dash, .rt-entry ul.rt-list-none { list-style: none; margin-left: 0; }
.rt-entry ul.rt-list-dash li::before { content: "- "; }
.rt-entry ul.rt-list-none li::before { content: ""; }
.rt-entry li { margin: 0 0 ${pt(tokens.spacing.bulletGapPt?.value, 1.5)}; }
.rt-entry-lines { margin-top: 2pt; display: grid; gap: ${pt(tokens.spacing.bulletGapPt?.value, 1.5)}; }
.rt-entry-lines p { margin: 0; }
.rt-skills { display: flex; flex-wrap: wrap; gap: ${pt(tokens.spacing.bulletGapPt?.value, 2)} 8pt; }
.rt-skills span { display: inline; }
.rt-skills-bullet span:not(:last-child)::after { content: " •"; }
.rt-skills-comma span:not(:last-child)::after { content: ","; }
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
