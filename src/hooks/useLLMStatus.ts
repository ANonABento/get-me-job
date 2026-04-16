"use client";

import { useState, useEffect } from "react";

interface LLMStatus {
  configured: boolean;
  provider: string | null;
}

/**
 * Hook to check if an LLM provider is configured.
 * Used by the sidebar to show a status indicator.
 */
export function useLLMStatus() {
  const [status, setStatus] = useState<LLMStatus>({
    configured: false,
    provider: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const response = await fetch("/api/settings/status");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setStatus(data);
        }
      } catch {
        // Silently fail - sidebar indicator just stays gray
      }
    }

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
