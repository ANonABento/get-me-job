import type { BankEntry, GroupedBankEntries } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";

export interface JobRequirement {
  text: string;
  category: "skill" | "experience" | "education" | "certification" | "other";
}

export interface GapItem {
  requirement: string;
  category: JobRequirement["category"];
  suggestion: string;
}

export interface BankMatch {
  entry: BankEntry;
  relevanceScore: number;
  matchedKeywords: string[];
}

export interface TailorAnalysis {
  matchScore: number;
  matchedEntries: BankMatch[];
  gaps: GapItem[];
  keywordsFound: string[];
  keywordsMissing: string[];
}

export interface ResumeFitAnalysis {
  matchScore: number;
  gaps: GapItem[];
  keywordsFound: string[];
  keywordsMissing: string[];
}

/**
 * Extract keywords from a job description string.
 * Splits on common delimiters and filters noise words.
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "must", "shall", "can",
  "need", "not", "no", "nor", "so", "if", "then", "than", "too", "very",
  "just", "about", "above", "after", "again", "all", "also", "am", "any",
  "because", "before", "below", "between", "both", "each", "few", "more",
  "most", "other", "our", "out", "over", "own", "same", "some", "such",
  "that", "their", "them", "these", "they", "this", "those", "through",
  "under", "until", "up", "we", "what", "when", "where", "which", "while",
  "who", "whom", "why", "you", "your", "its", "it", "he", "she", "his",
  "her", "my", "me", "us", "how", "into", "during", "only", "able",
  "work", "working", "role", "team", "company", "position", "job",
  "experience", "years", "year", "strong", "excellent", "good", "great",
  "required", "preferred", "plus", "including", "etc", "well", "new",
]);

const SKILL_INDICATORS = [
  "python", "java", "javascript", "typescript", "react", "node", "sql",
  "aws", "docker", "kubernetes", "git", "linux", "api", "rest", "graphql",
  "css", "html", "angular", "vue", "swift", "kotlin", "rust", "go",
  "c++", "c#", ".net", "ruby", "php", "scala", "terraform", "ci/cd",
  "agile", "scrum", "jira", "figma", "sketch", "photoshop",
  "machine learning", "deep learning", "data science", "analytics",
  "tableau", "power bi", "excel", "salesforce", "sap",
];

const CERT_INDICATORS = [
  "certified", "certification", "certificate", "pmp", "aws certified",
  "cpa", "cfa", "cissp", "comptia",
];

export function extractKeywords(text: string): string[] {

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  // Also extract multi-word phrases (bigrams) for compound skills
  const normalized = text.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    if (!STOP_WORDS.has(tokens[i]) && !STOP_WORDS.has(tokens[i + 1])) {
      bigrams.push(bigram);
    }
  }

  // Deduplicate
  return Array.from(new Set([...words, ...bigrams]));
}

/**
 * Score how well a bank entry matches a set of keywords.
 */
export function scoreBankEntry(
  entry: BankEntry,
  keywords: string[]
): BankMatch | null {
  const contentStr = JSON.stringify(entry.content).toLowerCase();
  const matchedKeywords: string[] = [];

  for (const kw of keywords) {
    if (contentStr.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length === 0) return null;

  const relevanceScore = Math.min(
    1,
    (matchedKeywords.length / Math.max(keywords.length, 1)) * 2
  );

  return {
    entry,
    relevanceScore: Math.round(relevanceScore * 100) / 100,
    matchedKeywords,
  };
}

export function resumeToKeywordSearchText(resume: TailoredResume): string {
  const parts: string[] = [
    resume.contact.name,
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.summary,
    resume.skills.join(" "),
  ].filter((part): part is string => Boolean(part));

  for (const experience of resume.experiences) {
    parts.push(
      experience.title,
      experience.company,
      experience.dates,
      experience.highlights.join(" ")
    );
  }

  for (const education of resume.education) {
    parts.push(
      education.institution,
      education.degree,
      education.field,
      education.date
    );
  }

  return parts.join(" ").toLowerCase();
}

export function analyzeResumeFit(
  jobDescription: string,
  resume: TailoredResume,
  jobKeywords?: string[]
): ResumeFitAnalysis {
  const keywords = jobKeywords ?? extractKeywords(jobDescription);
  const resumeText = resumeToKeywordSearchText(resume);
  const keywordsFound = keywords.filter((kw) => resumeText.includes(kw));
  const keywordsMissing = keywords.filter((kw) => !resumeText.includes(kw));
  const matchScore =
    keywords.length > 0
      ? Math.round((keywordsFound.length / keywords.length) * 100)
      : 0;

  return {
    matchScore,
    gaps: buildGapAnalysis(keywordsMissing),
    keywordsFound,
    keywordsMissing,
  };
}

/**
 * Analyze how well the knowledge bank covers a job description.
 * Returns matched entries, gaps, and an overall match score.
 */
export function analyzeJobFit(
  jobDescription: string,
  bankEntries: GroupedBankEntries,
  jobKeywords?: string[]
): TailorAnalysis {
  const keywords = jobKeywords ?? extractKeywords(jobDescription);
  const allEntries: BankEntry[] = Object.values(bankEntries).flat();

  // Score each bank entry
  const matches: BankMatch[] = [];
  for (const entry of allEntries) {
    const match = scoreBankEntry(entry, keywords);
    if (match) {
      matches.push(match);
    }
  }

  // Sort by relevance
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Determine which keywords are covered
  const coveredKeywords = new Set<string>();
  for (const match of matches) {
    for (const kw of match.matchedKeywords) {
      coveredKeywords.add(kw);
    }
  }

  const keywordsFound = keywords.filter((kw) => coveredKeywords.has(kw));
  const keywordsMissing = keywords.filter((kw) => !coveredKeywords.has(kw));

  // Build gap analysis
  const gaps = buildGapAnalysis(keywordsMissing);

  // Calculate overall match score
  const matchScore =
    keywords.length > 0
      ? Math.round((keywordsFound.length / keywords.length) * 100)
      : 0;

  return {
    matchScore,
    matchedEntries: matches,
    gaps,
    keywordsFound,
    keywordsMissing,
  };
}

/**
 * Categorize missing keywords into actionable gap items.
 */
export function buildGapAnalysis(missingKeywords: string[]): GapItem[] {
  return missingKeywords
    .filter((kw) => kw.length > 2)
    .slice(0, 15)
    .map((kw) => {
      let category: GapItem["category"] = "other";
      let suggestion = `Add "${kw}" where it fits in your resume summary or experience bullets`;

      if (SKILL_INDICATORS.some((s) => kw.includes(s) || s.includes(kw))) {
        category = "skill";
        suggestion = `Add "${kw}" to Skills and support it with a project or experience bullet`;
      } else if (CERT_INDICATORS.some((c) => kw.includes(c))) {
        category = "certification";
        suggestion = `Add "${kw}" to Certifications if you have it, otherwise leave it out`;
      }

      return { requirement: kw, category, suggestion };
    });
}
