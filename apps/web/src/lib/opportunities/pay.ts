/**
 * Pay-string parsing + unit normalization. Spec:
 * docs/opportunity-customization-spec.md §4 bucket G.
 *
 * Three pure helpers — no DB, no external requests:
 *
 *   - inferPayUnit(text) — pick a unit from context phrases
 *     ("per hour", "/yr", "monthly", etc.). Defaults to "annual" when
 *     no signal is present (most US/CA "$48,000" listings).
 *   - parsePayString(raw) — extract { amountMin, amountMax?, currency,
 *     unit } from a free-text salary string. Returns null when nothing
 *     numeric is parseable.
 *   - normalizeToAnnual(amount, fromUnit) — convert via 2080 hr/yr +
 *     12 months/yr. Symmetric inverse: normalizeFromAnnual.
 *
 * Currency conversion is intentionally NOT in this module. Bucket G.1
 * (follow-up) adds the FX-rate cron + cache; until then the renderer
 * shows pay in its source currency only.
 */

export type PayUnit = "hourly" | "monthly" | "annual";

export interface ParsedPay {
  amountMin: number;
  amountMax?: number;
  currency: string; // ISO-ish 3-letter code, uppercased; "USD" when unknown
  unit: PayUnit;
}

/** Hours-per-year used to annualize hourly rates. 40 hr/wk * 52 wk/yr. */
export const ANNUAL_HOURS = 2080;
/** Months per year. Trivial but worth a name so the helper reads. */
export const ANNUAL_MONTHS = 12;

const HOURLY_PATTERNS = [
  /per\s+hour/i,
  /\/\s*hr\b/i,
  /\/\s*hour/i,
  /\b\$?\d[\d,.]*\s*\/\s*h(?:r|our)?\b/i,
  /\bhourly\b/i,
  /\ban\s+hour\b/i,
];
const MONTHLY_PATTERNS = [
  /per\s+month/i,
  /\/\s*mo\b/i,
  /\/\s*month/i,
  /\bmonthly\b/i,
  /\ba\s+month\b/i,
];
const ANNUAL_PATTERNS = [
  /per\s+(?:year|annum)/i,
  /\/\s*y(?:r|ear)?\b/i,
  /\bannually\b/i,
  /\bannual\b/i,
];

/**
 * Pick a unit from the raw text. Returns "annual" when ambiguous —
 * "$48,000" with no qualifier is almost always annual in NA postings.
 */
export function inferPayUnit(text: string): PayUnit {
  for (const pattern of HOURLY_PATTERNS) {
    if (pattern.test(text)) return "hourly";
  }
  for (const pattern of MONTHLY_PATTERNS) {
    if (pattern.test(text)) return "monthly";
  }
  for (const pattern of ANNUAL_PATTERNS) {
    if (pattern.test(text)) return "annual";
  }
  return "annual";
}

const CURRENCY_PATTERNS: Array<[RegExp, string]> = [
  [/\bCAD\b|\bCA\$/i, "CAD"],
  [/\bUSD\b|\bUS\$/i, "USD"],
  [/\bEUR\b|€/, "EUR"],
  [/\bGBP\b|£/, "GBP"],
  [/\bAUD\b|\bAU\$/i, "AUD"],
];

/**
 * Returns a best-guess currency code from the raw text. Defaults to
 * "USD" because that's the most common posting currency in our data
 * set and matches the default preference; an explicit "CAD" / "€" /
 * etc. in the source string wins.
 */
function inferCurrency(text: string): string {
  for (const [pattern, code] of CURRENCY_PATTERNS) {
    if (pattern.test(text)) return code;
  }
  return "USD";
}

const AMOUNT_TOKEN = /\$?\s*\d[\d,]*(?:\.\d+)?/g;

/**
 * Extracts pay amounts + unit + currency from a free-form salary
 * string. Returns null when nothing numeric is present — the caller
 * should fall back to rendering the raw string in that case.
 *
 * Handles:
 *   "$30/hr" → 30, hourly, USD
 *   "$50,000 - $70,000 per year" → 50000-70000, annual, USD
 *   "CAD $8,000 to $10,000 per month" → 8000-10000, monthly, CAD
 *   "Hourly: 23.05" → 23.05, hourly, USD
 */
