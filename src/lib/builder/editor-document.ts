import { SECTION_LABELS } from "@/lib/builder/section-manager";
import type { TailoredResume } from "@/lib/resume/generator";
import type { BankCategory, BankEntry, ContactInfo } from "@/types";

export interface EditableDocumentEntry {
  id: string;
  heading: string;
  subtitle: string;
  meta: string;
  body: string;
  bullets: string[];
}

export interface EditableDocumentSection {
  id: BankCategory;
  title: string;
  entries: EditableDocumentEntry[];
}

export interface EditableResumeDocument {
  sections: EditableDocumentSection[];
}

export type EditableEntryField = "heading" | "subtitle" | "meta" | "body";

export function createEditableResumeDocument(
  entries: BankEntry[],
  sectionOrder: BankCategory[],
  previousDocument?: EditableResumeDocument
): EditableResumeDocument {
  const nextDocument: EditableResumeDocument = {
    sections: sectionOrder.map((category) => ({
      id: category,
      title: SECTION_LABELS[category],
      entries: entries
        .filter((entry) => entry.category === category)
        .map(createEditableEntry),
    })),
  };

  if (!previousDocument) {
    return nextDocument;
  }

  const previousSections = new Map(
    previousDocument.sections.map((section) => [section.id, section])
  );

  return {
    sections: nextDocument.sections.map((section) => {
      const previousSection = previousSections.get(section.id);
      if (!previousSection) return section;

      const previousEntries = new Map(
        previousSection.entries.map((entry) => [entry.id, entry])
      );

      return {
        ...section,
        title: previousSection.title,
        entries: section.entries.map(
          (entry) => previousEntries.get(entry.id) ?? entry
        ),
      };
    }),
  };
}

export function updateEditableSectionTitle(
  document: EditableResumeDocument,
  sectionId: BankCategory,
  title: string
): EditableResumeDocument {
  return {
    sections: document.sections.map((section) =>
      section.id === sectionId ? { ...section, title } : section
    ),
  };
}

export function updateEditableEntryField(
  document: EditableResumeDocument,
  sectionId: BankCategory,
  entryId: string,
  field: EditableEntryField,
  value: string
): EditableResumeDocument {
  return {
    sections: document.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            entries: section.entries.map((entry) =>
              entry.id === entryId ? { ...entry, [field]: value } : entry
            ),
          }
        : section
    ),
  };
}

export function updateEditableEntryBullet(
  document: EditableResumeDocument,
  sectionId: BankCategory,
  entryId: string,
  bulletIndex: number,
  value: string
): EditableResumeDocument {
  return {
    sections: document.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            entries: section.entries.map((entry) =>
              entry.id === entryId
                ? {
                    ...entry,
                    bullets: entry.bullets.map((bullet, index) =>
                      index === bulletIndex ? value : bullet
                    ),
                  }
                : entry
            ),
          }
        : section
    ),
  };
}

export function reorderEditableDocumentSections(
  document: EditableResumeDocument,
  fromIndex: number,
  toIndex: number
): EditableResumeDocument {
  if (
    fromIndex < 0 ||
    fromIndex >= document.sections.length ||
    toIndex < 0 ||
    toIndex >= document.sections.length ||
    fromIndex === toIndex
  ) {
    return document;
  }

  const sections = [...document.sections];
  const [moved] = sections.splice(fromIndex, 1);
  sections.splice(toIndex, 0, moved);
  return { sections };
}

