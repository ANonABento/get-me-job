import type { TailoredResume } from "./generator";

export interface DiffItem {
  type: "added" | "removed" | "changed" | "unchanged";
  path: string;
  label: string;
  oldValue?: string;
  newValue?: string;
}

export interface ResumeComparison {
  summary: {
    totalChanges: number;
    additions: number;
    removals: number;
    modifications: number;
  };
  diffs: DiffItem[];
  matchScoreChange?: {
    before: number;
    after: number;
    change: number;
  };
}

function compareStrings(
  oldVal: string | undefined,
  newVal: string | undefined,
  path: string,
  label: string
): DiffItem | null {
  const old = oldVal?.trim() || "";
  const new_ = newVal?.trim() || "";

  if (old === new_) return null;
  if (!old && new_) {
    return { type: "added", path, label, newValue: new_ };
  }
  if (old && !new_) {
    return { type: "removed", path, label, oldValue: old };
  }
  return { type: "changed", path, label, oldValue: old, newValue: new_ };
}

function compareArrays(
  oldArr: string[] | undefined,
  newArr: string[] | undefined,
  path: string,
  label: string
): DiffItem[] {
  const old = oldArr || [];
  const new_ = newArr || [];
  const diffs: DiffItem[] = [];

  const oldSet = new Set(old);
  const newSet = new Set(new_);

  // Find added items
  new_.forEach((item, i) => {
    if (!oldSet.has(item)) {
      diffs.push({
        type: "added",
        path: `${path}[${i}]`,
        label: `${label} #${i + 1}`,
        newValue: item,
      });
    }
  });

  // Find removed items
  old.forEach((item, i) => {
    if (!newSet.has(item)) {
      diffs.push({
        type: "removed",
        path: `${path}[${i}]`,
        label: `${label} #${i + 1}`,
        oldValue: item,
      });
    }
  });

  return diffs;
}

export function compareResumes(
  before: TailoredResume,
  after: TailoredResume,
  beforeScore?: number,
  afterScore?: number
): ResumeComparison {
  const diffs: DiffItem[] = [];

  // Compare summary
  const summaryDiff = compareStrings(before.summary, after.summary, "summary", "Summary");
  if (summaryDiff) diffs.push(summaryDiff);

  // Compare skills
  const skillsDiffs = compareArrays(before.skills, after.skills, "skills", "Skill");
  diffs.push(...skillsDiffs);

  // Compare experiences
  const maxExp = Math.max(before.experiences.length, after.experiences.length);
  for (let i = 0; i < maxExp; i++) {
    const oldExp = before.experiences[i];
    const newExp = after.experiences[i];

    if (!oldExp && newExp) {
      diffs.push({
        type: "added",
        path: `experiences[${i}]`,
        label: `Experience: ${newExp.title} at ${newExp.company}`,
        newValue: formatExperience(newExp),
      });
    } else if (oldExp && !newExp) {
      diffs.push({
        type: "removed",
        path: `experiences[${i}]`,
        label: `Experience: ${oldExp.title} at ${oldExp.company}`,
        oldValue: formatExperience(oldExp),
      });
    } else if (oldExp && newExp) {
      // Compare experience details
      const titleDiff = compareStrings(
        `${oldExp.title} at ${oldExp.company}`,
        `${newExp.title} at ${newExp.company}`,
        `experiences[${i}].title`,
        `Experience #${i + 1} Title`
      );
      if (titleDiff) diffs.push(titleDiff);

      const datesDiff = compareStrings(
        oldExp.dates,
        newExp.dates,
        `experiences[${i}].dates`,
        `Experience #${i + 1} Dates`
      );
      if (datesDiff) diffs.push(datesDiff);

      // Compare highlights
      const highlightsDiffs = compareArrays(
        oldExp.highlights,
        newExp.highlights,
        `experiences[${i}].highlights`,
        `Experience #${i + 1} Highlight`
      );
      diffs.push(...highlightsDiffs);
    }
  }

  // Compare education
  const maxEdu = Math.max(before.education.length, after.education.length);
  for (let i = 0; i < maxEdu; i++) {
    const oldEdu = before.education[i];
    const newEdu = after.education[i];

    if (!oldEdu && newEdu) {
      diffs.push({
        type: "added",
        path: `education[${i}]`,
        label: `Education: ${newEdu.degree} at ${newEdu.institution}`,
        newValue: formatEducation(newEdu),
      });
    } else if (oldEdu && !newEdu) {
      diffs.push({
        type: "removed",
        path: `education[${i}]`,
        label: `Education: ${oldEdu.degree} at ${oldEdu.institution}`,
        oldValue: formatEducation(oldEdu),
      });
    } else if (oldEdu && newEdu) {
      const eduDiff = compareStrings(
        formatEducation(oldEdu),
        formatEducation(newEdu),
        `education[${i}]`,
        `Education #${i + 1}`
      );
      if (eduDiff) diffs.push(eduDiff);
    }
  }

  // Calculate summary
  const additions = diffs.filter((d) => d.type === "added").length;
  const removals = diffs.filter((d) => d.type === "removed").length;
  const modifications = diffs.filter((d) => d.type === "changed").length;

  return {
    summary: {
      totalChanges: diffs.length,
      additions,
      removals,
      modifications,
    },
    diffs,
    matchScoreChange:
      beforeScore !== undefined && afterScore !== undefined
        ? {
            before: beforeScore,
            after: afterScore,
            change: afterScore - beforeScore,
          }
        : undefined,
  };
}

