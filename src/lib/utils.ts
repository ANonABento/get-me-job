import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";
import { formatDateRelative } from "@/lib/format/time";

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

export function toIsoDateString(
  value: Date | string | null | undefined,
  fallback = new Date()
): string {
  if (!value) return fallback.toISOString();
  return value instanceof Date ? value.toISOString() : value;
}

export function toNullableIsoDateString(
  value: Date | string | null | undefined
): string | null {
  return value ? toIsoDateString(value) : null;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Extract and parse a JSON object from a string that may contain
 * surrounding prose, markdown code fences, or other non-JSON content.
 *
 * Strategies (in order):
 * 1. Direct JSON.parse
 * 2. Strip markdown code fences then parse
 * 3. Extract substring between first `{` and last `}`
 */
export function extractJSON(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const strategies: string[] = [];
  let found: Record<string, unknown> | undefined;

  // Strategy 1: Direct parse
  if (!found) {
    try {
      const result = JSON.parse(trimmed);
      if (isPlainObject(result)) {
        strategies.push("direct-parse: success");
        found = result;
      } else {
        strategies.push("direct-parse: not an object");
      }
    } catch {
      strategies.push("direct-parse: failed");
    }
  }

  // Strategy 2: Strip markdown code fences
  if (!found) {
    const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
    if (fenceMatch) {
      try {
        const result = JSON.parse(fenceMatch[1].trim());
        if (isPlainObject(result)) {
          strategies.push("fence-strip: success");
          found = result;
        } else {
          strategies.push("fence-strip: not an object");
        }
      } catch {
        strategies.push("fence-strip: failed");
      }
    } else {
      strategies.push("fence-strip: no match");
    }
  }

  // Strategy 3: Extract between first `{` and last `}`
  if (!found) {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const result = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
        if (isPlainObject(result)) {
          strategies.push("brace-extract: success");
          found = result;
        } else {
          strategies.push("brace-extract: not an object");
        }
      } catch {
        strategies.push("brace-extract: failed");
      }
    } else {
      strategies.push("brace-extract: no braces found");
    }
  }

  console.log(`[parser] extractJSON strategies tried: ${strategies.join(", ")}`);
  if (found) return found;
  throw new Error(
    `Failed to extract JSON from LLM response. Input starts with: "${trimmed.slice(0, 100)}"`
  );
}

export function formatRelativeTime(date: string | Date): string {
  return formatDateRelative(date);
}
