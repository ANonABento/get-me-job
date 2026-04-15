import type { Profile, JobDescription } from "@/types";

export interface ATSIssue {
  type: "error" | "warning" | "info";
  category: "formatting" | "content" | "keywords" | "structure";
  title: string;
  description: string;
  suggestion: string;
}

export interface KeywordAnalysis {
  keyword: string;
  found: boolean;
  frequency: number;
  locations: string[];
}

export interface ATSScore {
  overall: number;
  formatting: number;
  keywords: number;
  content: number;
  structure: number;
}

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

export interface SectionBreakdown {
  section: string;
  score: number;
  weight: number;
  weightedScore: number;
  issueCount: number;
}

export interface KeywordHeatmap {
  found: KeywordAnalysis[];
  missing: KeywordAnalysis[];
  matchRate: number;
  bySection: Record<string, { found: string[]; missing: string[] }>;
}

export interface IndustryBenchmark {
  percentile: number;
  averageScore: number;
  topPerformerScore: number;
}

export interface ATSScanReport {
  score: ATSScore;
  letterGrade: LetterGrade;
  issues: ATSIssue[];
  keywords: KeywordAnalysis[];
  keywordHeatmap: KeywordHeatmap;
  sectionBreakdown: SectionBreakdown[];
  benchmark: IndustryBenchmark;
  summary: string;
  recommendations: string[];
  scannedAt: string;
}

export interface ATSAnalysisResult {
  score: ATSScore;
  issues: ATSIssue[];
  keywords: KeywordAnalysis[];
  summary: string;
  recommendations: string[];
}

