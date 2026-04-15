import type { BankEntry, GroupedBankEntries } from "@/types";

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

/**
 * Extract keywords from a job description string.
 * Splits on common delimiters and filters noise words.
 */
export function extractKeywords(text: string): string[] {
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
function buildGapAnalysis(missingKeywords: string[]): GapItem[] {
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

  return missingKeywords
    .filter((kw) => kw.length > 2)
    .slice(0, 15)
    .map((kw) => {
      let category: GapItem["category"] = "other";
      let suggestion = `Consider adding "${kw}" to your knowledge bank`;

      if (SKILL_INDICATORS.some((s) => kw.includes(s) || s.includes(kw))) {
        category = "skill";
        suggestion = `Add "${kw}" skill with project examples to your bank`;
      } else if (CERT_INDICATORS.some((c) => kw.includes(c))) {
        category = "certification";
        suggestion = `Consider obtaining "${kw}" certification`;
      }

      return { requirement: kw, category, suggestion };
    });
}
