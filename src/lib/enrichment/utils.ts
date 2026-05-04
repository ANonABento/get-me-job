export const DEFAULT_TIMEOUT_MS = 5000;
export const ENRICHMENT_USER_AGENT =
  "get-me-job/1.0 (+https://github.com/get-me-job; opensource job tracker)";

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent": ENRICHMENT_USER_AGENT,
        accept: "*/*",
        ...(init.headers ?? {}),
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Best-effort guess for a GitHub org slug.
 * Tries the source URL first (e.g. `github.com/<org>/...`),
 * then falls back to a slug derived from the company name.
 */
export function guessGithubOrg(
  company: string,
  sourceUrl?: string | null,
): string {
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      if (url.hostname.endsWith("github.com")) {
        const segment = url.pathname.split("/").filter(Boolean)[0];
        if (segment) return segment;
      }
    } catch {
      // ignore parse failures and fall through
    }
  }
  return slugifyCompany(company);
}

export function slugifyCompany(company: string): string {
  return company
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strips HTML tags, decodes a small set of entities, and collapses whitespace. */
export function stripHtml(html: string): string {
  const noTags = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeBasicEntities(noTags).replace(/\s+/g, " ").trim();
}

export function decodeBasicEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 10)),
    );
}