export function editableDocumentToResume(
  document: EditableResumeDocument,
  contact: ContactInfo = { name: "Your Name" }
): TailoredResume {
  const experiences: TailoredResume["experiences"] = [];
  const education: TailoredResume["education"] = [];
  const skills: string[] = [];
  const summaryParts: string[] = [];

  for (const section of document.sections) {
    for (const entry of section.entries) {
      switch (section.id) {
        case "experience":
        case "project":
        case "hackathon":
          experiences.push({
            title: entry.heading,
            company:
              entry.subtitle ||
              (section.id === "project"
                ? "Project"
                : section.id === "hackathon"
                  ? "Hackathon"
                  : ""),
            dates: entry.meta,
            highlights:
              entry.bullets.length > 0 ? entry.bullets : compact([entry.body]),
          });
          break;
        case "education": {
          const { degree, field } = splitEducationSubtitle(entry.subtitle);
          education.push({
            institution: entry.heading,
            degree,
            field,
            date: entry.meta,
          });
          break;
        }
        case "skill":
          skills.push(...compact([entry.heading]));
          break;
        case "certification":
          skills.push(formatCertificationSkill(entry));
          break;
        case "achievement":
          summaryParts.push(...compact([entry.body || entry.heading]));
          break;
      }
    }
  }

  return {
    contact,
    summary: summaryParts.join(". "),
    experiences,
    skills: compact(skills),
    education,
  };
}

function createEditableEntry(entry: BankEntry): EditableDocumentEntry {
  const content = entry.content;

  switch (entry.category) {
    case "experience":
      return {
        id: entry.id,
        heading: readString(content.title),
        subtitle: readString(content.company),
        meta: formatDateRange(content),
        body: readString(content.description),
        bullets: readStringArray(content.highlights),
      };
    case "education":
      return {
        id: entry.id,
        heading: readString(content.institution),
        subtitle: joinNonEmpty([readString(content.degree), readString(content.field)], ", "),
        meta: readString(content.endDate) || readString(content.startDate),
        body: "",
        bullets: readStringArray(content.highlights),
      };
    case "skill":
      return {
        id: entry.id,
        heading: readString(content.name),
        subtitle: readString(content.category),
        meta: readString(content.proficiency),
        body: "",
        bullets: [],
      };
    case "project":
      return {
        id: entry.id,
        heading: readString(content.name),
        subtitle: readString(content.url),
        meta: readStringArray(content.technologies).join(", "),
        body: readString(content.description),
        bullets: readStringArray(content.highlights),
      };
    case "hackathon":
      return {
        id: entry.id,
        heading: readString(content.name),
        subtitle: readString(content.organizer),
        meta: formatDateRange(content),
        body: readString(content.notes) || readString(content.submissionUrl),
        bullets: [
          ...readStringArray(content.prizes).map((prize) => `Prize: ${prize}`),
          ...readStringArray(content.tracks).map((track) => `Track: ${track}`),
          ...readStringArray(content.themes).map((theme) => `Theme: ${theme}`),
        ],
      };
    case "achievement":
      return {
        id: entry.id,
        heading: readString(content.title),
        subtitle: "",
        meta: readString(content.date),
        body: readString(content.description),
        bullets: [],
      };
    case "certification":
      return {
        id: entry.id,
        heading: readString(content.name),
        subtitle: readString(content.issuer),
        meta: readString(content.date),
        body: readString(content.url),
        bullets: [],
      };
  }
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(readString).filter(Boolean) : [];
}

function formatDateRange(content: Record<string, unknown>): string {
  const start = readString(content.startDate);
  const end = readString(content.endDate);
  const current = Boolean(content.current);

  if (!start && !end && !current) return "";
  return joinNonEmpty([start, end || (current ? "Present" : "")], " - ");
}

function joinNonEmpty(values: string[], separator: string): string {
  return values.filter(Boolean).join(separator);
}

function compact(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function splitEducationSubtitle(subtitle: string): {
  degree: string;
  field: string;
} {
  const [degree = "", ...fieldParts] = subtitle.split(",");
  return {
    degree: degree.trim(),
    field: fieldParts.join(",").trim(),
  };
}

function formatCertificationSkill(entry: EditableDocumentEntry): string {
  if (!entry.heading) return "";
  return entry.subtitle ? `${entry.heading} (${entry.subtitle})` : entry.heading;
}
