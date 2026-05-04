import {
  DEFAULT_TIMEOUT_MS,
  decodeBasicEntities,
  fetchWithTimeout,
  stripHtml,
} from "./utils";
import type { BlogEnrichment, BlogPostSnippet, EnrichmentSourceResult } from "./types";

const MAX_POSTS = 3;
const MAX_EXCERPT_CHARS = 320;

interface CandidatePost {
  title: string;
  url: string;
}

function resolveUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Naively extract anchors that look like blog posts on a listing page.
 * We require an absolute or root-relative href, an inner text >= 12 chars,
 * and (heuristically) a path that contains digits or 4+ hyphens (slug-like).
 */
export function extractBlogCandidates(
  html: string,
  baseUrl: string,
): CandidatePost[] {
  const anchorPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set<string>();
  const posts: CandidatePost[] = [];

  let match: RegExpExecArray | null;
  while ((match = anchorPattern.exec(html)) !== null) {
    const href = match[1];
    const innerText = stripHtml(match[2]);
    if (!innerText || innerText.length < 12) continue;

    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) continue;

    const url = new URL(resolved);
    const baseHost = new URL(baseUrl).hostname;
    if (url.hostname !== baseHost) continue;

    const path = url.pathname;
    const slugLike = /\d/.test(path) || (path.match(/-/g)?.length ?? 0) >= 4;
    if (!slugLike) continue;
    if (path === "/" || path.split("/").filter(Boolean).length < 2) continue;

    const normalized = url.toString();
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    posts.push({
      title: decodeBasicEntities(innerText),
      url: normalized,
    });
    if (posts.length >= MAX_POSTS) break;
  }

  return posts;
}

export function extractFirstParagraph(html: string): string {
  const paragraphMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!paragraphMatch) return "";
  const text = stripHtml(paragraphMatch[1]);
  if (text.length <= MAX_EXCERPT_CHARS) return text;
  return `${text.slice(0, MAX_EXCERPT_CHARS).trimEnd()}…`;
}

function blogUrlCandidates(sourceUrl: string | null | undefined): string[] {
  if (!sourceUrl) return [];
  try {
    const url = new URL(sourceUrl);
    const root = `${url.protocol}//${url.hostname}`;
    return [
      `${root}/blog`,
      `${url.protocol}//eng.${url.hostname.replace(/^www\./, "")}`,
    ];
  } catch {
    return [];
  }
}

export async function fetchBlogEnrichment(
  sourceUrl: string | null | undefined,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<EnrichmentSourceResult<BlogEnrichment>> {
  const candidates = blogUrlCandidates(sourceUrl);
  if (candidates.length === 0) {
    return { status: "no_data", data: null };
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError: string | null = null;

  for (const blogUrl of candidates) {
    try {
      const response = await fetchWithTimeout(blogUrl, {}, timeoutMs);
      if (!response.ok) {
        lastError = `blog status ${response.status} at ${blogUrl}`;
        continue;
      }
      const html = await response.text();
      const candidatesList = extractBlogCandidates(html, blogUrl);
      if (candidatesList.length === 0) continue;

      const posts: BlogPostSnippet[] = [];
      for (const candidate of candidatesList) {
        try {
          const postResponse = await fetchWithTimeout(
            candidate.url,
            {},
            timeoutMs,
          );
          if (!postResponse.ok) continue;
          const postHtml = await postResponse.text();
          const excerpt = extractFirstParagraph(postHtml);
          if (!excerpt) continue;
          posts.push({
            title: candidate.title,
            url: candidate.url,
            excerpt,
          });
        } catch {
          continue;
        }
      }

      if (posts.length === 0) continue;
      return { status: "ok", data: { blogUrl, posts } };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "unknown error";
    }
  }

  if (lastError) {
    return { status: "error", data: null, error: lastError };
  }
  return { status: "no_data", data: null };
}
