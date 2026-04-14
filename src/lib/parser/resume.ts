import { LLMClient } from "@/lib/llm/client";
import type { Profile, LLMConfig } from "@/types";
import { generateId, completeAndParseJSON } from "@/lib/utils";

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

  const userMessage = { role: "user" as const, content: RESUME_PARSE_PROMPT + text };

  const parsed = await completeAndParseJSON(
    (messages) => client.complete({ messages, temperature: 0.1, maxTokens: 4096 }),
    [userMessage]
  );

  // Add IDs to all items
  type RawItem = Record<string, unknown>;
  return {
    contact: ((parsed.contact as unknown) || { name: "" }) as Profile["contact"],
    summary: parsed.summary as string | undefined,
    experiences: ((parsed.experiences as RawItem[] | undefined) || []).map((e) => ({
      ...e,
      id: generateId(),
      highlights: (e.highlights as string[]) || [],
      skills: (e.skills as string[]) || [],
    })) as Profile["experiences"],
    education: ((parsed.education as RawItem[] | undefined) || []).map((e) => ({
      ...e,
      id: generateId(),
      highlights: (e.highlights as string[]) || [],
    })) as Profile["education"],
    skills: ((parsed.skills as RawItem[] | undefined) || []).map((s) => ({
      ...s,
      id: generateId(),
    })) as Profile["skills"],
    projects: ((parsed.projects as RawItem[] | undefined) || []).map((p) => ({
      ...p,
      id: generateId(),
      technologies: (p.technologies as string[]) || [],
      highlights: (p.highlights as string[]) || [],
    })) as Profile["projects"],
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