export const PROBLEMATIC_CHARACTERS = [
  { char: "\u2022", name: "bullet point", replacement: "-" },
  { char: "\u2013", name: "en dash", replacement: "-" },
  { char: "\u2014", name: "em dash", replacement: "-" },
  { char: "\u201c", name: "curly quote left", replacement: '"' },
  { char: "\u201d", name: "curly quote right", replacement: '"' },
  { char: "\u2018", name: "curly apostrophe left", replacement: "'" },
  { char: "\u2019", name: "curly apostrophe right", replacement: "'" },
  { char: "\u2026", name: "ellipsis", replacement: "..." },
  { char: "\u00a9", name: "copyright", replacement: "(c)" },
  { char: "\u00ae", name: "registered", replacement: "(R)" },
  { char: "\u2122", name: "trademark", replacement: "(TM)" },
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function extractAllText(profile: Profile): string {
  const parts: string[] = [];

  if (profile.contact?.name) parts.push(profile.contact.name);
  if (profile.summary) parts.push(profile.summary);

  profile.experiences.forEach((exp) => {
    parts.push(exp.title);
    parts.push(exp.company);
    parts.push(exp.description);
    parts.push(...exp.highlights);
    parts.push(...exp.skills);
  });

  profile.education.forEach((edu) => {
    parts.push(edu.institution);
    parts.push(edu.degree);
    parts.push(edu.field);
    parts.push(...edu.highlights);
  });

  profile.skills.forEach((skill) => parts.push(skill.name));

  profile.projects.forEach((proj) => {
    parts.push(proj.name);
    parts.push(proj.description);
    parts.push(...proj.technologies);
    parts.push(...proj.highlights);
  });

  profile.certifications.forEach((cert) => {
    parts.push(cert.name);
    parts.push(cert.issuer);
  });

  return parts.join(" ");
}

function analyzeFormatting(profile: Profile): { score: number; issues: ATSIssue[] } {
  const issues: ATSIssue[] = [];
  let score = 100;
  const fullText = extractAllText(profile);

  // Check for problematic characters
  const foundProblematic: string[] = [];
  PROBLEMATIC_CHARACTERS.forEach(({ char, name }) => {
    if (fullText.includes(char)) {
      foundProblematic.push(name);
    }
  });

  if (foundProblematic.length > 0) {
    score -= foundProblematic.length * 5;
    issues.push({
      type: "warning",
      category: "formatting",
      title: "Special characters detected",
      description: `Found: ${foundProblematic.join(", ")}. Some ATS systems may not parse these correctly.`,
      suggestion: "Replace special characters with standard ASCII equivalents.",
    });
  }

  // Check for very long lines (might indicate table-like formatting)
  const lines = fullText.split(/[.\n]/);
  const veryLongLines = lines.filter((l) => l.length > 200).length;
  if (veryLongLines > 3) {
    score -= 10;
    issues.push({
      type: "warning",
      category: "formatting",
      title: "Potential formatting issues",
      description: "Some content sections are very long, which might indicate complex formatting.",
      suggestion: "Break up long paragraphs into shorter bullet points for better readability.",
    });
  }

  // Check for contact info completeness
  if (!profile.contact?.email) {
    score -= 15;
    issues.push({
      type: "error",
      category: "formatting",
      title: "Missing email address",
      description: "No email address found in contact information.",
      suggestion: "Add a professional email address to ensure recruiters can contact you.",
    });
  }

  if (!profile.contact?.phone) {
    score -= 5;
    issues.push({
      type: "warning",
      category: "formatting",
      title: "Missing phone number",
      description: "No phone number found in contact information.",
      suggestion: "Consider adding a phone number for alternative contact method.",
    });
  }

  return { score: Math.max(0, score), issues };
}

function analyzeStructure(profile: Profile): { score: number; issues: ATSIssue[] } {
  const issues: ATSIssue[] = [];
  let score = 100;

  // Check for presence of key sections
  if (profile.experiences.length === 0) {
    score -= 30;
    issues.push({
      type: "error",
      category: "structure",
      title: "Missing work experience",
      description: "No work experience entries found.",
      suggestion: "Add your work experience with clear job titles, companies, and dates.",
    });
  }

  if (profile.education.length === 0) {
    score -= 15;
    issues.push({
      type: "warning",
      category: "structure",
      title: "Missing education",
      description: "No education entries found.",
      suggestion: "Add your educational background including degrees and institutions.",
    });
  }

  if (profile.skills.length === 0) {
    score -= 20;
    issues.push({
      type: "error",
      category: "structure",
      title: "Missing skills section",
      description: "No skills listed.",
      suggestion: "Add a skills section with relevant technical and soft skills.",
    });
  }

  if (!profile.summary || profile.summary.length < 50) {
    score -= 10;
    issues.push({
      type: "warning",
      category: "structure",
      title: "Missing or brief summary",
      description: "A professional summary helps ATS and recruiters quickly understand your profile.",
      suggestion: "Add a 2-3 sentence summary highlighting your key qualifications and career goals.",
    });
  }

  // Check for experience details
  const experiencesWithoutHighlights = profile.experiences.filter(
    (exp) => exp.highlights.length === 0
  );
  if (experiencesWithoutHighlights.length > 0 && profile.experiences.length > 0) {
    score -= 10;
    issues.push({
      type: "warning",
      category: "structure",
      title: "Experience entries lack details",
      description: `${experiencesWithoutHighlights.length} experience(s) have no bullet points or highlights.`,
      suggestion: "Add 3-5 achievement-focused bullet points to each experience entry.",
    });
  }

  // Check for dates
  const experiencesWithoutDates = profile.experiences.filter(
    (exp) => !exp.startDate
  );
  if (experiencesWithoutDates.length > 0) {
    score -= 10;
    issues.push({
      type: "error",
      category: "structure",
      title: "Missing dates",
      description: "Some experience entries are missing start dates.",
      suggestion: "Add dates to all experience entries (e.g., 'Jan 2020 - Present').",
    });
  }

  return { score: Math.max(0, score), issues };
}

function analyzeContent(profile: Profile): { score: number; issues: ATSIssue[] } {
  const issues: ATSIssue[] = [];
  let score = 100;
  const fullText = extractAllText(profile);
  const wordCount = fullText.split(/\s+/).length;

  // Check for action verbs in experience
  const actionVerbs = [
    "led", "managed", "developed", "created", "implemented", "designed",
    "built", "achieved", "improved", "increased", "reduced", "launched",
    "delivered", "collaborated", "coordinated", "analyzed", "resolved",
  ];

  const normalizedText = normalizeText(fullText);
  const foundActionVerbs = actionVerbs.filter((verb) =>
    normalizedText.includes(verb)
  );

  if (foundActionVerbs.length < 5 && profile.experiences.length > 0) {
    score -= 15;
    issues.push({
      type: "warning",
      category: "content",
      title: "Few action verbs",
      description: "Resume lacks strong action verbs that demonstrate impact.",
      suggestion: "Start bullet points with action verbs like 'Led', 'Developed', 'Achieved', 'Improved'.",
    });
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\$\d+|\d+ (people|users|clients|projects|team)/i.test(fullText);
  if (!hasNumbers && profile.experiences.length > 0) {
    score -= 15;
    issues.push({
      type: "warning",
      category: "content",
      title: "Missing quantifiable achievements",
      description: "No metrics or numbers found to demonstrate impact.",
      suggestion: "Add specific numbers (e.g., 'Increased sales by 20%', 'Led team of 5').",
    });
  }

  // Check resume length (word count)
  if (wordCount < 150) {
    score -= 20;
    issues.push({
      type: "error",
      category: "content",
      title: "Resume too brief",
      description: `Only ${wordCount} words. Most effective resumes have 300-700 words.`,
      suggestion: "Expand your experience descriptions and add more details about achievements.",
    });
  } else if (wordCount > 1000) {
    score -= 10;
    issues.push({
      type: "warning",
      category: "content",
      title: "Resume may be too long",
      description: `${wordCount} words detected. ATS may truncate or struggle with very long resumes.`,
      suggestion: "Consider condensing to most relevant information (aim for 500-700 words).",
    });
  }

  return { score: Math.max(0, score), issues };
}

function analyzeKeywords(
  profile: Profile,
  job?: JobDescription
): { score: number; keywords: KeywordAnalysis[]; issues: ATSIssue[] } {
  const issues: ATSIssue[] = [];
  const keywords: KeywordAnalysis[] = [];
  let score = 100;

  const fullText = extractAllText(profile);
  const normalizedText = normalizeText(fullText);

  // Get keywords from job description if provided
  const jobKeywords = job
    ? [...job.keywords, ...extractKeywordsFromText(job.description)]
    : [];

  // Also include common important keywords
  const importantKeywords = job
    ? Array.from(new Set(jobKeywords))
    : extractKeywordsFromText(fullText).slice(0, 10);

  if (importantKeywords.length === 0) {
    return { score: 80, keywords: [], issues: [] };
  }

  let matchedCount = 0;

  importantKeywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    const found = normalizedText.includes(normalizedKeyword);
    const frequency = (normalizedText.match(new RegExp(normalizedKeyword, "g")) || []).length;

    const locations: string[] = [];
    if (found) {
      matchedCount++;
      if (normalizeText(profile.summary || "").includes(normalizedKeyword)) {
        locations.push("summary");
      }
      profile.skills.forEach((s) => {
        if (normalizeText(s.name).includes(normalizedKeyword)) {
          locations.push("skills");
        }
      });
      profile.experiences.forEach((e) => {
        if (
          normalizeText(e.title).includes(normalizedKeyword) ||
          normalizeText(e.description).includes(normalizedKeyword) ||
          e.highlights.some((h) => normalizeText(h).includes(normalizedKeyword))
        ) {
          locations.push("experience");
        }
      });
    }

    keywords.push({
      keyword,
      found,
      frequency,
      locations: Array.from(new Set(locations)),
    });
  });

  const matchRate = matchedCount / importantKeywords.length;
  score = Math.round(matchRate * 100);

  if (job && matchRate < 0.5) {
    issues.push({
      type: "error",
      category: "keywords",
      title: "Low keyword match",
      description: `Only ${Math.round(matchRate * 100)}% of job keywords found in your resume.`,
      suggestion: "Review the job description and incorporate more relevant keywords naturally.",
    });
  } else if (job && matchRate < 0.7) {
    issues.push({
      type: "warning",
      category: "keywords",
      title: "Moderate keyword match",
      description: `${Math.round(matchRate * 100)}% of job keywords found. Aim for 70%+.`,
      suggestion: "Add missing keywords in your skills section or experience descriptions.",
    });
  }

  // Check for keyword stuffing
  const highFrequencyKeywords = keywords.filter((k) => k.frequency > 10);
  if (highFrequencyKeywords.length > 0) {
    score -= 10;
    issues.push({
      type: "warning",
      category: "keywords",
      title: "Potential keyword stuffing",
      description: "Some keywords appear very frequently, which may look unnatural.",
      suggestion: "Use keywords naturally throughout your resume without excessive repetition.",
    });
  }

  return { score: Math.max(0, score), keywords, issues };
}