export function parsePayString(raw: string | undefined): ParsedPay | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;

  const tokens = text.match(AMOUNT_TOKEN) ?? [];
  const amounts: number[] = [];
  for (const token of tokens) {
    const cleaned = token.replace(/[$,\s]/g, "");
    const n = Number.parseFloat(cleaned);
    if (Number.isFinite(n) && n > 0) amounts.push(n);
  }
  if (amounts.length === 0) return null;

  const unit = inferPayUnit(text);
  const currency = inferCurrency(text);

  // Plausibility filter — guard against "30 days" leaking into the
  // pay amount. For each unit we cap the believable per-period values.
  // Hourly: ≤ $1000/hr. Monthly: ≤ $100k/mo. Annual: ≤ $10M.
  const cap =
    unit === "hourly" ? 1000 : unit === "monthly" ? 100_000 : 10_000_000;
  const filtered = amounts.filter((n) => n <= cap);
  if (filtered.length === 0) return null;

  const amountMin = filtered[0];
  // Treat the second amount as the upper bound only when it's strictly
  // greater than the first — guards against patterns like
  // "Hourly $23.05 over 12 months" where the second token isn't a bound.
  const amountMax =
    filtered.length >= 2 && filtered[1] > filtered[0] ? filtered[1] : undefined;
  return { amountMin, amountMax, currency, unit };
}

/**
 * Convert a single amount from its source unit to annual using the
 * fixed work-year constants. We never round here — callers decide
 * presentation (formatPay handles the "$48k/yr" shortening).
 */
export function normalizeToAnnual(amount: number, fromUnit: PayUnit): number {
  switch (fromUnit) {
    case "hourly":
      return amount * ANNUAL_HOURS;
    case "monthly":
      return amount * ANNUAL_MONTHS;
    case "annual":
      return amount;
  }
}

/**
 * Inverse of normalizeToAnnual — converts an annual amount into the
 * target display unit. Used by the renderer when the user has set
 * their preferred display unit (e.g. "hourly") and we want to show
 * an annual posting in that unit.
 */
export function normalizeFromAnnual(annual: number, toUnit: PayUnit): number {
  switch (toUnit) {
    case "hourly":
      return annual / ANNUAL_HOURS;
    case "monthly":
      return annual / ANNUAL_MONTHS;
    case "annual":
      return annual;
  }
}

/**
 * Convenience — convert directly between any two units in one call.
 */
export function convertPay(
  amount: number,
  fromUnit: PayUnit,
  toUnit: PayUnit,
): number {
  if (fromUnit === toUnit) return amount;
  return normalizeFromAnnual(normalizeToAnnual(amount, fromUnit), toUnit);
}

/**
 * Currency rate lookup map. Same shape as
 * `currency-rates.RateMap` — passed through from the renderer so this
 * module stays decoupled from the DB layer (callable from anywhere, no
 * top-level SQL).
 *
 *   { USD: { CAD: 1.36, EUR: 0.92, ... }, ... }
 */
export type CurrencyRateMap = Record<string, Record<string, number>>;

/**
 * Convert an amount from one currency to another using the supplied
 * rate map. Falls back to:
 *
 *   1. Direct lookup (`rates[from][to]`)
 *   2. USD-bridge (`from → USD → to`)
 *   3. Inverse (`1 / rates[to][from]`)
 *   4. Identity (return the input amount unchanged)
 *
 * Missing-pair behaviour is non-fatal — callers wrap the result in
 * `formatPay`, and the renderer keeps the source-currency prefix when
 * conversion can't be resolved. Pure, sync, testable without a DB.
 */
export function convertCurrencyAmount(
  amount: number,
  from: string,
  to: string,
  rates: CurrencyRateMap,
): number {
  if (!from || !to || from === to) return amount;
  const direct = rates[from]?.[to];
  if (typeof direct === "number" && direct > 0) return amount * direct;

  const fromToUsd = rates[from]?.USD;
  const usdToTo = rates.USD?.[to];
  if (
    typeof fromToUsd === "number" &&
    fromToUsd > 0 &&
    typeof usdToTo === "number" &&
    usdToTo > 0
  ) {
    return amount * fromToUsd * usdToTo;
  }

  const inverse = rates[to]?.[from];
  if (typeof inverse === "number" && inverse > 0) {
    return amount / inverse;
  }

  return amount;
}

