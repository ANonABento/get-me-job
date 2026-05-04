import {
  DEFAULT_TIMEOUT_MS,
  decodeBasicEntities,
  fetchWithTimeout,
  slugifyCompany,
} from "./utils";
import type { EnrichmentSourceResult, LevelsEnrichment, LevelsRange } from "./types";

const MAX_RANGES = 6;

function parseCurrencyAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.kmb]/gi, "").toLowerCase();
  if (!cleaned) return null;
  const numericPart = cleaned.replace(/[kmb]/g, "");
  const value = Number.parseFloat(numericPart);
  if (Number.isNaN(value)) return null;
  if (cleaned.endsWith("m")) return Math.round(value * 1_000_000);
  if (cleaned.endsWith("b")) return Math.round(value * 1_000_000_000);
  if (cleaned.endsWith("k")) return Math.round(value * 1_000);
  return Math.round(value);
}

/**
 * Pulls compensation rows out of a levels.fyi-like HTML payload.
 * The page format is unstable; we only try to grab rows tagged with a role,
 * level, and a `$NNk` style total comp range.
 */
export function parseLevelsHtml(html: string): LevelsRange[] {
  const rangePattern =
    /<tr[^>]*data-role="([^"]+)"(?:\s+data-level="([^"]*)")?[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows: LevelsRange[] = [];

  let match: RegExpExecArray | null;
  while ((match = rangePattern.exec(html)) !== null) {
    const role = decodeBasicEntities(match[1]).trim();
    const level = match[2] ? decodeBasicEntities(match[2]).trim() : null;
    const body = match[3];

    const compRange = body.match(
      /\$([0-9.]+\s*[kKmM]?)\s*(?:-|–|—|to)\s*\$([0-9.]+\s*[kKmM]?)/,
    );
    if (!compRange) continue;
    const totalCompMin = parseCurrencyAmount(compRange[1]);
    const totalCompMax = parseCurrencyAmount(compRange[2]);
    if (totalCompMin === null && totalCompMax === null) continue;

    rows.push({
      role,
      level: level || null,
      totalCompMin,
      totalCompMax,
      currency: "USD",
    });

    if (rows.length >= MAX_RANGES) break;
  }

  return rows;
}

export function buildLevelsUrl(company: string): string {
  const slug = slugifyCompany(company);
  return `https://www.levels.fyi/companies/${slug}/salaries`;
}

export async function fetchLevelsEnrichment(
  company: string,
  options: { timeoutMs?: number } = {},
): Promise<EnrichmentSourceResult<LevelsEnrichment>> {
  const trimmed = company.trim();
  if (!trimmed) return { status: "no_data", data: null };

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = buildLevelsUrl(trimmed);

  try {
    const response = await fetchWithTimeout(url, {}, timeoutMs);
    if (response.status === 404) {
      return { status: "no_data", data: null };
    }
    if (!response.ok) {
      return {
        status: "error",
        data: null,
        error: `levels status ${response.status}`,
      };
    }
    const html = await response.text();
    const ranges = parseLevelsHtml(html);
    if (ranges.length === 0) {
      return { status: "no_data", data: null };
    }
    return {
      status: "ok",
      data: { url, ranges },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return { status: "error", data: null, error: message };
  }
}