function extractKeywordsFromText(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(" ");

  // Common words to ignore
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
    "used", "this", "that", "these", "those", "i", "you", "he", "she", "it",
    "we", "they", "what", "which", "who", "whom", "whose", "where", "when",
    "why", "how", "all", "each", "every", "both", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "same", "so",
    "than", "too", "very", "just", "also", "now", "about", "into", "through",
    "during", "before", "after", "above", "below", "between", "under",
    "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "any", "work", "working", "able", "using", "including",
  ]);

  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    if (word.length > 2 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 20);
}

export function analyzeATS(
  profile: Profile,
  job?: JobDescription
): ATSAnalysisResult {
  const formattingResult = analyzeFormatting(profile);
  const structureResult = analyzeStructure(profile);
  const contentResult = analyzeContent(profile);
  const keywordsResult = analyzeKeywords(profile, job);

  const allIssues = [
    ...formattingResult.issues,
    ...structureResult.issues,
    ...contentResult.issues,
    ...keywordsResult.issues,
  ];

  const score: ATSScore = {
    formatting: formattingResult.score,
    structure: structureResult.score,
    content: contentResult.score,
    keywords: keywordsResult.score,
    overall: Math.round(
      formattingResult.score * 0.2 +
        structureResult.score * 0.25 +
        contentResult.score * 0.25 +
        keywordsResult.score * 0.3
    ),
  };

  const recommendations = generateRecommendations(allIssues, score);

  let summary: string;
  if (score.overall >= 80) {
    summary = "Your resume is well-optimized for ATS systems. Minor improvements can help you stand out even more.";
  } else if (score.overall >= 60) {
    summary = "Your resume has good ATS compatibility but needs some improvements for better visibility.";
  } else if (score.overall >= 40) {
    summary = "Your resume may have trouble passing ATS systems. Focus on the critical issues below.";
  } else {
    summary = "Your resume needs significant improvements to pass ATS screening. Address the errors first.";
  }

  return {
    score,
    issues: allIssues,
    keywords: keywordsResult.keywords,
    summary,
    recommendations,
  };
}