function formatExperience(exp: TailoredResume["experiences"][0]): string {
  return `${exp.title} at ${exp.company} (${exp.dates})\n${exp.highlights.map((h) => `• ${h}`).join("\n")}`;
}

function formatEducation(edu: TailoredResume["education"][0]): string {
  return `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.date})`;
}

export interface VersionInfo {
  id: string;
  createdAt: string;
  matchScore?: number;
  jobTitle?: string;
  jobCompany?: string;
}

export function createVersionTimeline(
  versions: VersionInfo[]
): { version: VersionInfo; index: number }[] {
  return versions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((version, index) => ({ version, index }));
}

// =============================================================================
// Section-level ATS scoring
// =============================================================================

export interface SectionScore {
  section: string;
  beforeScore: number;
  afterScore: number;
  change: number;
}

const ATS_SECTION_WEIGHTS: Record<string, number> = {
  summary: 15,
  skills: 30,
  experiences: 40,
  education: 15,
};

function scoreSummarySection(summary: string | undefined): number {
  if (!summary) return 0;
  const length = summary.trim().length;
  // Optimal summary: 150-300 chars
  if (length >= 150 && length <= 300) return 100;
  if (length >= 100 && length < 150) return 75;
  if (length > 300 && length <= 500) return 70;
  if (length > 0 && length < 100) return 40;
  return 20;
}

function scoreSkillsSection(skills: string[] | undefined): number {
  if (!skills || skills.length === 0) return 0;
  // Optimal: 8-15 skills
  if (skills.length >= 8 && skills.length <= 15) return 100;
  if (skills.length >= 5 && skills.length < 8) return 75;
  if (skills.length > 15 && skills.length <= 25) return 70;
  if (skills.length >= 1 && skills.length < 5) return 40;
  return 20;
}

function scoreExperiencesSection(experiences: TailoredResume["experiences"]): number {
  if (!experiences || experiences.length === 0) return 0;
  let score = 0;
  const count = experiences.length;

  // Count: 2-4 experiences is ideal
  if (count >= 2 && count <= 4) score += 40;
  else if (count === 1) score += 20;
  else score += 30;

  // Highlights quality: 3-5 per role is ideal
  const avgHighlights = experiences.reduce((sum, e) => sum + e.highlights.length, 0) / count;
  if (avgHighlights >= 3 && avgHighlights <= 5) score += 60;
  else if (avgHighlights >= 2) score += 40;
  else if (avgHighlights >= 1) score += 20;

  return Math.min(score, 100);
}

function scoreEducationSection(education: TailoredResume["education"]): number {
  if (!education || education.length === 0) return 0;
  // At least one complete education entry
  const complete = education.filter(
    (e) => e.degree && e.field && e.institution && e.date
  );
  if (complete.length === education.length) return 100;
  if (complete.length > 0) return 70;
  return 30;
}

export function calculateSectionScores(
  before: TailoredResume,
  after: TailoredResume
): SectionScore[] {
  const scorers: Record<string, (r: TailoredResume) => number> = {
    summary: (r) => scoreSummarySection(r.summary),
    skills: (r) => scoreSkillsSection(r.skills),
    experiences: (r) => scoreExperiencesSection(r.experiences),
    education: (r) => scoreEducationSection(r.education),
  };

  return Object.entries(scorers).map(([section, scorer]) => {
    const beforeScore = scorer(before);
    const afterScore = scorer(after);
    return {
      section,
      beforeScore,
      afterScore,
      change: afterScore - beforeScore,
    };
  });
}

