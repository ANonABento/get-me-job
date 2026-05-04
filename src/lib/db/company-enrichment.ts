import db from "./schema";
import { generateId } from "@/lib/utils";
import type { CompanyEnrichment } from "@/lib/enrichment/types";

const ENRICHMENT_TTL_MS = 24 * 60 * 60 * 1000;

interface CompanyEnrichmentRow {
  id: string;
  user_id: string;
  company_name: string;
  enrichment_json: string;
  enriched_at: string;
}

export interface StoredCompanyEnrichment {
  id: string;
  companyName: string;
  enrichment: CompanyEnrichment;
  enrichedAt: string;
}

function normalizeCompanyName(companyName: string): string {
  return companyName.toLowerCase().trim();
}

function rowToEnrichment(row: CompanyEnrichmentRow): StoredCompanyEnrichment {
  return {
    id: row.id,
    companyName: row.company_name,
    enrichment: JSON.parse(row.enrichment_json) as CompanyEnrichment,
    enrichedAt: row.enriched_at,
  };
}

export function getCompanyEnrichment(
  companyName: string,
  userId: string = "default",
): StoredCompanyEnrichment | null {
  const row = db
    .prepare(
      "SELECT * FROM company_enrichment WHERE user_id = ? AND LOWER(company_name) = ?",
    )
    .get(userId, normalizeCompanyName(companyName)) as
    | CompanyEnrichmentRow
    | undefined;
  if (!row) return null;
  return rowToEnrichment(row);
}

export function saveCompanyEnrichment(
  companyName: string,
  enrichment: CompanyEnrichment,
  userId: string = "default",
): StoredCompanyEnrichment {
  const id = generateId();
  const now = new Date().toISOString();
  const normalized = normalizeCompanyName(companyName);

  db.prepare(
    `
    INSERT INTO company_enrichment (id, user_id, company_name, enrichment_json, enriched_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, company_name) DO UPDATE SET
      enrichment_json = excluded.enrichment_json,
      enriched_at = excluded.enriched_at
  `,
  ).run(id, userId, normalized, JSON.stringify(enrichment), now);

  const saved = getCompanyEnrichment(normalized, userId);
  if (!saved) throw new Error("Failed to persist company enrichment");
  return saved;
}

export function isEnrichmentFresh(
  enrichedAt: string,
  ttlMs: number = ENRICHMENT_TTL_MS,
  now: Date = new Date(),
): boolean {
  const enriched = new Date(enrichedAt).getTime();
  if (Number.isNaN(enriched)) return false;
  return now.getTime() - enriched < ttlMs;
}

export const ENRICHMENT_TTL_MS_VALUE = ENRICHMENT_TTL_MS;
