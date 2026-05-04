import { DEFAULT_TIMEOUT_MS, fetchWithTimeout } from "./utils";
import type { EnrichmentSourceResult, HnEnrichment, HnMention } from "./types";

const MAX_MENTIONS = 5;
const ALGOLIA_HN_BASE = "https://hn.algolia.com/api/v1/search";

interface AlgoliaHit {
  objectID: string;
  title: string | null;
  url: string | null;
  points: number | null;
  num_comments: number | null;
  created_at: string;
}

interface AlgoliaResponse {
  hits: AlgoliaHit[];
}

export function parseHnHits(hits: AlgoliaHit[]): HnMention[] {
  return hits
    .slice(0, MAX_MENTIONS)
    .map((hit): HnMention | null => {
      if (!hit.title) return null;
      return {
        title: hit.title,
        url: hit.url ?? null,
        hnUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        points: hit.points ?? 0,
        numComments: hit.num_comments ?? 0,
        createdAt: hit.created_at,
      };
    })
    .filter((mention): mention is HnMention => mention !== null);
}

export function buildHnUrl(company: string): string {
  const thirtyDaysAgoUnix = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const params = new URLSearchParams({
    query: company,
    tags: "story",
    numericFilters: `created_at_i>${thirtyDaysAgoUnix}`,
    hitsPerPage: String(MAX_MENTIONS),
  });
  return `${ALGOLIA_HN_BASE}?${params.toString()}`;
}

export async function fetchHnEnrichment(
  company: string,
  options: { timeoutMs?: number } = {},
): Promise<EnrichmentSourceResult<HnEnrichment>> {
  const trimmed = company.trim();
  if (!trimmed) return { status: "no_data", data: null };

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = buildHnUrl(trimmed);

  try {
    const response = await fetchWithTimeout(url, {}, timeoutMs);
    if (!response.ok) {
      return {
        status: "error",
        data: null,
        error: `hn status ${response.status}`,
      };
    }
    const json = (await response.json()) as AlgoliaResponse;
    const hits = Array.isArray(json?.hits) ? json.hits : [];
    const mentions = parseHnHits(hits);
    if (mentions.length === 0) {
      return { status: "no_data", data: null };
    }
    return {
      status: "ok",
      data: { query: trimmed, mentions },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return { status: "error", data: null, error: message };
  }
}
