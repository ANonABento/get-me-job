import {
  buildDocumentRewritePrompt,
  type DocumentAssistantAction,
} from "@/lib/document-assistant";
import { LLMClient } from "@/lib/llm/client";
import type { LLMConfig } from "@/types";

export async function rewriteDocumentSelection(
  options: {
    action: DocumentAssistantAction;
    selectedText: string;
    documentContent: string;
    jobDescription?: string;
  },
  llmConfig: LLMConfig,
): Promise<string> {
  const client = new LLMClient(llmConfig);
  const result = await client.complete({
    messages: [
      {
        role: "system",
        content:
          "You are an expert job-search writing assistant. Rewrite only the selected document text and preserve the candidate's facts.",
      },
      {
        role: "user",
        content: buildDocumentRewritePrompt(options),
      },
    ],
    temperature: 0.4,
    maxTokens: 700,
  });

  return result.trim();
}
