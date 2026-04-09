import type { LLMConfig } from "@/types";
import {
  DEFAULT_LLM_TIMEOUT_MS,
  DEFAULT_MODEL_BY_PROVIDER,
  LLM_ENDPOINTS,
} from "@/shared/llm/config";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompletionOptions {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

interface StreamCompletionOptions extends CompletionOptions {
  onChunk?: (chunk: string) => void;
}

export class LLMClient {
  private config: LLMConfig;
  private defaultTimeoutMs: number;

  constructor(config: LLMConfig, defaultTimeoutMs = DEFAULT_LLM_TIMEOUT_MS) {
    this.config = config;
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  private createAbortController(timeoutMs?: number): { controller: AbortController; cleanup: () => void } {
    const controller = new AbortController();
    const timeout = timeoutMs ?? this.defaultTimeoutMs;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    return {
      controller,
      cleanup: () => clearTimeout(timeoutId),
    };
  }

  async complete(options: CompletionOptions): Promise<string> {
    const { messages, temperature = 0.7, maxTokens = 4096, timeoutMs } = options;

    switch (this.config.provider) {
      case "openai":
        return this.completeOpenAI(messages, temperature, maxTokens, timeoutMs);
      case "anthropic":
        return this.completeAnthropic(messages, temperature, maxTokens, timeoutMs);
      case "ollama":
        return this.completeOllama(messages, temperature, maxTokens, timeoutMs);
      case "openrouter":
        return this.completeOpenRouter(messages, temperature, maxTokens, timeoutMs);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  async *stream(options: StreamCompletionOptions): AsyncGenerator<string, string, unknown> {
    const { messages, temperature = 0.7, maxTokens = 4096, onChunk } = options;
    let fullContent = "";

    switch (this.config.provider) {
      case "openai":
        for await (const chunk of this.streamOpenAI(messages, temperature, maxTokens)) {
          fullContent += chunk;
          onChunk?.(chunk);
          yield chunk;
        }
        break;
      case "anthropic":
        for await (const chunk of this.streamAnthropic(messages, temperature, maxTokens)) {
          fullContent += chunk;
          onChunk?.(chunk);
          yield chunk;
        }
        break;
      case "ollama":
        for await (const chunk of this.streamOllama(messages, temperature, maxTokens)) {
          fullContent += chunk;
          onChunk?.(chunk);
          yield chunk;
        }
        break;
      case "openrouter":
        for await (const chunk of this.streamOpenRouter(messages, temperature, maxTokens)) {
          fullContent += chunk;
          onChunk?.(chunk);
          yield chunk;
        }
        break;
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }

    return fullContent;
  }

  private async *streamOpenAI(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const response = await fetch(LLM_ENDPOINTS.openai, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.openai,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  }

  private async *streamAnthropic(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const systemMessage = messages.find((m) => m.role === "system");
    const otherMessages = messages.filter((m) => m.role !== "system");

    const response = await fetch(LLM_ENDPOINTS.anthropic, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.anthropic,
        max_tokens: maxTokens,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.type === "content_block_delta") {
              const text = json.delta?.text;
              if (text) yield text;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  private async *streamOllama(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const baseUrl = this.config.baseUrl || LLM_ENDPOINTS.ollama;

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.ollama,
        messages,
        stream: true,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            const content = json.message?.content;
            if (content) yield content;
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  private async *streamOpenRouter(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const response = await fetch(LLM_ENDPOINTS.openrouter, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.openrouter,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  private async completeOpenAI(
    messages: Message[],
    temperature: number,
    maxTokens: number,
    timeoutMs?: number
  ): Promise<string> {
    const { controller, cleanup } = this.createAbortController(timeoutMs);
    try {
      const response = await fetch(LLM_ENDPOINTS.openai, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.openai,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } finally {
      cleanup();
    }
  }

  private async completeAnthropic(
    messages: Message[],
    temperature: number,
    maxTokens: number,
    timeoutMs?: number
  ): Promise<string> {
    const systemMessage = messages.find((m) => m.role === "system");
    const otherMessages = messages.filter((m) => m.role !== "system");

    const { controller, cleanup } = this.createAbortController(timeoutMs);
    try {
      const response = await fetch(LLM_ENDPOINTS.anthropic, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.anthropic,
          max_tokens: maxTokens,
          system: systemMessage?.content,
          messages: otherMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } finally {
      cleanup();
    }
  }

  private async completeOllama(
    messages: Message[],
    temperature: number,
    maxTokens: number,
    timeoutMs?: number
  ): Promise<string> {
    const baseUrl = this.config.baseUrl || LLM_ENDPOINTS.ollama;

    const { controller, cleanup } = this.createAbortController(timeoutMs);
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.ollama,
          messages,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${error}`);
      }

      const data = await response.json();
      return data.message.content;
    } finally {
      cleanup();
    }
  }

  private async completeOpenRouter(
    messages: Message[],
    temperature: number,
    maxTokens: number,
    timeoutMs?: number
  ): Promise<string> {
    const { controller, cleanup } = this.createAbortController(timeoutMs);
    try {
      const response = await fetch(LLM_ENDPOINTS.openrouter, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || DEFAULT_MODEL_BY_PROVIDER.openrouter,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } finally {
      cleanup();
    }
  }
}

// Helper to get LLM client from settings
export async function getLLMClient(): Promise<LLMClient | null> {
  // This will be called from API routes where we can access the database
  return null;
}

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
export function parseJSONFromLLM<T>(response: string): T {
  // Remove markdown code blocks if present
  let cleaned = response.trim();

  // Handle ```json ... ``` format
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  // Try to find JSON object or array
  const jsonStart = cleaned.indexOf("{");
  const arrayStart = cleaned.indexOf("[");

  let start = -1;
  if (jsonStart >= 0 && arrayStart >= 0) {
    start = Math.min(jsonStart, arrayStart);
  } else if (jsonStart >= 0) {
    start = jsonStart;
  } else if (arrayStart >= 0) {
    start = arrayStart;
  }

  if (start > 0) {
    cleaned = cleaned.slice(start);
  }

  // Find matching end bracket
  const isArray = cleaned.startsWith("[");
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  let depth = 0;
  let end = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === openBracket) {
      depth++;
    } else if (char === closeBracket) {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end > 0) {
    cleaned = cleaned.slice(0, end);
  }

  return JSON.parse(cleaned) as T;
}
