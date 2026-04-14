import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a cryptographically secure random ID.
 * Uses crypto.randomBytes for security-sensitive operations like file names,
 * database IDs, and tokens.
 */
export function generateId(): string {
  return randomBytes(12).toString("hex");
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract and parse a JSON object from an LLM response string.
 * Tries multiple strategies: direct parse, brace extraction, markdown fence removal.
 * Throws with a clear message if no valid JSON can be found.
 */
export function extractJSON(text: string): Record<string, unknown> {
  const trimmed = text.trim();

  // Strategy 1: Direct JSON.parse
  try {
    const result = JSON.parse(trimmed);
    if (result !== null && typeof result === "object" && !Array.isArray(result)) {
      return result;
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Remove markdown code fences then parse
  const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/;
  const fenceMatch = trimmed.match(fenceRegex);
  if (fenceMatch) {
    try {
      const result = JSON.parse(fenceMatch[1].trim());
      if (result !== null && typeof result === "object" && !Array.isArray(result)) {
        return result;
      }
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 3: Extract between first { and last }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const result = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      if (result !== null && typeof result === "object" && !Array.isArray(result)) {
        return result;
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(
    "Failed to extract JSON from LLM response. The response did not contain valid JSON."
  );
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
