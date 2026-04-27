import { LLMClient } from "@/lib/llm/client";
import type { LLMConfig, BankEntry, GroupedBankEntries } from "@/types";

export interface CoverLetterInput {
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  bankEntries: GroupedBankEntries;
  userName?: string;
}

function formatBankContext(bankEntries: GroupedBankEntries): string {
  const sections: string[] = [];

  if (bankEntries.experience.length > 0) {
    sections.push(
      "## Work Experience\n" +
        bankEntries.experience
          .map((e) => formatEntryContent(e))
          .join("\n")
    );
  }

  if (bankEntries.skill.length > 0) {
    sections.push(
      "## Skills\n" +
        bankEntries.skill.map((e) => formatEntryContent(e)).join(", ")
    );
  }

  if (bankEntries.project.length > 0) {
    sections.push(
      "## Projects\n" +
        bankEntries.project.map((e) => formatEntryContent(e)).join("\n")
    );
  }

  if (bankEntries.education.length > 0) {
    sections.push(
      "## Education\n" +
        bankEntries.education.map((e) => formatEntryContent(e)).join("\n")
    );
  }

  if (bankEntries.achievement.length > 0) {
    sections.push(
      "## Achievements\n" +
        bankEntries.achievement.map((e) => formatEntryContent(e)).join("\n")
    );
  }

  if (bankEntries.certification.length > 0) {
    sections.push(
      "## Certifications\n" +
        bankEntries.certification.map((e) => formatEntryContent(e)).join("\n")
    );
  }

  return sections.join("\n\n");
}

function formatEntryContent(entry: BankEntry): string {
  const c = entry.content;
  const parts: string[] = [];

  if (c.title && c.company) {
    parts.push(`- ${c.title} at ${c.company}`);
  } else if (c.name) {
    parts.push(`- ${c.name}`);
  } else if (c.description) {
    parts.push(`- ${c.description}`);
  } else if (c.institution) {
    parts.push(`- ${c.degree} at ${c.institution}`);
  } else {
    parts.push(`- ${JSON.stringify(c)}`);
  }

  if (c.highlights && Array.isArray(c.highlights)) {
    for (const h of c.highlights) {
      parts.push(`  - ${h}`);
    }
  }

  return parts.join("\n");
}

export function buildSystemPrompt(input: CoverLetterInput): string {
  const bankContext = formatBankContext(input.bankEntries);
  const company = input.company || "the company";
  const jobTitle = input.jobTitle || "the position";

  return `You are an expert cover letter writer. Generate professional, compelling cover letters tailored to specific job descriptions.

## Candidate Background
${bankContext}

## Guidelines
- Write in first person
- Be specific about how the candidate's experience matches the job requirements
- Keep it concise (3-4 paragraphs)
- Use a professional but personable tone
- Reference specific skills, projects, and achievements from the candidate's background
- Address the letter to "${company}" for the "${jobTitle}" position
${input.userName ? `- The candidate's name is ${input.userName}` : ""}
- Do NOT include placeholder brackets like [Your Name] - use the candidate's actual name or omit
- Output ONLY the cover letter text, no additional commentary`;
}

export function buildRevisionPrompt(instruction: string): string {
  return `Revise the cover letter based on this feedback: "${instruction}"

Apply the requested changes while maintaining professional quality. Output ONLY the revised cover letter text, no additional commentary.`;
}

export function buildSelectionRewritePrompt(
  selectedText: string,
  instruction: string
): string {
  return `Rewrite only this selected passage based on the instruction: "${instruction}"

Selected passage:
${selectedText}

Keep the rewritten passage compatible with the surrounding cover letter. Output ONLY the rewritten passage, no additional commentary.`;
}

export async function generateCoverLetter(
  input: CoverLetterInput,
  llmConfig: LLMConfig
): Promise<string> {
  const client = new LLMClient(llmConfig);
  const systemPrompt = buildSystemPrompt(input);

  const result = await client.complete({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Write a cover letter for this job:\n\n${input.jobDescription}`,
      },
    ],
    temperature: 0.7,
    maxTokens: 2048,
  });

  return result.trim();
}

export async function reviseCoverLetter(
  currentContent: string,
  instruction: string,
  input: CoverLetterInput,
  llmConfig: LLMConfig
): Promise<string> {
  const client = new LLMClient(llmConfig);
  const systemPrompt = buildSystemPrompt(input);

  const result = await client.complete({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Write a cover letter for this job:\n\n${input.jobDescription}`,
      },
      { role: "assistant", content: currentContent },
      { role: "user", content: buildRevisionPrompt(instruction) },
    ],
    temperature: 0.7,
    maxTokens: 2048,
  });

  return result.trim();
}

export async function rewriteCoverLetterSelection(
  currentContent: string,
  selectedText: string,
  instruction: string,
  input: CoverLetterInput,
  llmConfig: LLMConfig
): Promise<string> {
  const client = new LLMClient(llmConfig);
  const systemPrompt = buildSystemPrompt(input);

  const result = await client.complete({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Write a cover letter for this job:\n\n${input.jobDescription}`,
      },
      { role: "assistant", content: currentContent },
      {
        role: "user",
        content: buildSelectionRewritePrompt(selectedText, instruction),
      },
    ],
    temperature: 0.7,
    maxTokens: 512,
  });

  return result.trim();
}

export function getTotalBankEntries(bankEntries: GroupedBankEntries): number {
  return Object.values(bankEntries).flat().length;
}
