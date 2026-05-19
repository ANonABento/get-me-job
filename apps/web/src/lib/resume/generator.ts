import type { Profile, JobDescription, LLMConfig } from "@/types";
import { LLMClient } from "@/lib/llm/client";
import { extractJSON } from "@/lib/utils";
import { tailoredResumeSchema } from "@/lib/schemas/tailor";

export interface TailoredResume {
  contact: Profile["contact"];
  summary: string;
  experiences: {
    company: string;
    title: string;
    dates: string;
    highlights: string[];
  }[];
  skills: string[];
  education: {
    institution: string;
    degree: string;
    field: string;
    date: string;
  }[];
  projects?: {
    name: string;
    description: string;
    highlights: string[];
  }[];
  certifications?: string[];
  awards?: string[];
}

export async function generateTailoredResume(
  profile: Profile,
  job: JobDescription,
  llmConfig: LLMConfig | null,
): Promise<TailoredResume> {
  if (llmConfig) {
    return generateWithLLM(profile, job, llmConfig);
  } else {
    return generateBasic(profile, job);
  }
}

async function generateWithLLM(
  profile: Profile,
  job: JobDescription,
  llmConfig: LLMConfig,
): Promise<TailoredResume> {
  const client = new LLMClient(llmConfig);

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: buildTailoredResumePrompt(profile, job),
      },
    ],
    temperature: 0.4,
    maxTokens: 2000,
  });

  const parsed = tailoredResumeSchema.partial().parse(extractJSON(response));
  const sourceEducation = profile.education.map((e) => ({
    institution: e.institution,
    degree: e.degree,
    field: e.field,
    date: e.endDate || "",
  }));
  const unsupportedKeywords = getUnsupportedKeywords(
    job.keywords,
    buildProfileEvidenceText(profile),
  );

  return {
    contact: profile.contact,
    summary: stripUnsupportedClaims(
      parsed.summary || profile.summary || "",
      unsupportedKeywords,
    ),
    experiences: sanitizeExperiences(
      parsed.experiences || [],
      unsupportedKeywords,
    ),
    skills: filterUnsupportedClaims(parsed.skills || [], unsupportedKeywords),
    education: sourceEducation,
  };
}

export function buildTailoredResumePrompt(
  profile: Profile,
  job: JobDescription,
): string {
  return `Generate a tailored resume for this job. The resume must fit on ONE page, so be concise and selective.

CANDIDATE PROFILE:
Name: ${profile.contact.name}
Email: ${profile.contact.email}
Phone: ${profile.contact.phone}
Location: ${profile.contact.location}
LinkedIn: ${profile.contact.linkedin}
GitHub: ${profile.contact.github}

Current Summary: ${profile.summary || "N/A"}

Experience:
${profile.experiences
  .map(
    (e) => `
Company: ${e.company}
Title: ${e.title}
Dates: ${e.startDate} - ${e.endDate || "Present"}
Description: ${e.description}
Highlights: ${e.highlights.join(", ")}
`,
  )
  .join("\n")}

Skills: ${profile.skills.map((s) => s.name).join(", ")}

Education:
${profile.education.map((e) => `${e.degree} in ${e.field} from ${e.institution} (${e.endDate})`).join("\n")}

JOB TARGET:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Key Requirements: ${job.keywords.join(", ")}

INSTRUCTIONS:
1. Write a professional summary (2-3 sentences) tailored to this specific job
2. Select the 2-3 most relevant experiences and rewrite bullet points to highlight relevant skills
3. Each experience should have 2-4 bullet points maximum
4. Prioritize skills that match the job requirements
5. Keep everything concise - this must fit on one page
6. Every added keyword, skill, tool, metric, employer, degree, certification, responsibility, and achievement must be backed by the candidate profile above
7. Incorporate job keywords only when the profile evidence already supports them; omit unsupported keywords instead of guessing
8. Do not invent metrics, tools, employers, degrees, certifications, dates, job titles, clients, or responsibilities
9. Preserve contact details, education, employers, titles, and dates exactly as provided; do not rewrite or replace them
10. If evidence does not support a requested keyword such as AWS or Kubernetes, leave it out entirely

Return ONLY a JSON object with this structure:
{
  "contact": ${JSON.stringify(profile.contact)},
  "summary": "Tailored professional summary...",
  "experiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "dates": "Jan 2020 - Present",
      "highlights": ["Achievement 1 with metrics", "Achievement 2"]
    }
  ],
  "skills": ["Skill 1", "Skill 2", ...],
  "education": [
    {
      "institution": "University",
      "degree": "Degree",
      "field": "Field",
      "date": "2020"
    }
  ]
}`;
}

