import type { Profile } from "@/types";
import type { InsertBankEntry } from "@/lib/db/profile-bank";
import {
  findDuplicateEntry,
  getDeduplicationKey,
  updateBankEntry,
  insertBankEntries,
} from "@/lib/db/profile-bank";

/**
 * Extract individual bank entries from parsed profile data.
 * Each data point becomes its own entry with category, content, and confidence.
 */
export function extractBankEntries(
  profile: Partial<Profile>,
  sourceDocumentId?: string
): InsertBankEntry[] {
  const entries: InsertBankEntry[] = [];

  if (profile.experiences) {
    for (const exp of profile.experiences) {
      entries.push({
        category: "experience",
        content: {
          company: exp.company,
          title: exp.title,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description,
          highlights: exp.highlights,
          skills: exp.skills,
        },
        sourceDocumentId,
        confidenceScore: 0.9,
      });

      // Extract individual achievements from highlights
      for (const highlight of exp.highlights) {
        if (highlight.trim()) {
          entries.push({
            category: "achievement",
            content: {
              description: highlight,
              context: `${exp.title} at ${exp.company}`,
              company: exp.company,
            },
            sourceDocumentId,
            confidenceScore: 0.85,
          });
        }
      }

      // Extract skills with usage context
      for (const skill of exp.skills) {
        if (skill.trim()) {
          entries.push({
            category: "skill",
            content: {
              name: skill,
              context: `Used as ${exp.title} at ${exp.company}`,
              company: exp.company,
              role: exp.title,
            },
            sourceDocumentId,
            confidenceScore: 0.9,
          });
        }
      }
    }
  }

  if (profile.education) {
    for (const edu of profile.education) {
      entries.push({
        category: "education",
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
        confidenceScore: 0.95,
      });
    }
  }

  if (profile.skills) {
    for (const skill of profile.skills) {
      entries.push({
        category: "skill",
        content: {
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
        },
        sourceDocumentId,
        confidenceScore: 0.85,
      });
    }
  }

  if (profile.projects) {
    for (const proj of profile.projects) {
      entries.push({
        category: "project",
        content: {
          name: proj.name,
          description: proj.description,
          url: proj.url,
          technologies: proj.technologies,
          highlights: proj.highlights,
        },
        sourceDocumentId,
        confidenceScore: 0.9,
      });
    }
  }

  if (profile.certifications) {
    for (const cert of profile.certifications) {
      entries.push({
        category: "certification",
        content: {
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          url: cert.url,
        },
        sourceDocumentId,
        confidenceScore: 0.95,
      });
    }
  }

  return entries;
}

/**
 * Process parsed profile data into the bank with deduplication.
 * If a duplicate is found, keeps the one with higher confidence.
 */
export function populateBankFromProfile(
  profile: Partial<Profile>,
  sourceDocumentId: string | undefined,
  userId: string = "default"
): { inserted: number; updated: number; skipped: number } {
  const entries = extractBankEntries(profile, sourceDocumentId);
  const toInsert: InsertBankEntry[] = [];
  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const dedupKey = getDeduplicationKey(entry.category, entry.content);
    const existing = findDuplicateEntry(entry.category, dedupKey, userId);

    if (existing) {
      const newConfidence = entry.confidenceScore ?? 0.8;
      if (newConfidence > existing.confidenceScore) {
        // Merge: update with higher confidence content
        updateBankEntry(existing.id, entry.content, newConfidence);
        updated++;
      } else {
        skipped++;
      }
    } else {
      toInsert.push(entry);
    }
  }

  if (toInsert.length > 0) {
    insertBankEntries(toInsert, userId);
  }

  return { inserted: toInsert.length, updated, skipped };
}