/**
 * Render an amount in the given unit with a compact label. Annual
 * uses "$48k" / "$120k"; monthly uses "$8,000/mo"; hourly uses
 * "$23.05/hr". Currency is prefixed when non-USD (e.g. "CAD $48k/yr").
 */
export function formatPay(
  amount: number,
  unit: PayUnit,
  currency: string,
): string {
  const prefix = currency && currency !== "USD" ? `${currency} ` : "";
  if (unit === "hourly") {
    return `${prefix}$${amount.toFixed(2)}/hr`;
  }
  if (unit === "monthly") {
    return `${prefix}$${Math.round(amount).toLocaleString()}/mo`;
  }
  // Annual: shorten >= 1000 to "$48k", >= 1_000_000 to "$1.2M".
  if (amount >= 1_000_000) {
    return `${prefix}$${(amount / 1_000_000).toFixed(1)}M/yr`;
  }
  if (amount >= 1_000) {
    return `${prefix}$${Math.round(amount / 1_000)}k/yr`;
  }
  return `${prefix}$${Math.round(amount).toLocaleString()}/yr`;
}

/**
 * High-level helper used by the review-queue renderer: given a parsed
 * pay record + the user's target unit (and optional target currency +
 * rates), return a human label like "CAD $48k-$60k/yr".
 *
 * Currency rules:
 *   - If `targetCurrency` is omitted, render in the source currency
 *     (back-compat — same behaviour as before bucket G.1).
 *   - If `targetCurrency` matches `parsed.currency` (or rates is empty),
 *     no conversion happens.
 *   - Otherwise we run the amount through `convertCurrencyAmount` first,
 *     then format with `targetCurrency` as the prefix.
 *
 * Returns null when parsed.amount is missing.
 */
export function formatParsedPay(
  parsed: ParsedPay,
  targetUnit: PayUnit,
  options: { targetCurrency?: string; rates?: CurrencyRateMap } = {},
): string {
  const displayCurrency = options.targetCurrency ?? parsed.currency;
  const rates = options.rates ?? {};

  const convertUnit = (n: number) => convertPay(n, parsed.unit, targetUnit);
  const convertCurrency = (n: number) =>
    options.targetCurrency
      ? convertCurrencyAmount(n, parsed.currency, displayCurrency, rates)
      : n;
  const transform = (n: number) => convertCurrency(convertUnit(n));

  const min = formatPay(
    transform(parsed.amountMin),
    targetUnit,
    displayCurrency,
  );
  if (parsed.amountMax !== undefined) {
    // Drop the currency prefix on the upper bound — already on min.
    const maxLabel = formatPay(
      transform(parsed.amountMax),
      targetUnit,
      "USD",
    ).replace(/^\$/, "$");
    return `${min}-${maxLabel}`;
  }
  return min;
}

/**
 * Convenience for renderers that have an opportunity (or any object with
 * inferred-pay fields) + the user's preferred display unit + currency.
 * Builds the `ParsedPay` from the structured columns when present and
 * delegates to `formatParsedPay`. Returns null when there's nothing to
 * render — the caller should fall back to the raw `salary` string.
 */
export function formatOpportunityPay(
  source: {
    inferredPayUnit?: PayUnit;
    inferredPayMin?: number;
    inferredPayMax?: number;
    inferredPayCurrency?: string;
  },
  targetUnit: PayUnit,
  options: { targetCurrency?: string; rates?: CurrencyRateMap } = {},
): string | null {
  if (!source.inferredPayUnit || typeof source.inferredPayMin !== "number") {
    return null;
  }
  return formatParsedPay(
    {
      amountMin: source.inferredPayMin,
      amountMax: source.inferredPayMax,
      unit: source.inferredPayUnit,
      currency: source.inferredPayCurrency || "USD",
    },
    targetUnit,
    options,
  );
}