export function scoreToLetterGrade(score: number): LetterGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function calculateBenchmark(score: number): IndustryBenchmark {
  // Approximate percentile based on a normal distribution centered around 62
  // with standard deviation of 15 (typical resume score distribution)
  const mean = 62;
  const stddev = 15;
  const z = (score - mean) / stddev;
  // Approximate CDF using logistic function
  const percentile = Math.round(100 / (1 + Math.exp(-1.7 * z)));
  return {
    percentile: Math.max(1, Math.min(99, percentile)),
    averageScore: mean,
    topPerformerScore: 90,
  };
}

export function buildKeywordHeatmap(
  keywords: KeywordAnalysis[],
  profile: Profile
): KeywordHeatmap {
  const found = keywords.filter((k) => k.found);
  const missing = keywords.filter((k) => !k.found);
  const matchRate = keywords.length > 0 ? found.length / keywords.length : 0;

  const sections = ["summary", "skills", "experience", "education", "projects"];
  const bySection: Record<string, { found: string[]; missing: string[] }> = {};

  for (const section of sections) {
    const sectionText = extractSectionText(profile, section);
    const normalizedSection = normalizeText(sectionText);

    const sectionFound: string[] = [];
    const sectionMissing: string[] = [];

    for (const kw of keywords) {
      const normalizedKeyword = normalizeText(kw.keyword);
      if (normalizedSection.includes(normalizedKeyword)) {
        sectionFound.push(kw.keyword);
      } else {
        sectionMissing.push(kw.keyword);
      }
    }

    bySection[section] = { found: sectionFound, missing: sectionMissing };
  }

  return { found, missing, matchRate, bySection };
}

