/**
 * Currency rate cache for the pay-normalization bucket (G.1).
 *
 * Stored as a flat `(base, target, rate)` table with one row per direction.
 * The daily cron at /api/cron/currency-rates upserts every supported pair;
 * `getAllRates()` returns them as a `Record<base, Record<target, rate>>`
 * which the renderer + sort comparator pass into the conversion helpers in
 * `apps/web/src/lib/opportunities/pay.ts`.
 *
 * If the table is empty (first boot, cron hasn't run yet) we fall back to
 * the FALLBACK_RATES constants below. They're stale by definition — the
 * cron will overwrite on first run — but they keep the renderer from
 * showing "$48k/yr" twice when the user really wanted to compare a CAD
 * posting against their USD preference.
 */
import db from "./legacy";

import {
  PAY_NORMALIZATION_CURRENCIES,
  type PayNormalizationCurrency,
} from "@slothing/shared/schemas";

export type CurrencyCode = PayNormalizationCurrency;

/**
 * Rough USD-base fallbacks used when the rates table is empty. Sourced
 * from a one-shot snapshot of frankfurter.app in May 2026 — fine for a
 * first-boot best-effort, replaced on the next cron run. AUD isn't in
 * PAY_NORMALIZATION_CURRENCIES yet but is included so the cron logic
 * doesn't need a separate gate when the constant expands.
 */
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { CAD: 1.36, EUR: 0.92, GBP: 0.79, AUD: 1.52, USD: 1 },
  CAD: { USD: 0.735, EUR: 0.676, GBP: 0.581, AUD: 1.118, CAD: 1 },
  EUR: { USD: 1.087, CAD: 1.479, GBP: 0.859, AUD: 1.652, EUR: 1 },
  GBP: { USD: 1.266, CAD: 1.721, EUR: 1.164, AUD: 1.923, GBP: 1 },
  AUD: { USD: 0.658, CAD: 0.895, EUR: 0.605, GBP: 0.52, AUD: 1 },
};

export interface CurrencyRateRow {
  base: string;
  target: string;
  rate: number;
  fetched_at: string;
}

export type RateMap = Record<string, Record<string, number>>;

let currencyRatesSchemaEnsured = false;

function ensureCurrencyRatesSchema(): void {
  if (currencyRatesSchemaEnsured) return;
  const exec = (db as unknown as { exec?: (sql: string) => void }).exec;
  if (typeof exec !== "function") {
    currencyRatesSchemaEnsured = true;
    return;
  }
  exec.call(
    db,
    `CREATE TABLE IF NOT EXISTS currency_rates (
      base TEXT NOT NULL,
      target TEXT NOT NULL,
      rate REAL NOT NULL,
      fetched_at TEXT NOT NULL,
      PRIMARY KEY (base, target)
    )`,
  );
  currencyRatesSchemaEnsured = true;
}

/**
 * Upsert a single base→target rate row. Idempotent — called by the cron
 * for each pair after a successful frankfurter fetch.
 */
export function upsertRate(base: string, target: string, rate: number): void {
  ensureCurrencyRatesSchema();
  if (!Number.isFinite(rate) || rate <= 0) return;
  db.prepare(
    `INSERT INTO currency_rates (base, target, rate, fetched_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(base, target) DO UPDATE SET
       rate = excluded.rate,
       fetched_at = excluded.fetched_at`,
  ).run(base, target, rate);
}

/**
 * Return every cached pair as a nested map. Empty for the first read on
 * a fresh DB — callers should pass the result into the pay helpers,
 * which fall back to FALLBACK_RATES when a needed pair is missing.
 */
export function getAllRates(): RateMap {
  ensureCurrencyRatesSchema();
  const rows = db
    .prepare("SELECT base, target, rate FROM currency_rates")
    .all() as Array<Pick<CurrencyRateRow, "base" | "target" | "rate">>;
  const map: RateMap = {};
  for (const row of rows) {
    if (!map[row.base]) map[row.base] = {};
    map[row.base][row.target] = row.rate;
  }
  return map;
}

/**
 * Returns the rate for converting 1 unit of `base` to `target`. Tries:
 *
 *   1. Direct table hit
 *   2. USD-bridge (base→USD * USD→target)
 *   3. Inverse direction (1 / target→base)
 *   4. FALLBACK_RATES table
 *
 * Returns 1 when the conversion can't be resolved (best-effort — caller
 * shouldn't crash on missing data; renderer falls back to source currency
 * prefix when this happens). Identity (`base === target`) short-circuits.
 */
export function getRate(
  base: string,
  target: string,
  rates: RateMap = getAllRates(),
): number {
  if (base === target) return 1;
  const direct = rates[base]?.[target];
  if (typeof direct === "number") return direct;

  // USD-bridge.
  const baseToUsd = rates[base]?.USD;
  const usdToTarget = rates.USD?.[target];
  if (typeof baseToUsd === "number" && typeof usdToTarget === "number") {
    return baseToUsd * usdToTarget;
  }

  // Inverse.
  const inverse = rates[target]?.[base];
  if (typeof inverse === "number" && inverse > 0) {
    return 1 / inverse;
  }

  // Static fallback (first-boot path).
  const fallbackDirect = FALLBACK_RATES[base]?.[target];
  if (typeof fallbackDirect === "number") return fallbackDirect;

  return 1;
}

/**
 * Set of currencies the daily cron fetches. The user-facing preference
 * set lives in `PAY_NORMALIZATION_CURRENCIES` in shared/schemas — we
 * mirror that here so the cron doesn't drift when the constant grows.
 */
export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] =
  PAY_NORMALIZATION_CURRENCIES;

/** Exposed for tests + the cron's "what should I fetch?" logic. */
export { FALLBACK_RATES };
