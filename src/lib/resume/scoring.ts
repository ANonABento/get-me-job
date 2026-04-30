import type { BankCategory, BankEntry } from "@/types";

export interface ResumeScoreBreakdown {
  completeness: number;
  keywordDensity: number;
  length: number;
  actionVerbs: number;
  quantifiedAchievements: number;
}

export interface ResumeScoreResult {
  overall: number;
  breakdown: ResumeScoreBreakdown;
  stats: {
    actionVerbCount: number;
    matchedKeywordCount: number;
    quantifiedAchievementCount: number;
    totalKeywordCount: number;
    wordCount: number;
  };
}

interface CalculateResumeScoreOptions {
  entries?: BankEntry[];
  jobDescription?: string;
  resumeText: string;
}

const SECTION_WEIGHTS: Record<BankCategory, number> = {
  experience: 28,
  skill: 20,
  project: 16,
  education: 12,
  achievement: 10,
  certification: 8,
  hackathon: 6,
};

const SCORE_WEIGHTS: Record<keyof ResumeScoreBreakdown, number> = {
  completeness: 30,
  keywordDensity: 25,
  length: 15,
  actionVerbs: 15,
  quantifiedAchievements: 15,
};

const ACTION_VERBS = [
  "accelerated",
  "achieved",
  "architected",
  "automated",
  "built",
  "created",
  "delivered",
  "designed",
  "developed",
  "drove",
  "enabled",
  "engineered",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "optimized",
  "reduced",
  "shipped",
  "streamlined",
];

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "build",
  "can",
  "for",
  "from",
  "have",
  "into",
  "job",
  "looking",
  "our",
  "role",
  "that",
  "the",
  "this",
  "with",
  "will",
  "work",
  "you",
  "your",
]);

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeText(text: string): string {
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(text: string): string[] {
  return (
    normalizeText(text)
      .toLowerCase()
      .match(/[a-z][a-z0-9+#.-]*/g) ?? []
  );
}

function getResumeWordSet(resumeText: string): Set<string> {
  return new Set(getWords(resumeText));
}

function calculateLengthScore(wordCount: number): number {
  if (wordCount <= 0) return 0;
  if (wordCount < 250) return clampScore((wordCount / 250) * 60);
  if (wordCount <= 750) return 100;
  if (wordCount <= 1000)
    return clampScore(100 - ((wordCount - 750) / 250) * 25);
  return 60;
}

function calculateActionVerbScore(words: string[]): {
  count: number;
  score: number;
} {
  const verbSet = new Set(ACTION_VERBS);
  const count = words.filter((word) => verbSet.has(word)).length;

  return {
    count,
    score: clampScore((count / 8) * 100),
  };
}

function calculateQuantifiedAchievementScore(text: string): {
  count: number;
  score: number;
} {
  const normalized = normalizeText(text);
  const matches =
    normalized.match(
      /\b(?:\d+(?:[.,]\d+)?\s?(?:%|x|k|m|b|\+)?|\$[\d,.]+[kmb]?)\b/gi,
    ) ?? [];
  const count = matches.length;

  return {
    count,
    score: clampScore((count / 5) * 100),
  };
}

function extractEntryText(entry: BankEntry): string {
  function flatten(value: unknown): string[] {
    if (typeof value === "string" || typeof value === "number") {
      return [String(value)];
    }

    if (Array.isArray(value)) return value.flatMap(flatten);

    if (value && typeof value === "object") {
      return Object.values(value).flatMap(flatten);
    }

    return [];
  }

  return flatten(entry.content).join(" ");
}

function calculateCompletenessScore(
  resumeText: string,
  entries: BankEntry[],
): number {
  if (entries.length > 0) {
    const includedCategories = new Set(entries.map((entry) => entry.category));
    const weightedScore = Object.entries(SECTION_WEIGHTS).reduce(
      (sum, [category, weight]) =>
        includedCategories.has(category as BankCategory) ? sum + weight : sum,
      0,
    );
    return clampScore(weightedScore);
  }

  const text = normalizeText(resumeText).toLowerCase();
  const sectionSignals = [
    /experience|employment|work history/,
    /skills|technologies|tools/,
    /education|degree|university|college/,
    /project|portfolio/,
    /summary|profile|objective/,
  ];
  const matchedSignals = sectionSignals.filter((pattern) =>
    pattern.test(text),
  ).length;

  return clampScore((matchedSignals / sectionSignals.length) * 100);
}

function extractJobKeywords(jobDescription: string): string[] {
  const counts = new Map<string, number>();
  for (const word of getWords(jobDescription)) {
    if (word.length < 3 || STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 24)
    .map(([word]) => word);
}

function calculateKeywordDensityScore(
  resumeText: string,
  jobDescription = "",
): {
  matchedKeywordCount: number;
  score: number;
  totalKeywordCount: number;
} {
  const keywords = extractJobKeywords(jobDescription);
  if (keywords.length === 0) {
    return {
      matchedKeywordCount: 0,
      score: 100,
      totalKeywordCount: 0,
    };
  }

  const resumeWords = getResumeWordSet(resumeText);
  const matchedKeywordCount = keywords.filter((keyword) =>
    resumeWords.has(keyword),
  ).length;

  return {
    matchedKeywordCount,
    score: clampScore((matchedKeywordCount / keywords.length) * 100),
    totalKeywordCount: keywords.length,
  };
}

export function calculateResumeScore({
  entries = [],
  jobDescription = "",
  resumeText,
}: CalculateResumeScoreOptions): ResumeScoreResult {
  const entryText = entries.map(extractEntryText).join(" ");
  const combinedResumeText = [resumeText, entryText].filter(Boolean).join(" ");
  const words = getWords(combinedResumeText);
  const wordCount = words.length;
  const keywordDensity = calculateKeywordDensityScore(
    combinedResumeText,
    jobDescription,
  );
  const actionVerbs = calculateActionVerbScore(words);
  const quantifiedAchievements =
    calculateQuantifiedAchievementScore(combinedResumeText);

  const breakdown: ResumeScoreBreakdown = {
    completeness: calculateCompletenessScore(combinedResumeText, entries),
    keywordDensity: keywordDensity.score,
    length: calculateLengthScore(wordCount),
    actionVerbs: actionVerbs.score,
    quantifiedAchievements: quantifiedAchievements.score,
  };

  const overall = clampScore(
    Object.entries(breakdown).reduce(
      (sum, [key, score]) =>
        sum + (score * SCORE_WEIGHTS[key as keyof ResumeScoreBreakdown]) / 100,
      0,
    ),
  );

  return {
    overall,
    breakdown,
    stats: {
      actionVerbCount: actionVerbs.count,
      matchedKeywordCount: keywordDensity.matchedKeywordCount,
      quantifiedAchievementCount: quantifiedAchievements.count,
      totalKeywordCount: keywordDensity.totalKeywordCount,
      wordCount,
    },
  };
}