function generateBasic(profile: Profile, job: JobDescription): TailoredResume {
  // Basic resume generation without LLM
  // Prioritize experiences and skills that match job keywords
  const jobKeywords = job.keywords.map((k) => k.toLowerCase());

  // Score and sort experiences by relevance
  const scoredExperiences = profile.experiences.map((exp) => {
    const text =
      `${exp.title} ${exp.description} ${exp.highlights.join(" ")}`.toLowerCase();
    const score = jobKeywords.filter((kw) => text.includes(kw)).length;
    return { exp, score };
  });

  scoredExperiences.sort((a, b) => b.score - a.score);

  // Take top 3 experiences
  const topExperiences = scoredExperiences.slice(0, 3).map(({ exp }) => ({
    company: exp.company,
    title: exp.title,
    dates: `${exp.startDate} - ${exp.endDate || "Present"}`,
    highlights: exp.highlights.slice(0, 4),
  }));

  // Score and sort skills
  const scoredSkills = profile.skills.map((skill) => {
    const skillLower = skill.name.toLowerCase();
    const score = jobKeywords.filter(
      (kw) => skillLower.includes(kw) || kw.includes(skillLower),
    ).length;
    return { skill: skill.name, score };
  });

  scoredSkills.sort((a, b) => b.score - a.score);
  const topSkills = scoredSkills.slice(0, 15).map((s) => s.skill);

  return {
    contact: profile.contact,
    summary:
      profile.summary ||
      `Experienced professional seeking ${job.title} position at ${job.company}.`,
    experiences: topExperiences,
    skills: topSkills,
    education: profile.education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      date: e.endDate || "",
    })),
  };
}

function buildProfileEvidenceText(profile: Profile): string {
  return JSON.stringify({
    summary: profile.summary,
    experiences: profile.experiences,
    skills: profile.skills,
    education: profile.education,
  }).toLowerCase();
}

export function getUnsupportedKeywords(
  keywords: string[],
  evidenceText: string,
): string[] {
  const evidence = evidenceText.toLowerCase();
  return keywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .filter((keyword) => !evidence.includes(keyword.toLowerCase()));
}

export function filterUnsupportedClaims<T extends string>(
  values: T[],
  unsupportedKeywords: string[],
): T[] {
  if (unsupportedKeywords.length === 0) return values;
  return values.filter(
    (value) => !containsUnsupportedKeyword(value, unsupportedKeywords),
  );
}

export function stripUnsupportedClaims(
  value: string,
  unsupportedKeywords: string[],
): string {
  if (!containsUnsupportedKeyword(value, unsupportedKeywords)) return value;
  return unsupportedKeywords.reduce(
    (next, keyword) =>
      next.replace(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi"), ""),
    value,
  );
}

function sanitizeExperiences(
  experiences: TailoredResume["experiences"],
  unsupportedKeywords: string[],
): TailoredResume["experiences"] {
  return experiences.map((experience) => ({
    ...experience,
    highlights: filterUnsupportedClaims(
      experience.highlights,
      unsupportedKeywords,
    ),
  }));
}

function containsUnsupportedKeyword(
  value: string,
  unsupportedKeywords: string[],
): boolean {
  return unsupportedKeywords.some((keyword) =>
    new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(value),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
