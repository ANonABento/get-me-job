import type { Profile } from "@/types";
import type { ATSIssue, KeywordAnalysis } from "./analyzer";

export type FixType =
  | "add_keyword"
  | "rewrite_bullet"
  | "replace_character"
  | "add_section"
  | "add_metrics";

export type FixPriority = "high" | "medium" | "low";

export interface FixSuggestion {
  id: string;
  type: FixType;
  priority: FixPriority;
  title: string;
  description: string;
  section: string;
  originalText?: string;
  replacementText: string;
  estimatedImpact: number;
}

const PROBLEMATIC_CHARACTERS: Record<string, string> = {
  "\u2022": "-",
  "\u2013": "-",
  "\u2014": "-",
  "\u201c": '"',
  "\u201d": '"',
  "\u2018": "'",
  "\u2019": "'",
  "\u2026": "...",
  "\u00a9": "(c)",
  "\u00ae": "(R)",
  "\u2122": "(TM)",
};

export function calculateFixPriority(estimatedImpact: number): FixPriority {
  if (estimatedImpact > 5) return "high";
  if (estimatedImpact >= 2) return "medium";
  return "low";
}

export function generateFixSuggestions(
  profile: Profile,
  issues: ATSIssue[],
  keywords: KeywordAnalysis[]
): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];
  let idCounter = 1;

  const nextId = () => `fix-${idCounter++}`;

  // Type 1: Add missing keywords to skills section
  const missingKeywords = keywords.filter((k) => !k.found);
  for (const kw of missingKeywords) {
    const impact = 6;
    suggestions.push({
      id: nextId(),
      type: "add_keyword",
      priority: calculateFixPriority(impact),
      title: `Add keyword "${kw.keyword}" to skills section`,
      description: `The keyword "${kw.keyword}" appears in the job description but is missing from your resume.`,
      section: "skills",
      replacementText: kw.keyword,
      estimatedImpact: impact,
    });
  }

  // Type 2: Rewrite bullets without metrics
  for (const exp of profile.experiences) {
    for (const highlight of exp.highlights) {
      const hasMetric = /\d+%|\$\d+|\d+\+?\s*(people|users|clients|projects|team|developers|engineers|members|employees|customers|partners)/i.test(highlight);
      if (!hasMetric && highlight.length > 10) {
        const impact = 4;
        suggestions.push({
          id: nextId(),
          type: "rewrite_bullet",
          priority: calculateFixPriority(impact),
          title: "Add metrics to bullet point",
          description: `Quantify the impact in: "${truncate(highlight, 60)}"`,
          section: "experience",
          originalText: highlight,
          replacementText: `${highlight} [Add specific metrics: %, $, or numbers]`,
          estimatedImpact: impact,
        });
      }
    }
  }

  // Type 3: Replace special characters
  const fullText = extractFullText(profile);
  for (const [char, replacement] of Object.entries(PROBLEMATIC_CHARACTERS)) {
    if (fullText.includes(char)) {
      const charName = getCharName(char);
      const impact = 3;
      suggestions.push({
        id: nextId(),
        type: "replace_character",
        priority: calculateFixPriority(impact),
        title: `Replace special character "${charName}"`,
        description: `The character "${charName}" (${char}) may not be parsed correctly by ATS systems.`,
        section: "formatting",
        originalText: char,
        replacementText: replacement,
        estimatedImpact: impact,
      });
    }
  }

  // Type 4: Add missing sections
  const missingSectionIssues = issues.filter(
    (i) => i.category === "structure" && i.type === "error"
  );
  for (const issue of missingSectionIssues) {
    const impact = 8;
    const section = inferSectionFromIssue(issue);
    suggestions.push({
      id: nextId(),
      type: "add_section",
      priority: calculateFixPriority(impact),
      title: `Add ${section} section`,
      description: issue.description,
      section,
      replacementText: `[Add your ${section} here]`,
      estimatedImpact: impact,
    });
  }

  // Type 5: Add action verbs to weak bullets
  const weakActionVerbIssue = issues.find(
    (i) => i.category === "content" && i.title.toLowerCase().includes("action verb")
  );
  if (weakActionVerbIssue) {
    for (const exp of profile.experiences) {
      for (const highlight of exp.highlights) {
        const startsWithWeak = /^(did|was|had|got|made|went|used|helped)\b/i.test(highlight.trim());
        if (startsWithWeak) {
          const impact = 3;
          const strongVerb = suggestStrongVerb(highlight);
          suggestions.push({
            id: nextId(),
            type: "add_metrics",
            priority: calculateFixPriority(impact),
            title: "Strengthen bullet with action verb",
            description: `Replace weak opening in: "${truncate(highlight, 60)}"`,
            section: "experience",
            originalText: highlight,
            replacementText: strongVerb,
            estimatedImpact: impact,
          });
        }
      }
    }
  }

  // Sort by impact descending
  suggestions.sort((a, b) => b.estimatedImpact - a.estimatedImpact);

  return suggestions;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

function extractFullText(profile: Profile): string {
  const parts: string[] = [];
  if (profile.summary) parts.push(profile.summary);
  for (const exp of profile.experiences) {
    parts.push(exp.description);
    parts.push(...exp.highlights);
  }
  return parts.join(" ");
}

function getCharName(char: string): string {
  const names: Record<string, string> = {
    "\u2022": "bullet",
    "\u2013": "en dash",
    "\u2014": "em dash",
    "\u201c": "left curly quote",
    "\u201d": "right curly quote",
    "\u2018": "left curly apostrophe",
    "\u2019": "right curly apostrophe",
    "\u2026": "ellipsis",
    "\u00a9": "copyright",
    "\u00ae": "registered",
    "\u2122": "trademark",
  };
  return names[char] || "special character";
}

function inferSectionFromIssue(issue: ATSIssue): string {
  const lower = issue.title.toLowerCase();
  if (lower.includes("experience") || lower.includes("work")) return "experience";
  if (lower.includes("education")) return "education";
  if (lower.includes("skill")) return "skills";
  if (lower.includes("summary")) return "summary";
  return "general";
}

function suggestStrongVerb(highlight: string): string {
  const replacements: Record<string, string> = {
    did: "Executed",
    was: "Served as",
    had: "Managed",
    got: "Achieved",
    made: "Developed",
    went: "Transitioned",
    used: "Leveraged",
    helped: "Facilitated",
  };

  const trimmed = highlight.trim();
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
  const replacement = replacements[firstWord];

  if (replacement) {
    return replacement + trimmed.slice(firstWord.length);
  }
  return trimmed;
}