// =============================================================================
// Resume metrics (character count, page estimate)
// =============================================================================

export interface ResumeMetrics {
  characterCount: number;
  wordCount: number;
  estimatedPages: number;
}

function resumeToPlainText(resume: TailoredResume): string {
  const parts: string[] = [];

  if (resume.contact) {
    const { name, email, phone } = resume.contact;
    if (name) parts.push(name);
    if (email) parts.push(email);
    if (phone) parts.push(phone);
  }

  if (resume.summary) parts.push(resume.summary);

  if (resume.skills?.length) parts.push(resume.skills.join(", "));

  for (const exp of resume.experiences) {
    parts.push(`${exp.title} at ${exp.company}`);
    parts.push(exp.dates);
    parts.push(...exp.highlights);
  }

  for (const edu of resume.education) {
    parts.push(`${edu.degree} in ${edu.field} from ${edu.institution} (${edu.date})`);
  }

  return parts.join("\n");
}

const CHARS_PER_PAGE = 3000;

export function calculateResumeMetrics(resume: TailoredResume): ResumeMetrics {
  const text = resumeToPlainText(resume);
  const characterCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.ceil(characterCount / CHARS_PER_PAGE));

  return { characterCount, wordCount, estimatedPages };
}

// =============================================================================
// A/B Tracking types and conversion calculation
// =============================================================================

export const AB_OUTCOMES = [
  "applied",
  "screening",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
] as const;

export type ABOutcome = (typeof AB_OUTCOMES)[number];

export interface ABTrackingEntry {
  id: string;
  resumeId: string;
  jobId: string;
  outcome: ABOutcome;
  sentAt: string;
  updatedAt: string;
  notes?: string;
}

export interface VersionStats {
  resumeId: string;
  totalSent: number;
  outcomes: Record<ABOutcome, number>;
  interviewRate: number;
  offerRate: number;
}

export function calculateVersionStats(
  resumeId: string,
  entries: ABTrackingEntry[]
): VersionStats {
  const relevant = entries.filter((e) => e.resumeId === resumeId);
  const total = relevant.length;

  const outcomes = {} as Record<ABOutcome, number>;
  for (const o of AB_OUTCOMES) {
    outcomes[o] = 0;
  }
  for (const entry of relevant) {
    outcomes[entry.outcome] = (outcomes[entry.outcome] || 0) + 1;
  }

  const interviewRate =
    total > 0
      ? ((outcomes.interviewing + outcomes.offered) / total) * 100
      : 0;
  const offerRate = total > 0 ? (outcomes.offered / total) * 100 : 0;

  return {
    resumeId,
    totalSent: total,
    outcomes,
    interviewRate: Math.round(interviewRate * 10) / 10,
    offerRate: Math.round(offerRate * 10) / 10,
  };
}

// =============================================================================
// Recommendation engine
// =============================================================================

export interface ABRecommendation {
  recommendedResumeId: string;
  reason: string;
  confidence: "low" | "medium" | "high";
  stats: VersionStats[];
}

const MIN_ENTRIES_FOR_RECOMMENDATION = 3;

export function generateRecommendation(
  allEntries: ABTrackingEntry[],
  resumeIds: string[]
): ABRecommendation | null {
  if (resumeIds.length < 2) return null;

  const stats = resumeIds.map((id) => calculateVersionStats(id, allEntries));
  const withData = stats.filter((s) => s.totalSent > 0);

  if (withData.length < 2) return null;

  // Sort by interview rate descending, then offer rate
  const sorted = [...withData].sort((a, b) => {
    if (b.interviewRate !== a.interviewRate) return b.interviewRate - a.interviewRate;
    return b.offerRate - a.offerRate;
  });

  const best = sorted[0];
  const second = sorted[1];

  const totalEntries = withData.reduce((sum, s) => sum + s.totalSent, 0);
  const confidence =
    totalEntries >= MIN_ENTRIES_FOR_RECOMMENDATION * 3
      ? "high"
      : totalEntries >= MIN_ENTRIES_FOR_RECOMMENDATION
        ? "medium"
        : "low";

  const diff = Math.round(best.interviewRate - second.interviewRate);
  const reason =
    diff > 0
      ? `This version gets ${diff}% more callbacks — consider making it your default`
      : `This version has the highest offer rate at ${best.offerRate}%`;

  return {
    recommendedResumeId: best.resumeId,
    reason,
    confidence,
    stats,
  };
}
