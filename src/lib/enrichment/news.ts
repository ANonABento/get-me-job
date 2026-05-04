import {
  DEFAULT_TIMEOUT_MS,
  decodeBasicEntities,
  fetchWithTimeout,
} from "./utils";
import type { EnrichmentSourceResult, NewsEnrichment, NewsHeadline } from "./types";

const MAX_HEADLINES = 5;

function readTag(entry: string, tag: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = entry.match(pattern);
  if (!match) return null;
  return decodeBasicEntities(stripCdata(match[1])).trim() || null;
}

function stripCdata(value: string): string {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function safeIsoDate(value: string | null): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

export function parseNewsRss(xml: string): NewsHeadline[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return items
    .slice(0, MAX_HEADLINES)
    .map((item): NewsHeadline | null => {
      const title = readTag(item, "title");
      const link = readTag(item, "link");
      if (!title || !link) return null;
      const sourceMatch = item.match(
        /<source[^>]*>([\s\S]*?)<\/source>/i,
      );
      const source = sourceMatch
        ? decodeBasicEntities(stripCdata(sourceMatch[1])).trim() || null
        : null;
      const publishedAt = safeIsoDate(readTag(item, "pubDate"));
      return { title, link, source, publishedAt };
    })
    .filter((value): value is NewsHeadline => value !== null);
}

export function buildGoogleNewsUrl(company: string): string {
  const query = `${company} when:7d`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en`;
}

export async function fetchNewsEnrichment(
  company: string,
  options: { timeoutMs?: number } = {},
): Promise<EnrichmentSourceResult<NewsEnrichment>> {
  const trimmed = company.trim();
  if (!trimmed) {
    return { status: "no_data", data: null };
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = buildGoogleNewsUrl(trimmed);

  try {
    const response = await fetchWithTimeout(url, {}, timeoutMs);
    if (!response.ok) {
      return {
        status: "error",
        data: null,
        error: `news status ${response.status}`,
      };
    }
    const xml = await response.text();
    const headlines = parseNewsRss(xml);
    if (headlines.length === 0) {
      return { status: "no_data", data: null };
    }
    return {
      status: "ok",
      data: { query: trimmed, headlines },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return { status: "error", data: null, error: message };
  }
}
