import { getLLMConfig } from "@/lib/db";
import { getJob } from "@/lib/db/jobs";
import { LLMClient } from "@/lib/llm/client";
import { getBasicInterviewFeedback } from "./feedback-utils";
import { InterviewJobNotFoundError } from "./questions";

export { InterviewJobNotFoundError } from "./questions";

export async function generateInterviewFeedbackForJob(
  jobId: string,
  answer: string
): Promise<string> {
  const job = getJob(jobId);
  if (!job) {
    throw new InterviewJobNotFoundError(jobId);
  }

  const llmConfig = getLLMConfig();
  if (!llmConfig) {
    return getBasicInterviewFeedback(answer);
  }

  const client = new LLMClient(llmConfig);
  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: `You are an interview coach. Provide brief, constructive feedback on this interview answer.

Job: ${job.title} at ${job.company}

Candidate's Answer:
${answer}

Provide 2-3 sentences of feedback focusing on:
- What was good about the answer
- One specific improvement suggestion

Be encouraging but honest.`,
      },
    ],
    temperature: 0.7,
    maxTokens: 300,
  });

  return response.trim();
}
