import type { BankEntry, ContactInfo, GroupedBankEntries } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import { getAtsStrictnessGuidance } from "./ats-strictness";
import type { TailorSettings } from "./settings";

export interface TailoredResumePromptInput {
  bankEntries: GroupedBankEntries;
  contact: ContactInfo;
  summary?: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  settings?: TailorSettings;
}

export interface TailorAutofixPromptInput {
  resume: TailoredResume;
  keywordsMissing: string[];
  jobTitle?: string;
  company?: string;
  jobDescription: string;
}

export function buildTailoredResumePrompt(
  input: TailoredResumePromptInput,
  promptVariantContent: string,
): string {
  const experienceEntries = formatBankCategory(input.bankEntries.experience);
  const skillEntries = formatBankCategory(input.bankEntries.skill);
  const educationEntries = formatBankCategory(input.bankEntries.education);
  const projectEntries = formatBankCategory(input.bankEntries.project);
  const hackathonEntries = formatBankCategory(input.bankEntries.hackathon);
  const bulletEntries = formatBankCategory(input.bankEntries.bullet);
  const achievementEntries = formatBankCategory(input.bankEntries.achievement);
  const certificationEntries = formatBankCategory(
    input.bankEntries.certification,
  );

  return `Generate a tailored resume for this job using ONLY the knowledge bank entries provided. The resume must fit on ONE page.

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

KNOWLEDGE BANK - RESUME BULLETS:
${bulletEntries}

KNOWLEDGE BANK - ACHIEVEMENTS:
${achievementEntries}

KNOWLEDGE BANK - CERTIFICATIONS:
${certificationEntries}

JOB TARGET:
Title: ${input.jobTitle}
Company: ${input.company}
Description: ${input.jobDescription}

NON-OVERRIDABLE SAFETY RULES:
- Every added keyword, skill, tool, metric, employer, degree, certification, responsibility, and achievement must be backed by explicit knowledge bank evidence above
- Incorporate missing job keywords only when bank entries already support them; omit unsupported keywords rather than inventing support
- Do not invent metrics, tools, employers, degrees, certifications, dates, job titles, clients, or responsibilities
- Preserve contact details and education exactly from the source data; preserve employers, titles, and dates exactly for selected experiences
- If AWS, Kubernetes, or any other requested keyword is absent from the knowledge bank evidence, do not include it anywhere in the JSON
- Return schema-valid JSON only, with no markdown, labels, comments, or surrounding prose

STYLE AND PRIORITIZATION GUIDANCE:
${promptVariantContent}

ATS FORMATTING GUIDANCE:
${getAtsStrictnessGuidance(input.settings?.atsStrictness ?? "balanced")}

Return ONLY a JSON object:
{
  "contact": ${JSON.stringify(input.contact)},
  "summary": "Tailored professional summary...",
  "experiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "dates": "Jan 2020 - Present",
      "highlights": ["Achievement 1 with supported metrics", "Achievement 2"]
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
}`;
}

export function buildTailorAutofixPrompt({
  resume,
  keywordsMissing,
  jobTitle,
  company,
  jobDescription,
}: TailorAutofixPromptInput): string {
  const targetJob =
    jobTitle || company
      ? `\nTARGET JOB:\nTitle: ${jobTitle || "N/A"}\nCompany: ${company || "N/A"}\n`
      : "";

  return `You are a resume optimization expert. Rewrite the following resume to naturally incorporate these missing keywords while maintaining authenticity and readability.

MISSING KEYWORDS TO INCORPORATE:
${keywordsMissing.slice(0, 15).join(", ")}
${targetJob}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

RULES:
- Only modify summary, experience highlights, and skills
- Every added keyword, skill, tool, metric, employer, degree, certification, responsibility, and achievement must be backed by the current resume evidence
- Add GraphQL only when the current resume already contains GraphQL or direct evidence of GraphQL work
- Refuse or omit AWS, Kubernetes, and any other missing keyword when absent from the current resume evidence
- Do not invent metrics, tools, employers, degrees, certifications, dates, titles, clients, or responsibilities
- Keep contact info and education unchanged
- Preserve contact info and education exactly
- Preserve companies, titles, and dates exactly
- Incorporate supported keywords naturally; don't just list them
- Maintain the same JSON structure
- Keep it concise (one-page resume)
- Return schema-valid JSON only, with no markdown, labels, comments, or surrounding prose

Return the improved resume as a JSON object with the same structure (contact, summary, experiences, skills, education).`;
}

export function formatBankCategory(entries: BankEntry[]): string {
  if (entries.length === 0) return "(none)";
  return entries
    .map((e, i) => `${i + 1}. ${JSON.stringify(e.content)}`)
    .join("\n");
}
