/**
 * Daily FX-rate refresh. Spec: docs/opportunity-customization-spec.md §4
 * bucket G.1.
 *
 * Source: frankfurter.app (no API key, public-domain ECB reference rates).
 * Endpoint: `https://api.frankfurter.app/latest?from=USD&to=CAD,EUR,GBP`
 *   → `{ amount, base, date, rates: { CAD: 1.36, EUR: 0.92, GBP: 0.79 } }`
 *
 * We fetch USD→{others} once, then derive every pair by inverting and
 * cross-multiplying. With 4 currencies that's 16 rows (`base × target`).
 *
 * The cron is best-effort: a network failure logs to `cron_runs` but
 * doesn't throw — the renderer still has the previous cached rates plus
 * `FALLBACK_RATES` as a final safety net, so a transient frankfurter
 * outage never breaks the salary line.
 */
import { SUPPORTED_CURRENCIES, upsertRate } from "@/lib/db/currency-rates";

export interface RefreshResult {
  base: string;
  pairsUpdated: number;
  fetchedAt: string;
  errors: string[];
  rates: Record<string, Record<string, number>>;
}

interface FrankfurterResponse {
  amount?: number;
  base?: string;
  date?: string;
  rates?: Record<string, number>;
}

/** Allow tests + the cron route to inject a mock fetcher. */
export interface RefreshDependencies {
  fetcher?: typeof fetch;
  now?: () => string;
}

const FRANKFURTER_BASE = "https://api.frankfurter.app/latest";

/**
 * Fetches `USD → {targets}` rates and upserts every pair into
 * `currency_rates`. Caller wraps with cron auth + `recordCronRun`.
 */
export async function refreshCurrencyRates(
  deps: RefreshDependencies = {},
): Promise<RefreshResult> {
  const fetcher = deps.fetcher ?? fetch;
  const fetchedAt = deps.now?.() ?? new Date().toISOString();
  const errors: string[] = [];

  // Build the comma-separated `to=` list, excluding USD (it's the base).
  const targets = SUPPORTED_CURRENCIES.filter((c) => c !== "USD");
  const url = `${FRANKFURTER_BASE}?from=USD&to=${targets.join(",")}`;

  let usdRates: Record<string, number> = {};
  try {
    const response = await fetcher(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const body = (await response.json()) as FrankfurterResponse;
    if (!body.rates || typeof body.rates !== "object") {
      throw new Error("Response missing `rates`");
    }
    for (const [target, rate] of Object.entries(body.rates)) {
      if (typeof rate === "number" && rate > 0) usdRates[target] = rate;
    }
  } catch (error) {
    errors.push(`USD fetch failed: ${(error as Error).message}`);
    // Fall through — empty `usdRates` means we write 0 pairs. The
    // renderer falls back to FALLBACK_RATES until the next run.
  }

  // Identity (USD→USD) for completeness so the lookup never has to
  // special-case "same currency" reads.
  usdRates.USD = 1;

  const ratesMap: Record<string, Record<string, number>> = { USD: usdRates };
  let pairsUpdated = 0;
  for (const [target, rate] of Object.entries(usdRates)) {
    upsertRate("USD", target, rate);
    pairsUpdated += 1;
  }

  // Derive every other base by inversion + cross-multiply through USD.
  // E.g. CAD→EUR = (1/USD→CAD) * USD→EUR.
  for (const base of SUPPORTED_CURRENCIES) {
    if (base === "USD") continue;
    const usdToBase = usdRates[base];
    if (!usdToBase || usdToBase <= 0) continue;
    const baseRates: Record<string, number> = {};
    for (const target of SUPPORTED_CURRENCIES) {
      if (target === base) {
        baseRates[target] = 1;
        continue;
      }
      if (target === "USD") {
        baseRates.USD = 1 / usdToBase;
      } else {
        const usdToTarget = usdRates[target];
        if (!usdToTarget) continue;
        baseRates[target] = (1 / usdToBase) * usdToTarget;
      }
      upsertRate(base, target, baseRates[target]);
      pairsUpdated += 1;
    }
    // Identity row for this base.
    upsertRate(base, base, 1);
    pairsUpdated += 1;
    baseRates[base] = 1;
    ratesMap[base] = baseRates;
  }

  return {
    base: "USD",
    pairsUpdated,
    fetchedAt,
    errors,
    rates: ratesMap,
  };
}
