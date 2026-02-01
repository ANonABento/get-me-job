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
