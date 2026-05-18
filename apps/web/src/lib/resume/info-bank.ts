import type { ParsedDocumentData, Profile } from "@/types";
import type { InsertBankEntry } from "@/lib/db/profile-bank";
import {
  deleteBankEntriesBySource,
  insertBankEntries,
} from "@/lib/db/profile-bank";
import { generateId } from "@/lib/utils";

function cleanList(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => value.trim()).filter(Boolean);
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function descriptionIsOnlyHighlights(
  description: string | undefined,
  highlights: string[],
): boolean {
  const cleanDescription = normalizeText(description ?? "");
  if (!cleanDescription || highlights.length === 0) return false;

  const newlineJoined = normalizeText(highlights.join("\n"));
  const spaceJoined = normalizeText(highlights.join(" "));
  return cleanDescription === newlineJoined || cleanDescription === spaceJoined;
}

function parentKey(parts: Array<string | undefined>): string {
  return parts
    .filter(Boolean)
    .map((part) => normalizeText(String(part)).toLowerCase())
    .join("|");
}

function uniqueList(values: string[] | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of cleanList(values)) {
    const key = normalizeText(value).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function textContent(value: string): Record<string, unknown> {
  return {
    text: value,
    description: value,
  };
}

/**
 * Extract individual bank entries from parsed profile data.
 * Each data point becomes its own entry with category, content, and confidence.
 */
export function extractBankEntries(
  profile: Partial<Profile>,
  sourceDocumentId?: string,
): InsertBankEntry[] {
  const entries: InsertBankEntry[] = [];
  let sourceOrder = 0;
  const nextSourceOrder = () => sourceOrder++;

  if (profile.experiences) {
    for (const exp of profile.experiences) {
      const parentId = generateId();
      const highlights = cleanList(exp.highlights);
      const skills = cleanList(exp.skills);
      const description = descriptionIsOnlyHighlights(
        exp.description,
        highlights,
      )
        ? ""
        : (exp.description ?? "");
      const expParentKey = parentKey([exp.company, exp.title, exp.startDate]);

      entries.push({
        id: parentId,
        category: "experience",
        sourceOrder: nextSourceOrder(),
        content: {
          company: exp.company,
          title: exp.title,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description,
          highlights: [],
          childCount: highlights.length,
          skills,
        },
        sourceDocumentId,
        sourceSection: "experience",
        confidenceScore: 0.9,
      });

      // Extract individual resume bullets from highlights. These are reusable
      // child components, not standalone achievements/awards.
      highlights.forEach((highlight, index) => {
        entries.push({
          category: "bullet",
          sourceOrder: nextSourceOrder(),
          content: {
            description: highlight,
            context: `${exp.title} at ${exp.company}`,
            company: exp.company,
            role: exp.title,
            parentType: "experience",
            parentId,
            parentKey: expParentKey,
            parentLabel: `${exp.title} at ${exp.company}`,
            order: index,
          },
          sourceDocumentId,
          sourceSection: "experience",
          confidenceScore: 0.85,
        });
      });

      // Extract skills with usage context
      for (const skill of skills) {
        entries.push({
          category: "skill",
          sourceOrder: nextSourceOrder(),
          content: {
            name: skill,
            context: `Used as ${exp.title} at ${exp.company}`,
            company: exp.company,
            role: exp.title,
          },
          sourceDocumentId,
          sourceSection: "experience",
          confidenceScore: 0.9,
        });
      }
    }
  }

  if (profile.education) {
    for (const edu of profile.education) {
      entries.push({
        category: "education",
        sourceOrder: nextSourceOrder(),
        content: {
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          highlights: edu.highlights,
        },
        sourceDocumentId,
        sourceSection: "education",
        confidenceScore: 0.95,
      });
    }
  }

  if (profile.skills) {
    for (const skill of profile.skills) {
      entries.push({
        category: "skill",
        sourceOrder: nextSourceOrder(),
        content: {
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
        },
        sourceDocumentId,
        sourceSection: "skills",
        confidenceScore: 0.85,
      });
    }
  }

  if (profile.projects) {
    for (const proj of profile.projects) {
      const parentId = generateId();
      const highlights = cleanList(proj.highlights);
      const description = descriptionIsOnlyHighlights(
        proj.description,
        highlights,
      )
        ? ""
        : (proj.description ?? "");
      const projectParentKey = parentKey([proj.name]);

      entries.push({
        id: parentId,
        category: "project",
        sourceOrder: nextSourceOrder(),
        content: {
          name: proj.name,
          description,
          url: proj.url,
          technologies: proj.technologies,
          highlights: [],
          childCount: highlights.length,
        },
        sourceDocumentId,
        sourceSection: "projects",
        confidenceScore: 0.9,
      });

      highlights.forEach((highlight, index) => {
        entries.push({
          category: "bullet",
          sourceOrder: nextSourceOrder(),
          content: {
            description: highlight,
            context: proj.name,
            project: proj.name,
            technologies: proj.technologies,
            parentType: "project",
            parentId,
            parentKey: projectParentKey,
            parentLabel: proj.name,
            order: index,
          },
          sourceDocumentId,
          sourceSection: "projects",
          confidenceScore: 0.85,
        });
      });
    }
  }

  if (profile.certifications) {
    for (const cert of profile.certifications) {
      entries.push({
        category: "certification",
        sourceOrder: nextSourceOrder(),
        content: {
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          url: cert.url,
        },
        sourceDocumentId,
        sourceSection: "certifications",
        confidenceScore: 0.95,
      });
    }
  }

  return entries;
}

/**
 * Process parsed profile data into the bank.
 * Source-file re-parses replace entries from the same source document, but
 * content-level dedupe is intentionally avoided so legitimate edits survive.
 */
export function populateBankFromProfile(
  profile: Partial<Profile>,
  sourceDocumentId: string | undefined,
  userId: string,
): { inserted: number; updated: number; skipped: number } {
  const entries = extractBankEntries(profile, sourceDocumentId);

  if (sourceDocumentId) {
    deleteBankEntriesBySource(sourceDocumentId, userId);
  }

  if (entries.length > 0) {
    insertBankEntries(entries, userId);
  }

  return { inserted: entries.length, updated: 0, skipped: 0 };
}

export function extractBankEntriesFromParsedDocument(
  parsedData: Exclude<ParsedDocumentData, { docType: "resume" }>,
  sourceDocumentId?: string,
): InsertBankEntry[] {
  const entries: InsertBankEntry[] = [];
  let sourceOrder = 0;
  const nextSourceOrder = () => sourceOrder++;

  if (parsedData.docType === "cover_letter") {
    const data = parsedData.data;
    for (const paragraph of uniqueList(data.reusableParagraphs)) {
      entries.push({
        category: "paragraph",
        sourceOrder: nextSourceOrder(),
        content: {
          ...textContent(paragraph),
          targetCompany: data.targetCompany,
          targetPosition: data.targetPosition,
          tone: data.tone,
          relatedSellingPoints: uniqueList(data.keySellingPoints),
        },
        sourceDocumentId,
        sourceSection: "cover_letter",
        confidenceScore: 0.82,
      });
    }
    for (const point of uniqueList(data.keySellingPoints)) {
      entries.push({
        category: "bullet",
        sourceOrder: nextSourceOrder(),
        content: {
          description: point,
          context: "Cover letter selling point",
          targetCompany: data.targetCompany,
          targetPosition: data.targetPosition,
          sourceSection: "cover_letter",
        },
        sourceDocumentId,
        sourceSection: "cover_letter",
        confidenceScore: 0.78,
      });
    }
  }

  if (parsedData.docType === "portfolio") {
    const data = parsedData.data;
    const globalTechnologies = uniqueList(data.technologies);
    const explicitSkills = new Set<string>();
    for (const technology of globalTechnologies) explicitSkills.add(technology);

    for (const project of data.projects) {
      const parentId = generateId();
      const technologies = uniqueList(project.technologies);
      for (const technology of technologies) explicitSkills.add(technology);
      const bullets = uniqueList([...project.bullets, ...project.proofPoints]);

      entries.push({
        id: parentId,
        category: "project",
        sourceOrder: nextSourceOrder(),
        content: {
          name: project.name,
          description: project.description ?? "",
          url: project.url,
          technologies,
          proofPoints: uniqueList(project.proofPoints),
          highlights: [],
          childCount: bullets.length,
        },
        sourceDocumentId,
        sourceSection: "portfolio",
        confidenceScore: 0.84,
      });

      bullets.forEach((bullet, index) => {
        entries.push({
          category: "bullet",
          sourceOrder: nextSourceOrder(),
          content: {
            description: bullet,
            context: project.name,
            project: project.name,
            technologies,
            parentType: "project",
            parentId,
            parentKey: parentKey([project.name]),
            parentLabel: project.name,
            order: index,
            sourceSection: "portfolio",
          },
          sourceDocumentId,
          sourceSection: "portfolio",
          confidenceScore: 0.78,
        });
      });
    }

    for (const technology of explicitSkills) {
      entries.push({
        category: "skill",
        sourceOrder: nextSourceOrder(),
        content: {
          name: technology,
          category: "technical",
          context: "Explicit portfolio stack",
        },
        sourceDocumentId,
        sourceSection: "portfolio",
        confidenceScore: 0.76,
      });
    }

    for (const proofPoint of uniqueList(data.proofPoints)) {
      entries.push({
        category: "achievement",
        sourceOrder: nextSourceOrder(),
        content: {
          description: proofPoint,
          sourceSection: "portfolio",
        },
        sourceDocumentId,
        sourceSection: "portfolio",
        confidenceScore: 0.74,
      });
    }
  }

  if (parsedData.docType === "career_notes") {
    const data = parsedData.data;
    for (const paragraph of uniqueList(data.paragraphs)) {
      entries.push({
        category: "paragraph",
        sourceOrder: nextSourceOrder(),
        content: {
          ...textContent(paragraph),
          sourceSection: "career_notes",
        },
        sourceDocumentId,
        sourceSection: "career_notes",
        confidenceScore: 0.62,
      });
    }
    for (const bullet of uniqueList(data.bullets)) {
      entries.push({
        category: "bullet",
        sourceOrder: nextSourceOrder(),
        content: {
          description: bullet,
          context: "Career notes",
          sourceSection: "career_notes",
        },
        sourceDocumentId,
        sourceSection: "career_notes",
        confidenceScore: 0.58,
      });
    }
    for (const achievement of uniqueList(data.achievements)) {
      entries.push({
        category: "achievement",
        sourceOrder: nextSourceOrder(),
        content: {
          description: achievement,
          sourceSection: "career_notes",
        },
        sourceDocumentId,
        sourceSection: "career_notes",
        confidenceScore: 0.6,
      });
    }
    for (const project of data.projects) {
      const parentId = generateId();
      const bullets = uniqueList(project.bullets);
      const technologies = uniqueList(project.technologies);
      entries.push({
        id: parentId,
        category: "project",
        sourceOrder: nextSourceOrder(),
        content: {
          name: project.name,
          description: project.description ?? "",
          technologies,
          highlights: [],
          childCount: bullets.length,
        },
        sourceDocumentId,
        sourceSection: "career_notes",
        confidenceScore: 0.6,
      });
      bullets.forEach((bullet, index) => {
        entries.push({
          category: "bullet",
          sourceOrder: nextSourceOrder(),
          content: {
            description: bullet,
            context: project.name,
            project: project.name,
            technologies,
            parentType: "project",
            parentId,
            parentKey: parentKey([project.name]),
            parentLabel: project.name,
            order: index,
            sourceSection: "career_notes",
          },
          sourceDocumentId,
          sourceSection: "career_notes",
          confidenceScore: 0.56,
        });
      });
    }
    for (const skill of uniqueList(data.skills)) {
      entries.push({
        category: "skill",
        sourceOrder: nextSourceOrder(),
        content: {
          name: skill,
          category: "other",
          context: "Explicit career notes skill",
        },
        sourceDocumentId,
        sourceSection: "career_notes",
        confidenceScore: 0.58,
      });
    }
  }

  return entries;
}

export function populateBankFromParsedDocument(
  parsedData: Exclude<ParsedDocumentData, { docType: "resume" }>,
  sourceDocumentId: string | undefined,
  userId: string,
): { inserted: number; updated: number; skipped: number } {
  const entries = extractBankEntriesFromParsedDocument(
    parsedData,
    sourceDocumentId,
  );

  if (sourceDocumentId) {
    deleteBankEntriesBySource(sourceDocumentId, userId);
  }

  if (entries.length > 0) {
    insertBankEntries(entries, userId);
  }

  return { inserted: entries.length, updated: 0, skipped: 0 };
}
