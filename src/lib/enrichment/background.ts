import {
  getCompanyEnrichment,
  isEnrichmentFresh,
  saveCompanyEnrichment,
} from "@/lib/db/company-enrichment";
import { enrichCompany } from "@/lib/enrichment";
import type { EnrichmentInput } from "@/lib/enrichment/types";

/**
 * Kick off company enrichment without blocking the caller.
 * Skips if a fresh cache entry already exists. Errors are swallowed so the
 * trigger never propagates — callers should not await this.
 */
export function triggerBackgroundEnrichment(
  input: EnrichmentInput,
  userId: string = "default",
): void {
  if (!input.company.trim()) return;

  const cached = getCompanyEnrichment(input.company, userId);
  if (cached && isEnrichmentFresh(cached.enrichedAt)) return;

  void runEnrichment(input, userId).catch((error) => {
    console.warn("[enrichment] background run failed:", error);
  });
}

async function runEnrichment(
  input: EnrichmentInput,
  userId: string,
): Promise<void> {
  const enrichment = await enrichCompany(input);
  saveCompanyEnrichment(input.company, enrichment, userId);
}