function extractSectionText(profile: Profile, section: string): string {
  switch (section) {
    case "summary":
      return profile.summary || "";
    case "skills":
      return profile.skills.map((s) => s.name).join(" ");
    case "experience":
      return profile.experiences
        .map((e) => [e.title, e.company, e.description, ...e.highlights, ...e.skills].join(" "))
        .join(" ");
    case "education":
      return profile.education
        .map((e) => [e.institution, e.degree, e.field, ...e.highlights].join(" "))
        .join(" ");
    case "projects":
      return profile.projects
        .map((p) => [p.name, p.description, ...p.technologies, ...p.highlights].join(" "))
        .join(" ");
    default:
      return "";
  }
}

export function buildSectionBreakdown(
  formattingScore: number,
  structureScore: number,
  contentScore: number,
  keywordsScore: number,
  issues: ATSIssue[]
): SectionBreakdown[] {
  const sections: { section: string; score: number; weight: number; category: ATSIssue["category"] }[] = [
    { section: "Formatting", score: formattingScore, weight: 0.2, category: "formatting" },
    { section: "Structure", score: structureScore, weight: 0.25, category: "structure" },
    { section: "Content", score: contentScore, weight: 0.25, category: "content" },
    { section: "Keywords", score: keywordsScore, weight: 0.3, category: "keywords" },
  ];

  return sections.map(({ section, score, weight, category }) => ({
    section,
    score,
    weight,
    weightedScore: Math.round(score * weight),
    issueCount: issues.filter((i) => i.category === category).length,
  }));
}

export function generateScanReport(
  profile: Profile,
  job?: JobDescription
): ATSScanReport {
  const analysis = analyzeATS(profile, job);
  const { score, issues, keywords } = analysis;

  const letterGrade = scoreToLetterGrade(score.overall);
  const benchmark = calculateBenchmark(score.overall);
  const keywordHeatmap = buildKeywordHeatmap(keywords, profile);
  const sectionBreakdown = buildSectionBreakdown(
    score.formatting,
    score.structure,
    score.content,
    score.keywords,
    issues
  );

  return {
    ...analysis,
    letterGrade,
    keywordHeatmap,
    sectionBreakdown,
    benchmark,
    scannedAt: new Date().toISOString(),
  };
}

function generateRecommendations(issues: ATSIssue[], score: ATSScore): string[] {
  const recommendations: string[] = [];

  // Prioritize based on score categories
  if (score.keywords < 70) {
    recommendations.push("Add more relevant keywords from the job description to your skills and experience sections.");
  }

  if (score.structure < 70) {
    recommendations.push("Ensure all standard sections are present: Contact, Summary, Experience, Education, Skills.");
  }

  if (score.content < 70) {
    recommendations.push("Strengthen your bullet points with action verbs and quantifiable achievements.");
  }

  if (score.formatting < 70) {
    recommendations.push("Review formatting for special characters and ensure clean, simple structure.");
  }

  // Add specific recommendations from high-priority issues
  const errorIssues = issues.filter((i) => i.type === "error");
  errorIssues.slice(0, 3).forEach((issue) => {
    if (!recommendations.some((r) => r.includes(issue.suggestion.slice(0, 20)))) {
      recommendations.push(issue.suggestion);
    }
  });

  return recommendations.slice(0, 5);
}
