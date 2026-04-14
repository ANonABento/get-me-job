import type { Profile, JobDescription, LLMConfig } from "@/types";
import { LLMClient } from "@/lib/llm/client";
import { extractJSON } from "@/lib/utils";

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
}

export async function generateTailoredResume(
  profile: Profile,
  job: JobDescription,
  llmConfig: LLMConfig | null
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
  llmConfig: LLMConfig
): Promise<TailoredResume> {
  const client = new LLMClient(llmConfig);

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: `Generate a tailored resume for this job. The resume must fit on ONE page, so be concise and selective.

CANDIDATE PROFILE:
Name: ${profile.contact.name}
Email: ${profile.contact.email}
Phone: ${profile.contact.phone}
Location: ${profile.contact.location}
LinkedIn: ${profile.contact.linkedin}
GitHub: ${profile.contact.github}

Current Summary: ${profile.summary || "N/A"}

Experience:
${profile.experiences.map((e) => `
Company: ${e.company}
Title: ${e.title}
Dates: ${e.startDate} - ${e.endDate || "Present"}
Description: ${e.description}
Highlights: ${e.highlights.join(", ")}
`).join("\n")}

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

Return ONLY a JSON object with this structure:
{
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
}`,
      },
    ],
    temperature: 0.4,
    maxTokens: 2000,
  });

  const parsed = extractJSON(response) as any;

  return {
    contact: profile.contact,
    summary: parsed.summary,
    experiences: parsed.experiences,
    skills: parsed.skills,
    education: parsed.education,
  };
}

function generateBasic(profile: Profile, job: JobDescription): TailoredResume {
  // Basic resume generation without LLM
  // Prioritize experiences and skills that match job keywords
  const jobKeywords = job.keywords.map((k) => k.toLowerCase());

  // Score and sort experiences by relevance
  const scoredExperiences = profile.experiences.map((exp) => {
    const text = `${exp.title} ${exp.description} ${exp.highlights.join(" ")}`.toLowerCase();
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
      (kw) => skillLower.includes(kw) || kw.includes(skillLower)
    ).length;
    return { skill: skill.name, score };
  });

  scoredSkills.sort((a, b) => b.score - a.score);
  const topSkills = scoredSkills.slice(0, 15).map((s) => s.skill);

  return {
    contact: profile.contact,
    summary: profile.summary || `Experienced professional seeking ${job.title} position at ${job.company}.`,
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
