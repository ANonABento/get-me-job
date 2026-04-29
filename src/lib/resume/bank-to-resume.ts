import type { BankEntry } from "@/types";
import type { TailoredResume } from "./generator";
import type { ContactInfo } from "@/types";
import { formatHackathonHighlights } from "./hackathon-highlights";

/**
 * Convert selected bank entries into the TailoredResume structure
 * that generateResumeHTML expects.
 */
export function bankEntriesToResume(
  entries: BankEntry[],
  contact: ContactInfo = { name: "Your Name" }
): TailoredResume {
  const experiences: TailoredResume["experiences"] = [];
  const skills: string[] = [];
  const education: TailoredResume["education"] = [];
  const summaryParts: string[] = [];

  for (const entry of entries) {
    const c = entry.content;
    switch (entry.category) {
      case "experience":
        experiences.push({
          company: String(c.company || ""),
          title: String(c.title || ""),
          dates: formatExperienceDates(c),
          highlights: Array.isArray(c.highlights)
            ? c.highlights.map(String)
            : c.description
            ? [String(c.description)]
            : [],
        });
        break;
      case "skill":
        if (c.name) skills.push(String(c.name));
        break;
      case "education":
        education.push({
          institution: String(c.institution || ""),
          degree: String(c.degree || ""),
          field: String(c.field || ""),
          date: c.endDate ? String(c.endDate) : c.startDate ? String(c.startDate) : "",
        });
        break;
      case "achievement":
        if (c.description) summaryParts.push(String(c.description));
        break;
      case "certification":
        if (c.name) {
          const cert = c.issuer ? `${c.name} (${c.issuer})` : String(c.name);
          skills.push(cert);
        }
        break;
      case "project":
        experiences.push({
          company: "Project",
          title: String(c.name || ""),
          dates: "",
          highlights: Array.isArray(c.highlights)
            ? c.highlights.map(String)
            : c.description
            ? [String(c.description)]
            : [],
        });
        break;
      case "hackathon":
        experiences.push({
          company: String(c.organizer || "Hackathon"),
          title: String(c.name || ""),
          dates: formatExperienceDates(c),
          highlights: formatHackathonHighlights(c),
        });
        break;
    }
  }

  return {
    contact,
    summary: summaryParts.length > 0 ? summaryParts.join(". ") : "",
    experiences,
    skills,
    education,
  };
}

function formatExperienceDates(c: Record<string, unknown>): string {
  const parts: string[] = [];
  if (c.startDate) parts.push(String(c.startDate));
  if (c.endDate) parts.push(String(c.endDate));
  else if (c.current) parts.push("Present");
  return parts.join(" — ");
}
