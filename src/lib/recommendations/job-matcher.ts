import type { JobDescription, Profile, Skill } from "@/types";

export interface SkillMatch {
  skill: string;
  matched: boolean;
  proficiency?: string;
  relevance: "high" | "medium" | "low";
}

export interface JobRecommendation {
  job: JobDescription;
  score: number;
  skillMatches: SkillMatch[];
  skillGaps: string[];
  growthOpportunities: string[];
  matchExplanation: string;
  reasons: string[];
}

export interface RecommendationResult {
  recommendations: JobRecommendation[];
  topSkillGaps: string[];
  growthAreas: string[];
  insights: string[];
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function skillMatches(skill: string, keyword: string): boolean {
  const normalizedSkill = normalizeText(skill);
  const normalizedKeyword = normalizeText(keyword);

  // Direct match
  if (normalizedSkill === normalizedKeyword) return true;

  // Partial match (one contains the other)
  if (normalizedSkill.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedSkill)) {
    return true;
  }

  // Common variations
  const variations: Record<string, string[]> = {
    "javascript": ["js", "es6", "es2015", "ecmascript"],
    "typescript": ["ts"],
    "react": ["reactjs", "react.js"],
    "node": ["nodejs", "node.js"],
    "python": ["py", "python3"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "kubernetes": ["k8s"],
    "amazon web services": ["aws"],
    "google cloud": ["gcp", "google cloud platform"],
    "microsoft azure": ["azure"],
  };

  for (const [base, alts] of Object.entries(variations)) {
    const allVariations = [base, ...alts];
    if (allVariations.includes(normalizedSkill) && allVariations.includes(normalizedKeyword)) {
      return true;
    }
  }

  return false;
}

function calculateSkillRelevance(keyword: string, job: JobDescription): "high" | "medium" | "low" {
  const normalizedKeyword = normalizeText(keyword);
  const title = normalizeText(job.title);
  const firstThreeKeywords = job.keywords.slice(0, 3).map(normalizeText);

  // High relevance if in title or first 3 keywords
  if (title.includes(normalizedKeyword) || firstThreeKeywords.some(k => k.includes(normalizedKeyword))) {
    return "high";
  }

  // Medium relevance if in requirements or keywords
  const inRequirements = job.requirements.some(r => normalizeText(r).includes(normalizedKeyword));
  const inKeywords = job.keywords.some(k => normalizeText(k).includes(normalizedKeyword));

  if (inRequirements || inKeywords) {
    return "medium";
  }

  return "low";
}

function calculateJobScore(profile: Profile, job: JobDescription): {
  score: number;
  skillMatches: SkillMatch[];
  skillGaps: string[];
  growthOpportunities: string[];
} {
  const profileSkills = profile.skills.map(s => s.name);
  const profileSkillNames = profileSkills.map(normalizeText);

  // Also consider skills from experiences
  const experienceSkills = profile.experiences.flatMap(e => e.skills || []);
  const allProfileSkills = Array.from(new Set([...profileSkills, ...experienceSkills]));
  const allProfileSkillsNormalized = allProfileSkills.map(normalizeText);

  const skillMatchResults: SkillMatch[] = [];
  const skillGaps: string[] = [];
  const growthOpportunities: string[] = [];

  let matchedCount = 0;
  let highRelevanceMatched = 0;
  let mediumRelevanceMatched = 0;

  // Check each job keyword
  for (const keyword of job.keywords) {
    const relevance = calculateSkillRelevance(keyword, job);
    const matched = allProfileSkillsNormalized.some(skill => skillMatches(skill, keyword));

    const profileSkill = profile.skills.find(s => skillMatches(s.name, keyword));

    skillMatchResults.push({
      skill: keyword,
      matched,
      proficiency: profileSkill?.proficiency,
      relevance,
    });

    if (matched) {
      matchedCount++;
      if (relevance === "high") highRelevanceMatched++;
      if (relevance === "medium") mediumRelevanceMatched++;
    } else {
      if (relevance === "high" || relevance === "medium") {
        skillGaps.push(keyword);
      } else {
        growthOpportunities.push(keyword);
      }
    }
  }

  // Calculate score (0-100)
  const totalKeywords = job.keywords.length || 1;
  const baseScore = (matchedCount / totalKeywords) * 60; // Up to 60 points for matches
  const highRelevanceBonus = highRelevanceMatched * 8; // Bonus for high relevance matches
  const mediumRelevanceBonus = mediumRelevanceMatched * 4; // Bonus for medium relevance matches

  // Experience level bonus
  let experienceBonus = 0;
  const yearsOfExperience = profile.experiences.length > 0 ?
    Math.min(profile.experiences.length * 2, 10) : 0;

  // Check if job type matches experience level
  if (job.type === "internship") {
    experienceBonus = Math.min(yearsOfExperience * 2, 10);
  } else if (job.type === "full-time" || job.type === "contract" || job.type === "part-time") {
    experienceBonus = Math.min(yearsOfExperience, 10);
  }

  const score = Math.min(100, Math.round(baseScore + highRelevanceBonus + mediumRelevanceBonus + experienceBonus));

  return {
    score,
    skillMatches: skillMatchResults,
    skillGaps: skillGaps.slice(0, 5), // Top 5 gaps
    growthOpportunities: growthOpportunities.slice(0, 5), // Top 5 growth areas
  };
}

function generateMatchExplanation(score: number, skillMatches: SkillMatch[]): string {
  const matchedCount = skillMatches.filter(m => m.matched).length;
  const totalCount = skillMatches.length;
  const highRelevanceMatched = skillMatches.filter(m => m.matched && m.relevance === "high").length;

  if (score >= 80) {
    return `Excellent match! You have ${matchedCount} of ${totalCount} required skills, including ${highRelevanceMatched} core skills.`;
  } else if (score >= 60) {
    return `Strong match with ${matchedCount} of ${totalCount} skills. Focus on filling a few key gaps to improve your chances.`;
  } else if (score >= 40) {
    return `Moderate match with ${matchedCount} of ${totalCount} skills. This could be a good growth opportunity.`;
  } else {
    return `Developing match with ${matchedCount} of ${totalCount} skills. Consider this a stretch role for career growth.`;
  }
}

function generateReasons(score: number, skillMatches: SkillMatch[], skillGaps: string[]): string[] {
  const reasons: string[] = [];

  const matchedHighRelevance = skillMatches.filter(m => m.matched && m.relevance === "high").map(m => m.skill);
  const matchedMedium = skillMatches.filter(m => m.matched && m.relevance === "medium").map(m => m.skill);

  if (matchedHighRelevance.length > 0) {
    reasons.push(`Strong match in core skills: ${matchedHighRelevance.slice(0, 3).join(", ")}`);
  }

  if (matchedMedium.length > 0) {
    reasons.push(`Additional relevant skills: ${matchedMedium.slice(0, 3).join(", ")}`);
  }

  if (skillGaps.length > 0 && skillGaps.length <= 2) {
    reasons.push(`Minor gaps to address: ${skillGaps.join(", ")}`);
  } else if (skillGaps.length > 2) {
    reasons.push(`Key skills to develop: ${skillGaps.slice(0, 2).join(", ")} and ${skillGaps.length - 2} more`);
  }

  if (score >= 70) {
    reasons.push("Good overall fit for your profile");
  }

  return reasons;
}

export function generateRecommendations(
  profile: Profile,
  jobs: JobDescription[],
  limit = 10
): RecommendationResult {
  // Calculate scores for all jobs
  const recommendations: JobRecommendation[] = jobs
    .filter(job => job.status === "saved" || !job.status) // Only recommend saved or new jobs
    .map(job => {
      const { score, skillMatches, skillGaps, growthOpportunities } = calculateJobScore(profile, job);

      return {
        job,
        score,
        skillMatches,
        skillGaps,
        growthOpportunities,
        matchExplanation: generateMatchExplanation(score, skillMatches),
        reasons: generateReasons(score, skillMatches, skillGaps),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Aggregate skill gaps across all recommendations
  const allSkillGaps = recommendations.flatMap(r => r.skillGaps);
  const skillGapCounts = allSkillGaps.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSkillGaps = Object.entries(skillGapCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill)
    .slice(0, 5);

  // Aggregate growth opportunities
  const allGrowthOps = recommendations.flatMap(r => r.growthOpportunities);
  const growthOpCounts = allGrowthOps.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const growthAreas = Object.entries(growthOpCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill)
    .slice(0, 5);

  // Generate insights
  const insights: string[] = [];

  const avgScore = recommendations.length > 0
    ? Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length)
    : 0;

  if (avgScore >= 70) {
    insights.push("Your profile aligns well with available opportunities. Apply to top matches confidently.");
  } else if (avgScore >= 50) {
    insights.push("You have good foundational skills. Focus on developing key gaps to increase your match scores.");
  } else {
    insights.push("Consider upskilling in trending areas to improve your job matches.");
  }

  if (topSkillGaps.length > 0) {
    insights.push(`Most in-demand skills you're missing: ${topSkillGaps.slice(0, 3).join(", ")}`);
  }

  const highMatches = recommendations.filter(r => r.score >= 70).length;
  if (highMatches > 0) {
    insights.push(`You have ${highMatches} strong match${highMatches > 1 ? "es" : ""} - prioritize these applications!`);
  }

  return {
    recommendations,
    topSkillGaps,
    growthAreas,
    insights,
  };
}
