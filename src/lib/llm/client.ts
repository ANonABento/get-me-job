import type { LLMConfig } from "@/types";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompletionOptions {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

export class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async complete(options: CompletionOptions): Promise<string> {
    const { messages, temperature = 0.7, maxTokens = 4096 } = options;

    switch (this.config.provider) {
      case "openai":
        return this.completeOpenAI(messages, temperature, maxTokens);
      case "anthropic":
        return this.completeAnthropic(messages, temperature, maxTokens);
      case "ollama":
        return this.completeOllama(messages, temperature, maxTokens);
      case "openrouter":
        return this.completeOpenRouter(messages, temperature, maxTokens);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  private async completeOpenAI(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4o-mini",
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async completeAnthropic(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const systemMessage = messages.find((m) => m.role === "system");
    const otherMessages = messages.filter((m) => m.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model || "claude-3-haiku-20240307",
        max_tokens: maxTokens,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async completeOllama(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const baseUrl = this.config.baseUrl || "http://localhost:11434";

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model || "llama3.2",
        messages,
        stream: false,
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

    const data = await response.json();
    return data.message.content;
  }

  private async completeOpenRouter(
    messages: Message[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || "meta-llama/llama-3.2-3b-instruct:free",
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Helper to get LLM client from settings
export async function getLLMClient(): Promise<LLMClient | null> {
  // This will be called from API routes where we can access the database
  return null;
}
