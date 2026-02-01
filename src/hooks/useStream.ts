"use client";

import { useState, useCallback, useRef } from "react";

interface UseStreamOptions {
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
}

interface StreamState {
  content: string;
  isStreaming: boolean;
  error: Error | null;
}

export function useStream(options: UseStreamOptions = {}) {
  const { onComplete, onError } = options;
  const [state, setState] = useState<StreamState>({
    content: "",
    isStreaming: false,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (
      url: string,
      body: Record<string, unknown>,
      method: "POST" | "GET" = "POST"
    ) => {
      // Cancel any existing stream
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState({ content: "", isStreaming: true, error: null });

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: method === "POST" ? JSON.stringify({ ...body, stream: true }) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

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
                const chunk = json.content || json.text || json.delta?.content || "";
                if (chunk) {
                  fullContent += chunk;
                  setState((prev) => ({
                    ...prev,
                    content: fullContent,
                  }));
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

        setState((prev) => ({ ...prev, isStreaming: false }));
        onComplete?.(fullContent);
        return fullContent;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          setState((prev) => ({ ...prev, isStreaming: false }));
          return state.content;
        }
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ content: "", isStreaming: false, error: err });
        onError?.(err);
        throw err;
      }
    },
    [onComplete, onError, state.content]
  );

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({ content: "", isStreaming: false, error: null });
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}

// Simplified hook for common text generation use cases
export function useTextGeneration(url: string) {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (body: Record<string, unknown>) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setText("");
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed: ${response.status}`);
        }

        // Check if response is streaming (SSE)
        const contentType = response.headers.get("Content-Type") || "";
        if (contentType.includes("text/event-stream")) {
          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let buffer = "";
          let fullText = "";

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
                  const chunk = json.content || json.text || "";
                  if (chunk) {
                    fullText += chunk;
                    setText(fullText);
                  }
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }

          setIsGenerating(false);
          return fullText;
        } else {
          // Non-streaming response
          const data = await response.json();
          const result = data.content || data.text || JSON.stringify(data);
          setText(result);
          setIsGenerating(false);
          return result;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsGenerating(false);
          return text;
        }
        const errorMsg = err instanceof Error ? err.message : "Generation failed";
        setError(errorMsg);
        setIsGenerating(false);
        throw err;
      }
    },
    [url, text]
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setText("");
    setIsGenerating(false);
    setError(null);
  }, []);

  return {
    text,
    isGenerating,
    error,
    generate,
    stop,
    reset,
  };
}
