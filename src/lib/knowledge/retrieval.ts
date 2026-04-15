/**
 * Retrieval pipeline: query expansion → search → rerank → assembly.
 *
 * Takes a job description and assembles a tailored resume from the
 * knowledge bank using LLM-powered query expansion and assembly.
 */

import type { LLMConfig } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { multiQuerySearch, type RankedChunk, bankEntryToText } from "./knowledge-bank";

/** Result of the full retrieval pipeline */
export interface RetrievalResult {
  resume: TailoredResume;
  chunks: RankedChunk[];
  gaps: string[];
  queryCount: number;
}

/**
 * Extract key requirements from a job description as separate search queries.
 *
 * Uses the LLM to identify 5-10 distinct requirements, skills, or qualifications
 * that can each be used as an independent search query against the knowledge bank.
 */
export async function expandQuery(
  jobDescription: string,
  llmConfig: LLMConfig
): Promise<string[]> {
  const client = new LLMClient(llmConfig);

  const response = await client.complete({
    messages: [
      {
        role: "system",
        content: `You extract key requirements from job descriptions as search queries.
Return a JSON object with a "queries" array of 5-10 strings.
Each query should be a specific requirement, skill, or qualification.
Focus on: technical skills, tools, experience areas, soft skills, and domain knowledge.
Be specific — "3 years React experience" is better than "frontend development".`,
      },
      {
        role: "user",
        content: `Extract the key requirements from this job description as search queries:\n\n${jobDescription}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 1000,
  });

  const parsed = parseJSONFromLLM<{ queries: string[] }>(response);

  if (!Array.isArray(parsed.queries) || parsed.queries.length === 0) {
    throw new Error("LLM did not return valid queries array");
  }

  return parsed.queries.slice(0, 10);
}

/**
 * Retrieve and rank knowledge bank chunks for the given queries.
 *
 * For each query, performs KNN-style search over the bank, then unions
 * and deduplicates results by chunk ID, keeping the highest score.
 */
export function retrieveChunks(
  userId: string,
  queries: string[],
  limitPerQuery: number = 20
): RankedChunk[] {
  return multiQuerySearch(queries, userId, limitPerQuery);
}

/**
 * Use the LLM to assemble a tailored resume from retrieved chunks.
 *
 * Groups chunks by category, formats them as context, and asks the LLM
 * to produce a structured TailoredResume that covers the job requirements.
 */
export async function assembleResume(
  chunks: RankedChunk[],
  jobDescription: string,
  llmConfig: LLMConfig
): Promise<{ resume: TailoredResume; gaps: string[] }> {
  const client = new LLMClient(llmConfig);

  // Group chunks by category for the LLM prompt
  const grouped = groupChunksByCategory(chunks);

  const response = await client.complete({
    messages: [
      {
        role: "system",
        content: `You are a professional resume writer. You will receive:
1. A job description
2. Candidate data chunks grouped by category (experience, skill, project, education, etc.)

Your tasks:
- Assemble a tailored one-page resume from the candidate data
- Select the most relevant experiences (2-3) and rewrite bullet points for this specific job
- Prioritize skills that match the job requirements
- Write a professional summary (2-3 sentences) tailored to this job
- Identify any job requirements that have NO matching candidate data

Return a JSON object with this exact structure:
{
  "resume": {
    "contact": { "name": "", "email": "", "phone": "", "location": "" },
    "summary": "Tailored professional summary...",
    "experiences": [
      {
        "company": "Company Name",
        "title": "Job Title",
        "dates": "Jan 2020 - Present",
        "highlights": ["Achievement with metrics", "Another achievement"]
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
  },
  "gaps": ["Requirement X has no matching experience", "No certification for Y"]
}`,
      },
      {
        role: "user",
        content: `JOB DESCRIPTION:
${jobDescription}

CANDIDATE DATA:
${formatGroupedChunks(grouped)}

Assemble a tailored resume and identify any gaps.`,
      },
    ],
    temperature: 0.4,
    maxTokens: 3000,
  });

  const parsed = parseJSONFromLLM<{
    resume: TailoredResume;
    gaps: string[];
  }>(response);

  // Ensure gaps is always an array
  const gaps = Array.isArray(parsed.gaps) ? parsed.gaps : [];

  return {
    resume: {
      contact: parsed.resume?.contact || { name: "" },
      summary: parsed.resume?.summary || "",
      experiences: parsed.resume?.experiences || [],
      skills: parsed.resume?.skills || [],
      education: parsed.resume?.education || [],
    },
    gaps,
  };
}

/**
 * Run the full retrieval pipeline.
 *
 * 1. Expand job description into search queries
 * 2. Retrieve relevant chunks from knowledge bank
 * 3. Assemble tailored resume from chunks
 * 4. Identify coverage gaps
 */
export async function runRetrievalPipeline(
  jobDescription: string,
  userId: string,
  llmConfig: LLMConfig
): Promise<RetrievalResult> {
  // Step 1: Query expansion
  const queries = await expandQuery(jobDescription, llmConfig);

  // Step 2: Retrieve chunks
  const chunks = retrieveChunks(userId, queries);

  // Step 3: Assemble resume + gap analysis
  const { resume, gaps } = await assembleResume(chunks, jobDescription, llmConfig);

  return {
    resume,
    chunks,
    gaps,
    queryCount: queries.length,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────

type GroupedChunks = Record<string, RankedChunk[]>;

function groupChunksByCategory(chunks: RankedChunk[]): GroupedChunks {
  const grouped: GroupedChunks = {};
  for (const chunk of chunks) {
    if (!grouped[chunk.category]) {
      grouped[chunk.category] = [];
    }
    grouped[chunk.category].push(chunk);
  }
  return grouped;
}

function formatGroupedChunks(grouped: GroupedChunks): string {
  const sections: string[] = [];

  for (const [category, chunks] of Object.entries(grouped)) {
    const header = `## ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    const items = chunks.map((chunk, i) => {
      const text = bankEntryToText({
        id: chunk.id,
        userId: "",
        category: chunk.category,
        content: chunk.content,
        confidenceScore: chunk.score,
        createdAt: "",
      });
      return `${i + 1}. ${text}`;
    });
    sections.push(`${header}\n${items.join("\n")}`);
  }

  return sections.join("\n\n");
}
