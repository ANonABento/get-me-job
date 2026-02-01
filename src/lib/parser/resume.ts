import { LLMClient } from "@/lib/llm/client";
import type { Profile, LLMConfig } from "@/types";
import { generateId } from "@/lib/utils";

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

  // Clean response - remove markdown code blocks if present
  let cleanResponse = response.trim();
  if (cleanResponse.startsWith("```json")) {
    cleanResponse = cleanResponse.slice(7);
  }
  if (cleanResponse.startsWith("```")) {
    cleanResponse = cleanResponse.slice(3);
  }
  if (cleanResponse.endsWith("```")) {
    cleanResponse = cleanResponse.slice(0, -3);
  }
  cleanResponse = cleanResponse.trim();

  const parsed = JSON.parse(cleanResponse);

  // Add IDs to all items
  return {
    contact: parsed.contact || { name: "" },
    summary: parsed.summary,
    experiences: (parsed.experiences || []).map((e: any) => ({
      ...e,
      id: generateId(),
      highlights: e.highlights || [],
      skills: e.skills || [],
    })),
    education: (parsed.education || []).map((e: any) => ({
      ...e,
      id: generateId(),
      highlights: e.highlights || [],
    })),
    skills: (parsed.skills || []).map((s: any) => ({
      ...s,
      id: generateId(),
    })),
    projects: (parsed.projects || []).map((p: any) => ({
      ...p,
      id: generateId(),
      technologies: p.technologies || [],
      highlights: p.highlights || [],
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
