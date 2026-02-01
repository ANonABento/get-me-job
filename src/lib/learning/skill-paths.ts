import type { JobDescription, Profile, Skill } from "@/types";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import type { LLMConfig } from "@/types";

export interface LearningResource {
  title: string;
  type: "course" | "tutorial" | "documentation" | "book" | "project" | "certification";
  platform?: string;
  url?: string;
  duration?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  free: boolean;
}

export interface SkillLearningPath {
  skill: string;
  priority: "high" | "medium" | "low";
  currentLevel: "none" | "beginner" | "intermediate" | "advanced";
  targetLevel: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedWeeks: number;
  jobsRequiring: number;
  resources: LearningResource[];
  milestones: string[];
}

export interface LearningPathResult {
  paths: SkillLearningPath[];
  totalEstimatedWeeks: number;
  quickWins: string[];
  strategicSkills: string[];
  insights: string[];
}

interface SkillGapInfo {
  skill: string;
  count: number;
  jobs: string[];
  isHighRelevance: boolean;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function analyzeSkillGaps(
  profile: Profile,
  jobs: JobDescription[]
): SkillGapInfo[] {
  const profileSkills = profile.skills.map(s => normalizeText(s.name));
  const experienceSkills = profile.experiences.flatMap(e => (e.skills || []).map(normalizeText));
  const allSkills = new Set([...profileSkills, ...experienceSkills]);

  const skillGapMap = new Map<string, SkillGapInfo>();

  for (const job of jobs) {
    const titleLower = normalizeText(job.title);
    const firstKeywords = job.keywords.slice(0, 3).map(normalizeText);

    for (const keyword of job.keywords) {
      const normalized = normalizeText(keyword);

      // Check if user has this skill
      const hasSkill = Array.from(allSkills).some(
        s => s.includes(normalized) || normalized.includes(s)
      );

      if (!hasSkill) {
        const isHighRelevance =
          titleLower.includes(normalized) ||
          firstKeywords.some(k => k.includes(normalized) || normalized.includes(k));

        const existing = skillGapMap.get(keyword);
        if (existing) {
          existing.count++;
          existing.jobs.push(`${job.title} at ${job.company}`);
          if (isHighRelevance && !existing.isHighRelevance) {
            existing.isHighRelevance = true;
          }
        } else {
          skillGapMap.set(keyword, {
            skill: keyword,
            count: 1,
            jobs: [`${job.title} at ${job.company}`],
            isHighRelevance,
          });
        }
      }
    }
  }

  // Sort by priority (high relevance first, then by count)
  return Array.from(skillGapMap.values())
    .sort((a, b) => {
      if (a.isHighRelevance !== b.isHighRelevance) {
        return a.isHighRelevance ? -1 : 1;
      }
      return b.count - a.count;
    });
}

function getUserSkillLevel(skill: string, profile: Profile): Skill["proficiency"] | "none" {
  const matchingSkill = profile.skills.find(
    s => normalizeText(s.name).includes(normalizeText(skill)) ||
         normalizeText(skill).includes(normalizeText(s.name))
  );
  return matchingSkill?.proficiency || "none";
}

function estimateLearningWeeks(
  currentLevel: string,
  targetLevel: string
): number {
  const levels = ["none", "beginner", "intermediate", "advanced", "expert"];
  const currentIndex = levels.indexOf(currentLevel);
  const targetIndex = levels.indexOf(targetLevel);
  const diff = targetIndex - currentIndex;

  // Roughly 2-4 weeks per level
  return Math.max(1, diff * 3);
}

function generateDefaultResources(skill: string, difficulty: "beginner" | "intermediate" | "advanced"): LearningResource[] {
  const resources: LearningResource[] = [];

  // Official documentation
  resources.push({
    title: `Official ${skill} Documentation`,
    type: "documentation",
    difficulty: "beginner",
    free: true,
  });

  // Free course
  resources.push({
    title: `${skill} Fundamentals Course`,
    type: "course",
    platform: "YouTube / freeCodeCamp",
    duration: "4-8 hours",
    difficulty: "beginner",
    free: true,
  });

  // Interactive tutorial
  resources.push({
    title: `Interactive ${skill} Tutorial`,
    type: "tutorial",
    platform: "Various",
    duration: "2-4 hours",
    difficulty: "beginner",
    free: true,
  });

  if (difficulty === "intermediate" || difficulty === "advanced") {
    resources.push({
      title: `Advanced ${skill} Techniques`,
      type: "course",
      platform: "Udemy / Coursera",
      duration: "10-20 hours",
      difficulty: "intermediate",
      free: false,
    });
  }

  if (difficulty === "advanced") {
    resources.push({
      title: `${skill} Certification`,
      type: "certification",
      platform: "Official Provider",
      duration: "40+ hours",
      difficulty: "advanced",
      free: false,
    });
  }

  // Hands-on project
  resources.push({
    title: `Build a Project with ${skill}`,
    type: "project",
    duration: "8-20 hours",
    difficulty: difficulty,
    free: true,
  });

  return resources;
}

function generateMilestones(skill: string, targetLevel: string): string[] {
  const milestones: string[] = [
    `Understand ${skill} basics and core concepts`,
    `Complete a tutorial or guided project`,
    `Build a small independent project`,
  ];

  if (targetLevel === "intermediate" || targetLevel === "advanced" || targetLevel === "expert") {
    milestones.push(`Contribute to an open-source ${skill} project`);
    milestones.push(`Build a portfolio-worthy project`);
  }

  if (targetLevel === "advanced" || targetLevel === "expert") {
    milestones.push(`Mentor others in ${skill}`);
    milestones.push(`Get certified (if available)`);
  }

  return milestones;
}

export function generateLearningPaths(
  profile: Profile,
  jobs: JobDescription[],
  limit = 5
): LearningPathResult {
  const skillGaps = analyzeSkillGaps(profile, jobs);
  const topGaps = skillGaps.slice(0, limit);

  const paths: SkillLearningPath[] = topGaps.map(gap => {
    const currentLevel = getUserSkillLevel(gap.skill, profile);
    const targetLevel = gap.isHighRelevance ? "advanced" : "intermediate";
    const estimatedWeeks = estimateLearningWeeks(currentLevel || "none", targetLevel);

    // Map proficiency to path currentLevel
    const currentLevelMapped: SkillLearningPath["currentLevel"] =
      currentLevel === "none" || currentLevel === undefined ? "none" :
      currentLevel === "beginner" ? "beginner" :
      currentLevel === "intermediate" ? "intermediate" : "advanced";

    return {
      skill: gap.skill,
      priority: gap.isHighRelevance ? "high" : gap.count >= 3 ? "medium" : "low",
      currentLevel: currentLevelMapped,
      targetLevel,
      estimatedWeeks,
      jobsRequiring: gap.count,
      resources: generateDefaultResources(gap.skill, targetLevel === "advanced" ? "advanced" : "intermediate"),
      milestones: generateMilestones(gap.skill, targetLevel),
    };
  });

  const totalEstimatedWeeks = paths.reduce((sum, p) => sum + p.estimatedWeeks, 0);

  // Identify quick wins (skills that appear in many jobs but are beginner-friendly)
  const quickWins = paths
    .filter(p => p.estimatedWeeks <= 4 && p.jobsRequiring >= 2)
    .map(p => p.skill)
    .slice(0, 3);

  // Identify strategic skills (high priority, advanced)
  const strategicSkills = paths
    .filter(p => p.priority === "high")
    .map(p => p.skill)
    .slice(0, 3);

  // Generate insights
  const insights: string[] = [];

  if (paths.length === 0) {
    insights.push("Your skills match well with available jobs! Consider deepening your expertise.");
  } else {
    if (quickWins.length > 0) {
      insights.push(`Quick wins: Learn ${quickWins.join(", ")} first - they appear in many job listings.`);
    }

    if (strategicSkills.length > 0) {
      insights.push(`Strategic focus: ${strategicSkills.join(", ")} are core requirements for your target roles.`);
    }

    const highPriorityCount = paths.filter(p => p.priority === "high").length;
    if (highPriorityCount > 0) {
      insights.push(`You have ${highPriorityCount} high-priority skill${highPriorityCount > 1 ? "s" : ""} to focus on.`);
    }

    if (totalEstimatedWeeks > 20) {
      insights.push("Consider focusing on 2-3 skills at a time rather than all at once.");
    }
  }

  return {
    paths,
    totalEstimatedWeeks,
    quickWins,
    strategicSkills,
    insights,
  };
}

export async function enhanceLearningPathsWithLLM(
  paths: SkillLearningPath[],
  llmConfig: LLMConfig
): Promise<SkillLearningPath[]> {
  const client = new LLMClient(llmConfig);

  const skillList = paths.map(p => p.skill).join(", ");

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: `Suggest specific learning resources for these tech skills: ${skillList}

For each skill, provide 3-4 specific resources including:
- Platform name (e.g., Udemy, Coursera, YouTube channel, official docs)
- Specific course or resource name if known
- Whether it's free or paid
- Approximate duration

Return JSON:
{
  "resources": {
    "skillName": [
      {
        "title": "Specific Resource Name",
        "type": "course|tutorial|documentation|book|project|certification",
        "platform": "Platform Name",
        "url": "optional URL",
        "duration": "X hours",
        "difficulty": "beginner|intermediate|advanced",
        "free": true/false
      }
    ]
  }
}`,
      },
    ],
    temperature: 0.7,
    maxTokens: 1500,
  });

  try {
    const enhanced = parseJSONFromLLM<{
      resources: Record<string, LearningResource[]>;
    }>(response);

    return paths.map(path => {
      const llmResources = enhanced.resources[path.skill] || enhanced.resources[path.skill.toLowerCase()];
      if (llmResources && llmResources.length > 0) {
        return {
          ...path,
          resources: llmResources,
        };
      }
      return path;
    });
  } catch {
    return paths;
  }
}
