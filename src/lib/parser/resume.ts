import { LLMClient } from "@/lib/llm/client";
import type { Profile, Experience, Education, Skill, Project, LLMConfig } from "@/types";
import { generateId, extractJSON } from "@/lib/utils";

const RESUME_PARSE_PROMPT = `You are a resume parser. Extract structured information from the following resume text.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "contact": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1-234-567-8900",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "website": "example.com"
  },
  "summary": "Professional summary or objective statement",
  "experiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "current": true,
      "description": "Brief description of role",
      "highlights": ["Achievement 1", "Achievement 2"],
      "skills": ["Skill 1", "Skill 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2016",
      "endDate": "2020",
      "gpa": "3.8",
      "highlights": ["Honor 1", "Award 1"]
    }
  ],
  "skills": [
    {
      "name": "Python",
      "category": "technical",
      "proficiency": "expert"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What the project does",
      "url": "github.com/user/project",
      "technologies": ["React", "Node.js"],
      "highlights": ["Key achievement"]
    }
  ]
}

Rules:
- Extract only information that is clearly present in the resume
- Use null for missing optional fields
- Categories for skills: technical, soft, language, tool, other
- Proficiency levels: beginner, intermediate, advanced, expert
- For dates, use the format shown (e.g., "Jan 2020" or just "2020")
- current should be true only if the role is ongoing
- Return ONLY the JSON object, no explanation or markdown

Resume text:
`;

export async function parseResumeWithLLM(
  text: string,
  llmConfig: LLMConfig
): Promise<Partial<Profile>> {
  const client = new LLMClient(llmConfig);

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: RESUME_PARSE_PROMPT + text,
      },
    ],
    temperature: 0.1,
    maxTokens: 4096,
  });

  const parsed = extractJSON(response);

  // Add IDs to all items — LLM output is trusted to match the prompted schema
  const rawExperiences = (parsed.experiences ?? []) as Record<string, unknown>[];
  const rawEducation = (parsed.education ?? []) as Record<string, unknown>[];
  const rawSkills = (parsed.skills ?? []) as Record<string, unknown>[];
  const rawProjects = (parsed.projects ?? []) as Record<string, unknown>[];

  return {
    contact: (parsed.contact as Profile["contact"]) || { name: "" },
    summary: parsed.summary as string | undefined,
    experiences: rawExperiences.map((e): Experience => ({
      id: generateId(),
      company: (e.company as string) || "",
      title: (e.title as string) || "",
      location: e.location as string | undefined,
      startDate: (e.startDate as string) || "",
      endDate: e.endDate as string | undefined,
      current: (e.current as boolean) || false,
      description: (e.description as string) || "",
      highlights: (e.highlights as string[]) || [],
      skills: (e.skills as string[]) || [],
    })),
    education: rawEducation.map((e): Education => ({
      id: generateId(),
      institution: (e.institution as string) || "",
      degree: (e.degree as string) || "",
      field: (e.field as string) || "",
      startDate: e.startDate as string | undefined,
      endDate: e.endDate as string | undefined,
      gpa: e.gpa as string | undefined,
      highlights: (e.highlights as string[]) || [],
    })),
    skills: rawSkills.map((s): Skill => ({
      id: generateId(),
      name: (s.name as string) || "",
      category: (s.category as Skill["category"]) || "other",
      proficiency: s.proficiency as Skill["proficiency"],
    })),
    projects: rawProjects.map((p): Project => ({
      id: generateId(),
      name: (p.name as string) || "",
      description: (p.description as string) || "",
      url: p.url as string | undefined,
      technologies: (p.technologies as string[]) || [],
      highlights: (p.highlights as string[]) || [],
    })),
    rawText: text,
  };
}

// Fallback parser using regex patterns (no LLM required)
export function parseResumeBasic(text: string): Partial<Profile> {
  const lines = text.split("\n").filter((line) => line.trim());

  // Try to extract email
  const emailMatch = text.match(
    /[\w.-]+@[\w.-]+\.\w+/
  );
  const email = emailMatch?.[0];

  // Try to extract phone
  const phoneMatch = text.match(
    /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  );
  const phone = phoneMatch?.[0];

  // Try to extract LinkedIn
  const linkedinMatch = text.match(
    /linkedin\.com\/in\/[\w-]+/i
  );
  const linkedin = linkedinMatch?.[0];

  // Try to extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  const github = githubMatch?.[0];

  // First line is often the name
  const name = lines[0] || "";

  return {
    contact: {
      name,
      email,
      phone,
      linkedin,
      github,
    },
    rawText: text,
    experiences: [],
    education: [],
    skills: [],
    projects: [],
  };
}
