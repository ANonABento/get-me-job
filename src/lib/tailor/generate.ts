import type { BankEntry, GroupedBankEntries, LLMConfig, ContactInfo } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import { formatHackathonHighlights } from "@/lib/resume/hackathon-highlights";
import type { BankMatch } from "./analyze";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";

interface BankResumeInput {
  bankEntries: GroupedBankEntries;
  matchedEntries: BankMatch[];
  contact: ContactInfo;
  summary?: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
}

/**
 * Generate a tailored resume from knowledge bank entries.
 * Uses LLM when available, falls back to keyword-based selection.
 */
export async function generateFromBank(
  input: BankResumeInput,
  llmConfig: LLMConfig | null
): Promise<TailoredResume> {
  if (llmConfig) {
    return generateWithLLM(input, llmConfig);
  }
  return generateBasicFromBank(input);
}

async function generateWithLLM(
  input: BankResumeInput,
  llmConfig: LLMConfig
): Promise<TailoredResume> {
  const client = new LLMClient(llmConfig);

  const experienceEntries = formatBankCategory(input.bankEntries.experience);
  const skillEntries = formatBankCategory(input.bankEntries.skill);
  const educationEntries = formatBankCategory(input.bankEntries.education);
  const projectEntries = formatBankCategory(input.bankEntries.project);
  const hackathonEntries = formatBankCategory(input.bankEntries.hackathon);
  const achievementEntries = formatBankCategory(input.bankEntries.achievement);

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: `Generate a tailored resume for this job using ONLY the knowledge bank entries provided. The resume must fit on ONE page.

CANDIDATE:
Name: ${input.contact.name}
Email: ${input.contact.email || "N/A"}
Phone: ${input.contact.phone || "N/A"}
Location: ${input.contact.location || "N/A"}
LinkedIn: ${input.contact.linkedin || "N/A"}
GitHub: ${input.contact.github || "N/A"}
Current Summary: ${input.summary || "N/A"}

KNOWLEDGE BANK - EXPERIENCES:
${experienceEntries}

KNOWLEDGE BANK - SKILLS:
${skillEntries}

KNOWLEDGE BANK - EDUCATION:
${educationEntries}

KNOWLEDGE BANK - PROJECTS:
${projectEntries}

KNOWLEDGE BANK - HACKATHONS:
${hackathonEntries}

KNOWLEDGE BANK - ACHIEVEMENTS:
${achievementEntries}

JOB TARGET:
Title: ${input.jobTitle}
Company: ${input.company}
Description: ${input.jobDescription}

INSTRUCTIONS:
1. Write a professional summary (2-3 sentences) tailored to this job
2. Select the 2-3 most relevant experiences from the bank and rewrite bullet points
3. Each experience should have 2-4 bullet points maximum
4. Prioritize skills matching the job description
5. Include relevant achievements in experience bullet points
6. Keep everything concise - one page

Return ONLY a JSON object:
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
  "skills": ["Skill 1", "Skill 2"],
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

  const parsed = parseJSONFromLLM<{
    summary?: string;
    experiences?: TailoredResume["experiences"];
    skills?: string[];
    education?: TailoredResume["education"];
  }>(response);

  return {
    contact: input.contact,
    summary: parsed.summary || input.summary || `Experienced professional seeking ${input.jobTitle} position.`,
    experiences: parsed.experiences || [],
    skills: parsed.skills || [],
    education: parsed.education || [],
  };
}

function generateBasicFromBank(input: BankResumeInput): TailoredResume {
  // Use matched entries sorted by relevance
  const usedEntryIds = new Set<string>();
  const topExperiences = input.matchedEntries
    .filter((m) => m.entry.category === "experience" || m.entry.category === "hackathon")
    .slice(0, 3)
    .map((m) => {
      usedEntryIds.add(m.entry.id);
      return entryToResumeExperience(m.entry);
    });

  // If not enough matched experiences, fill from bank
  if (topExperiences.length < 2) {
    for (const entry of [...input.bankEntries.experience, ...input.bankEntries.hackathon]) {
      if (topExperiences.length >= 3) break;
      if (!usedEntryIds.has(entry.id)) {
        topExperiences.push(entryToResumeExperience(entry));
        usedEntryIds.add(entry.id);
      }
    }
  }

  // Collect skills - prioritize matched ones
  const matchedSkillNames = new Set<string>();
  for (const m of input.matchedEntries) {
    if (m.entry.category === "skill") {
      matchedSkillNames.add(String(m.entry.content.name || ""));
    }
  }
  const bankSkillNames = input.bankEntries.skill
    .map((e) => String(e.content.name || ""))
    .filter(Boolean);
  const allSkills = [
    ...Array.from(matchedSkillNames),
    ...bankSkillNames.filter((s) => !matchedSkillNames.has(s)),
  ].slice(0, 15);

  // Education
  const education = input.bankEntries.education.map((e) => {
    const c = e.content;
    return {
      institution: String(c.institution || ""),
      degree: String(c.degree || ""),
      field: String(c.field || ""),
      date: String(c.endDate || ""),
    };
  });

  return {
    contact: input.contact,
    summary:
      input.summary ||
      `Experienced professional seeking ${input.jobTitle} position at ${input.company}.`,
    experiences: topExperiences,
    skills: allSkills,
    education,
  };
}

function formatBankCategory(entries: BankEntry[]): string {
  if (entries.length === 0) return "(none)";
  return entries
    .map((e, i) => `${i + 1}. ${JSON.stringify(e.content)}`)
    .join("\n");
}

function entryToResumeExperience(entry: BankEntry): TailoredResume["experiences"][number] {
  const c = entry.content;
  if (entry.category === "hackathon") {
    return {
      company: String(c.organizer || "Hackathon"),
      title: String(c.name || ""),
      dates: formatDateRange(c),
      highlights: formatHackathonHighlights(c).slice(0, 4),
    };
  }

  return {
    company: String(c.company || ""),
    title: String(c.title || ""),
    dates: formatDateRange(c),
    highlights: Array.isArray(c.highlights)
      ? c.highlights.map(String).slice(0, 4)
      : [],
  };
}

function formatDateRange(content: Record<string, unknown>): string {
  const start = content.startDate ? String(content.startDate) : "";
  const end = content.endDate ? String(content.endDate) : "";
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - Present`;
  return end;
}
