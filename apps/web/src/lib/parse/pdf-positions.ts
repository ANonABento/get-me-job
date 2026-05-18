/**
 * Extracts per-text-item positions from a PDF using pdfjs-dist, and provides
 * fuzzy-match helpers that resolve a parsed component's text content back to
 * the source positions on the page.
 *
 * This is the fuzzy-match fallback path documented in
 * `docs/components-preview-feature-spec.md`. The higher-fidelity path
 * (modify the LLM extraction step to emit `source_chunks: number[]`
 * referencing annotated chunk IDs) is the right architectural target but
 * requires a parse-pipeline rewrite and LLM-prompt eval testing. The
 * fuzzy-match path ships the visible UX now and can be upgraded later.
 */

export interface PdfPositionItem {
  text: string;
  page: number; // 1-indexed (pdfjs convention)
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface PdfLinkAnnotation {
  url: string;
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface PdfPositionDocument {
  items: PdfPositionItem[];
  links: PdfLinkAnnotation[];
  pageDimensions: Array<{ page: number; width: number; height: number }>;
}

/**
 * Tuple format stored on `profile_bank.source_bbox` (JSON array of these).
 * `[page, x0, y0, x1, y1]` keeps storage compact and gives the renderer
 * everything it needs to place an overlay at any zoom level.
 */
export type PositionTuple = [
  page: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
];

interface PdfJsTextItem {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
}

interface PdfJsPage {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  getTextContent: () => Promise<{ items: PdfJsTextItem[] }>;
  getAnnotations?: () => Promise<PdfJsAnnotation[]>;
}

interface PdfJsAnnotation {
  subtype?: string;
  url?: string;
  unsafeUrl?: string;
  rect?: number[];
}

interface PdfJsDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy?: () => Promise<void> | void;
}

interface PdfJsModule {
  getDocument: (opts: {
    data: Uint8Array;
    disableWorker: boolean;
    verbosity?: number;
  }) => { promise: Promise<PdfJsDocument> };
}

/**
 * Identifies pdf.js text items that contribute zero matching signal —
 * single-char separators (`|`, `•`, `🔗`), pure-whitespace runs, and
 * all-punctuation strings. Filtering them before sorting keeps the
 * matcher's per-start window covering more *meaningful* content tokens
 * before its bail budget runs out.
 *
 * The check is intentionally narrow: we keep anything with a letter or
 * digit, so a 2-char word like `"CV"` is preserved (still useful for
 * disambiguating a project).
 */
export function isJunkItem(item: PdfPositionItem): boolean {
  const trimmed = item.text.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length === 1) return true;
  // No letters or digits anywhere → pure separator / glyph run.
  return !/[\p{L}\p{N}]/u.test(trimmed);
}

function itemFromPdfJs(
  item: PdfJsTextItem,
  pageNumber: number,
  pageHeight: number,
): PdfPositionItem | null {
  const text = (item.str ?? "").trim();
  const transform = item.transform;
  if (!text || !transform || transform.length < 6) return null;
  const x = transform[4] ?? 0;
  const baselineY = transform[5] ?? 0;
  const height = Math.max(1, Math.abs(item.height ?? transform[3] ?? 10));
  const width = Math.max(1, item.width ?? text.length * 6);
  // pdfjs's transform places origin at bottom-left of the page; convert to
  // top-left origin so the renderer can position overlays directly.
  const y0 = Math.max(0, pageHeight - baselineY - height);
  return {
    text,
    page: pageNumber,
    x0: x,
    y0,
    x1: x + width,
    y1: y0 + height,
  };
}

function linkFromPdfJsAnnotation(
  annotation: PdfJsAnnotation,
  pageNumber: number,
  pageHeight: number,
): PdfLinkAnnotation | null {
  if (annotation.subtype !== "Link") return null;
  const url = annotation.url ?? annotation.unsafeUrl;
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const rect = annotation.rect;
  if (!Array.isArray(rect) || rect.length < 4) return null;
  const [rawX0, rawY0, rawX1, rawY1] = rect;
  const x0 = Math.min(rawX0, rawX1);
  const x1 = Math.max(rawX0, rawX1);
  const y0 = Math.max(0, pageHeight - Math.max(rawY0, rawY1));
  const y1 = Math.max(0, pageHeight - Math.min(rawY0, rawY1));
  return { url, page: pageNumber, x0, y0, x1, y1 };
}

export interface ExtractPdfPositionsOptions {
  /**
   * When true, retain junk items (single-char separators, all-punctuation
   * runs, empty strings). Default false — junk wastes the matcher's
   * sliding-window budget without contributing signal. Diagnostic callers
   * can set this to inspect the raw stream.
   */
  includeJunk?: boolean;
}

export async function extractPdfPositions(
  buffer: Buffer,
  options: ExtractPdfPositionsOptions = {},
): Promise<PdfPositionDocument> {
  const pdfjs =
    (await import("pdfjs-dist/legacy/build/pdf.mjs")) as unknown as PdfJsModule;
  // `useSystemFonts: true` triggers `Object.defineProperty called on
  // non-object` inside Next.js's Node runtime (works fine in raw Node) —
  // pdfjs's font-cache setup path collides with whatever Next.js does to
  // sandbox the route. Default value is false, so we omit the flag.
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    verbosity: 0,
  });
  const document = await loadingTask.promise;
  try {
    const items: PdfPositionItem[] = [];
    const links: PdfLinkAnnotation[] = [];
    const pageDimensions: PdfPositionDocument["pageDimensions"] = [];
    for (let p = 1; p <= document.numPages; p += 1) {
      const page = await document.getPage(p);
      const viewport = page.getViewport({ scale: 1 });
      pageDimensions.push({
        page: p,
        width: viewport.width,
        height: viewport.height,
      });
      const textContent = await page.getTextContent();
      const pageItems: PdfPositionItem[] = [];
      const annotations = (await page.getAnnotations?.()) ?? [];
      for (const annotation of annotations) {
        const link = linkFromPdfJsAnnotation(annotation, p, viewport.height);
        if (link) links.push(link);
      }
      for (const raw of textContent.items) {
        const item = itemFromPdfJs(raw, p, viewport.height);
        if (!item) continue;
        if (!options.includeJunk && isJunkItem(item)) continue;
        pageItems.push(item);
      }
      // Sort by reading order within each page: top-to-bottom, then
      // left-to-right within a line. pdf.js's emission order can be
      // arbitrary (especially for multi-column or right-aligned content),
      // and our matcher walks items left-to-right looking for tokens in
      // order — out-of-order items silently break otherwise-easy matches.
      pageItems.sort((a, b) => {
        const lineHeight = Math.max(a.y1 - a.y0, b.y1 - b.y0, 8);
        const sameLine = Math.abs(a.y0 - b.y0) < lineHeight * 0.6;
        return sameLine ? a.x0 - b.x0 : a.y0 - b.y0;
      });
      items.push(...pageItems);
    }
    return { items, links, pageDimensions };
  } finally {
    await document.destroy?.();
  }
}

/**
 * Aggressive normalization. Folds anything that's likely to differ between
 * the parser's reconstructed text and pdf.js's extracted text:
 * - Common ligatures (fi, fl, ffi, etc.) → ASCII
 * - NBSP / zero-width / narrow-no-break / soft-hyphen → space / removed
 * - Smart quotes / em-dashes / bullet glyphs → ASCII equivalents
 * - Anything not letter/number/space → space (then collapsed)
 */
function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/­/g, "") // soft hyphen
    .replace(/[​-‏‪-‮﻿]/g, "") // zero-width / bidi
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‐-―]/g, "-")
    .replace(/[•‣◦⁃⁌⁍]/g, " ")
    .replace(/[    ]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SIGNIFICANT_TOKEN_MIN_LEN = 3;
const MIN_MATCH_TOKENS = 3;
const MATCH_THRESHOLD_RATIO = 0.55;

/**
 * Per-category tuning of the match threshold. Long bullets get a more
 * permissive coverage ratio (paraphrasing is common). Short identifiers
 * — skills, certifications — get tighter thresholds so false positives
 * don't drift in.
 *
 * `minTokens` is the floor for the absolute number of matched tokens;
 * `coverage` is the fraction of needle tokens that must match in order.
 * The matcher resolves the larger of the two.
 */
interface CategoryMatchParams {
  minTokens: number;
  coverage: number;
}

const CATEGORY_MATCH_PARAMS: Readonly<Record<string, CategoryMatchParams>> = {
  experience: { minTokens: 2, coverage: 0.55 },
  project: { minTokens: 2, coverage: 0.55 },
  education: { minTokens: 2, coverage: 0.55 },
  bullet: { minTokens: 2, coverage: 0.4 },
  achievement: { minTokens: 2, coverage: 0.45 },
  skill: { minTokens: 1, coverage: 1.0 },
  certification: { minTokens: 2, coverage: 0.6 },
  hackathon: { minTokens: 2, coverage: 0.55 },
};

const DEFAULT_MATCH_PARAMS: CategoryMatchParams = {
  minTokens: MIN_MATCH_TOKENS,
  coverage: MATCH_THRESHOLD_RATIO,
};

function paramsFor(category: string | undefined): CategoryMatchParams {
  if (!category) return DEFAULT_MATCH_PARAMS;
  return CATEGORY_MATCH_PARAMS[category] ?? DEFAULT_MATCH_PARAMS;
}

/**
 * Splits a normalized needle into significant tokens — short words
 * (`a`, `at`, `in`) carry almost no positional information and only
 * inflate the match-rate threshold without helping localize the bbox.
 */
function tokenize(value: string): string[] {
  return value
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= SIGNIFICANT_TOKEN_MIN_LEN);
}

/**
 * Damerau-Levenshtein distance — Levenshtein plus a single-step
 * transposition. Inline rather than via dependency: we only need it
 * here and it's < 30 lines.
 *
 * Used as a token-similarity check for parser/OCR drift like
 * `pipelines` vs `pipeline`, `il8n` vs `i18n`, smart-quote case
 * variants.
 *
 * Cost is O(|a|·|b|). Per-call budget is bounded because callers
 * short-circuit on length disparity > maxDistance.
 */
function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;
  const matrix: number[][] = [];
  for (let i = 0; i <= aLen; i += 1) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bLen; j += 1) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= aLen; i += 1) {
    for (let j = 1; j <= bLen; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }
  return matrix[aLen][bLen];
}

/**
 * Per-token similarity used as a fallback when `indexOf(token)` fails
 * inside the haystack. Returns true if the haystack contains a token
 * within Damerau-Levenshtein distance 1 (or 2 for longer tokens).
 *
 * The threshold scales with length so `cat` doesn't fuzzy-match `bat`
 * (distance 1 on a 3-char word) but `pipeline` matches `pipelines`
 * (distance 1 on an 8-char word).
 */
function MAX_TYPO_DISTANCE(token: string): number {
  if (token.length <= 4) return 0;
  if (token.length <= 6) return 1;
  return 2;
}

/**
 * Walks the haystack tokens looking for a fuzzy match for `needleTok`,
 * starting at byte position `fromPos`. Returns the byte index of the
 * matched word, or -1.
 *
 * The haystack is the whole `collected` string (items joined by space).
 * We tokenize on whitespace at search time and skip tokens that are
 * obviously too dissimilar in length before computing distance.
 */
function fuzzyTokenSearch(
  needleTok: string,
  haystack: string,
  fromPos: number,
): number {
  const maxDist = MAX_TYPO_DISTANCE(needleTok);
  if (maxDist === 0) return -1;
  let i = fromPos;
  while (i < haystack.length) {
    // Skip whitespace.
    while (i < haystack.length && haystack[i] === " ") i += 1;
    if (i >= haystack.length) break;
    const start = i;
    while (i < haystack.length && haystack[i] !== " ") i += 1;
    const hayTok = haystack.slice(start, i);
    if (Math.abs(hayTok.length - needleTok.length) <= maxDist) {
      if (damerauLevenshtein(needleTok, hayTok) <= maxDist) {
        return start;
      }
    }
  }
  return -1;
}

/**
 * Counts how many of `tokens` appear, in order (with arbitrary gaps),
 * inside the haystack. Returns the index of the first un-matched token —
 * i.e. the number of consecutive prefix tokens located.
 */
function countMatchedTokensInOrder(tokens: string[], haystack: string): number {
  let pos = 0;
  let matched = 0;
  for (const token of tokens) {
    let idx = haystack.indexOf(token, pos);
    if (idx === -1) {
      // Fuzzy fallback — handles parser/OCR drift like `pipelines`
      // vs `pipeline`, smart-quote case variants, single-char typos.
      idx = fuzzyTokenSearch(token, haystack, pos);
      if (idx === -1) break;
      // Advance past the haystack token we just fuzzy-matched. We don't
      // know its exact length, but the haystack token starts at `idx`
      // and runs until the next space.
      let end = idx;
      while (end < haystack.length && haystack[end] !== " ") end += 1;
      pos = end;
    } else {
      pos = idx + token.length;
    }
    matched += 1;
  }
  return matched;
}

/**
 * Sliding-window fuzzy match with token-coverage scoring. Walks every
 * possible (start, end) window of position items, picks the window with
 * the highest token-coverage of the needle; ties broken by smaller item
 * count. Requires at least `MATCH_THRESHOLD_RATIO` of significant tokens
 * to match in order.
 *
 * Tolerates the failure modes that broke pure-substring matching on real
 * resumes:
 * - Inline link/emoji items interrupting the text stream
 * - pdf.js splitting lines at hard wraps (so a bullet spans many items)
 * - Smart punctuation / NBSP / ligature differences (handled in
 *   `normalizeText`)
 *
 * Returns line-extended bboxes (each tuple covers a full line's
 * horizontal extent on the matched y-band, not just the matched
 * substring's tight bounds). See `buildBboxTuples` for the geometry.
 */
export interface AnchorBbox {
  page: number;
  /** Top of the parent's bbox (used as the floor of the bullet search). */
  y0: number;
  /** Bottom of the search band — typically capped at the next sibling parent's y0. */
  yMax: number;
}

export interface FindPositionsOptions {
  maxWindowItems?: number;
  /**
   * Optional `BankCategory` (or any string) that selects per-category
   * thresholds from `CATEGORY_MATCH_PARAMS`. Long bullets benefit from a
   * permissive coverage ratio; short skill names need a strict one.
   * Omitted → uses the legacy global defaults.
   */
  category?: string;
  /**
   * When set, restricts the matcher to items in this page+y-band. Used
   * for bullet matching once the bullet's parent (experience / project)
   * has already been located — inside an anchored region the false-
   * positive risk is much lower, so the coverage threshold can drop.
   */
  anchorBbox?: AnchorBbox;
}

/**
 * Per-attempt diagnostic record. `findPositionsWithDiagnostic` returns
 * one of these per cascade attempt so the diagnostic endpoint can show
 * why a needle did or didn't match.
 */
export interface MatchAttempt {
  /** Stage name: "full", "head-70%", "head-45%", "tail-70%", "tail-45%", or "substring". */
  tier: string;
  /** Number of significant tokens used in this attempt. */
  tokenCount: number;
  /** Best `matched` count any window achieved. */
  bestMatched: number;
  /** Threshold the attempt had to clear. */
  required: number;
  /** Whether this attempt produced a bbox set. */
  succeeded: boolean;
}

export interface MatchDiagnostic {
  needle: string;
  category?: string;
  needleTokens: string[];
  attempts: MatchAttempt[];
  winningTier: string | null;
  bboxes: PositionTuple[];
}

export function findPositionsForText(
  needle: string,
  items: PdfPositionItem[],
  options: FindPositionsOptions = {},
): PositionTuple[] {
  return runMatcher(needle, items, options).bboxes;
}

/**
 * Diagnostic version of `findPositionsForText`. Returns per-tier attempt
 * scores so callers (the dev-only match-report endpoint) can show why a
 * needle did or didn't resolve. The free hot-path callers use the
 * `findPositionsForText` wrapper.
 */
export function findPositionsWithDiagnostic(
  needle: string,
  items: PdfPositionItem[],
  options: FindPositionsOptions = {},
): MatchDiagnostic {
  return runMatcher(needle, items, options);
}

function runMatcher(
  needle: string,
  items: PdfPositionItem[],
  options: FindPositionsOptions,
): MatchDiagnostic {
  // If an anchor bbox is set, restrict the corpus to items inside the
  // parent's y-band. Drops the matcher's search space from "the whole
  // resume" to "this bullet's section" — false positives can't drift in.
  const effectiveItems = options.anchorBbox
    ? items.filter((it) => {
        const a = options.anchorBbox!;
        if (it.page !== a.page) return false;
        return it.y0 >= a.y0 && it.y1 <= a.yMax;
      })
    : items;

  const normalizedNeedle = normalizeText(needle);
  const diagnostic: MatchDiagnostic = {
    needle,
    category: options.category,
    needleTokens: [],
    attempts: [],
    winningTier: null,
    bboxes: [],
  };
  if (!normalizedNeedle || normalizedNeedle.length < 4) return diagnostic;

  const baseParams = paramsFor(options.category);
  // Inside an anchor band, the search space is small enough that even a
  // 1-token "Built CLI"-style bullet is unambiguous. Drop the threshold
  // to recover generic bullets that wouldn't pass the global threshold.
  const params: CategoryMatchParams = options.anchorBbox
    ? { minTokens: 1, coverage: Math.min(baseParams.coverage, 0.3) }
    : baseParams;

  const needleTokens = tokenize(normalizedNeedle);
  diagnostic.needleTokens = needleTokens;

  if (needleTokens.length < params.minTokens) {
    const bboxes = findSubstringPosition(
      normalizedNeedle,
      effectiveItems,
      options,
    );
    diagnostic.attempts.push({
      tier: "substring",
      tokenCount: needleTokens.length,
      bestMatched: bboxes.length > 0 ? needleTokens.length : 0,
      required: params.minTokens,
      succeeded: bboxes.length > 0,
    });
    if (bboxes.length > 0) diagnostic.winningTier = "substring";
    diagnostic.bboxes = bboxes;
    return diagnostic;
  }
  if (needleTokens.length < MIN_MATCH_TOKENS && params.coverage < 1) {
    const bboxes = findSubstringPosition(
      normalizedNeedle,
      effectiveItems,
      options,
    );
    diagnostic.attempts.push({
      tier: "substring",
      tokenCount: needleTokens.length,
      bestMatched: bboxes.length > 0 ? needleTokens.length : 0,
      required: params.minTokens,
      succeeded: bboxes.length > 0,
    });
    if (bboxes.length > 0) diagnostic.winningTier = "substring";
    diagnostic.bboxes = bboxes;
    return diagnostic;
  }

  // Cascading retry: the smart parser can rewrite either end of a long
  // bullet. Head rewrite: "…autocomplete system" → "…autocomplete system
  // using BK-tree indexing". Tail rewrite: needle is "Programmed firmware
  // in .NET, integrating Emgu CV for real-time facial detection" but the
  // PDF's verbatim text is "…for real-time facial detection". The full
  // attempt covers exact matches; head shortenings recover head-preserved
  // bullets; tail shortenings recover tail-preserved bullets.
  const headTokens70 = Math.ceil(needleTokens.length * 0.7);
  const headTokens45 = Math.max(
    MIN_MATCH_TOKENS,
    Math.ceil(needleTokens.length * 0.45),
  );
  const tailTokens70 = Math.ceil(needleTokens.length * 0.7);
  const tailTokens45 = Math.max(
    MIN_MATCH_TOKENS,
    Math.ceil(needleTokens.length * 0.45),
  );
  const attempts: { tier: string; tokens: string[] }[] =
    needleTokens.length > 6
      ? [
          { tier: "full", tokens: needleTokens },
          { tier: "head-70%", tokens: needleTokens.slice(0, headTokens70) },
          { tier: "head-45%", tokens: needleTokens.slice(0, headTokens45) },
          { tier: "tail-70%", tokens: needleTokens.slice(-tailTokens70) },
          { tier: "tail-45%", tokens: needleTokens.slice(-tailTokens45) },
        ]
      : [{ tier: "full", tokens: needleTokens }];

  const normalized = effectiveItems.map((item) => normalizeText(item.text));
  for (const attempt of attempts) {
    const { bboxes, bestMatched, required } = matchTokens(
      attempt.tokens,
      effectiveItems,
      normalized,
      options,
      params,
    );
    diagnostic.attempts.push({
      tier: attempt.tier,
      tokenCount: attempt.tokens.length,
      bestMatched,
      required,
      succeeded: bboxes.length > 0,
    });
    if (bboxes.length > 0) {
      diagnostic.winningTier = attempt.tier;
      diagnostic.bboxes = bboxes;
      return diagnostic;
    }
  }
  return diagnostic;
}

function matchTokens(
  needleTokens: string[],
  items: PdfPositionItem[],
  normalized: string[],
  options: FindPositionsOptions,
  params: CategoryMatchParams,
): { bboxes: PositionTuple[]; bestMatched: number; required: number } {
  const minMatched = Math.max(
    params.minTokens,
    Math.ceil(needleTokens.length * params.coverage),
  );
  const maxWindow = options.maxWindowItems ?? 120;

  let bestStart = -1;
  let bestEnd = -1;
  let bestMatched = 0;
  let bestWindowSize = Infinity;

  for (let start = 0; start < items.length; start += 1) {
    if (!normalized[start]) continue;
    let collected = "";
    const lastIndex = Math.min(items.length - 1, start + maxWindow);
    for (let end = start; end <= lastIndex; end += 1) {
      const piece = normalized[end];
      if (!piece) continue;
      collected = collected ? `${collected} ${piece}` : piece;

      const matched = countMatchedTokensInOrder(needleTokens, collected);
      const windowSize = end - start + 1;
      const better =
        matched > bestMatched ||
        (matched === bestMatched &&
          matched >= minMatched &&
          windowSize < bestWindowSize);
      if (better) {
        bestMatched = matched;
        bestStart = start;
        bestEnd = end;
        bestWindowSize = windowSize;
      }
      if (matched === needleTokens.length) break;
      // Bail only on true junk: if we've expanded 12+ items past the
      // start and STILL haven't matched any needle tokens, this start
      // is in unrelated content — give up. Don't bail on partial
      // matches; long bullets often plateau mid-needle as the matcher
      // walks through filler items (link icons, dates, separators)
      // before hitting the rest of the relevant words.
      if (end - start > 12 && matched === 0) break;
    }
  }

  if (bestMatched < minMatched) {
    return { bboxes: [], bestMatched, required: minMatched };
  }
  return {
    bboxes: buildBboxTuples(items.slice(bestStart, bestEnd + 1), items),
    bestMatched,
    required: minMatched,
  };
}

/**
 * Pure-substring fallback for very short needles (skill names, single-word
 * project names). Keeps the prior sliding-window-shortest-match semantics.
 */
function findSubstringPosition(
  normalizedNeedle: string,
  items: PdfPositionItem[],
  options: FindPositionsOptions,
): PositionTuple[] {
  const normalized = items.map((item) => normalizeText(item.text));
  const maxWindow = options.maxWindowItems ?? 120;
  let bestStart = -1;
  let bestEnd = -1;
  let bestLength = Infinity;
  for (let start = 0; start < items.length; start += 1) {
    if (!normalized[start]) continue;
    let collected = "";
    const lastIndex = Math.min(items.length - 1, start + maxWindow);
    for (let end = start; end <= lastIndex; end += 1) {
      collected = collected
        ? `${collected} ${normalized[end]}`
        : normalized[end];
      if (collected.length < normalizedNeedle.length) continue;
      if (collected.includes(normalizedNeedle)) {
        const windowSize = end - start + 1;
        if (windowSize < bestLength) {
          bestLength = windowSize;
          bestStart = start;
          bestEnd = end;
        }
        break;
      }
      if (collected.length > normalizedNeedle.length * 4) break;
    }
  }
  if (bestStart === -1) return [];
  return buildBboxTuples(items.slice(bestStart, bestEnd + 1), items);
}

/**
 * Build one bbox tuple per visual line covered by the matched items.
 *
 * When `allItems` is provided, each line's `x0`/`x1` is extended to
 * include any OTHER text item on the page whose y-range overlaps the
 * matched line — making the highlight feel like a real highlighter
 * swipe across the full line rather than a tight box around the matched
 * substring (which can stop mid-sentence at a hyperlink).
 *
 * Lines are detected by y-overlap. An item belongs to an existing line
 * if its [y0, y1] overlaps any item already in the line.
 */
function buildBboxTuples(
  matchedItems: PdfPositionItem[],
  allItems?: PdfPositionItem[],
): PositionTuple[] {
  if (matchedItems.length === 0) return [];

  const byPage = new Map<number, PdfPositionItem[]>();
  for (const item of matchedItems) {
    const list = byPage.get(item.page) ?? [];
    list.push(item);
    byPage.set(item.page, list);
  }

  const tuples: PositionTuple[] = [];
  for (const [page, pageMatched] of byPage) {
    // Group matched items into lines by y-overlap.
    const lines: PdfPositionItem[][] = [];
    const sorted = [...pageMatched].sort((a, b) => a.y0 - b.y0);
    for (const item of sorted) {
      const existing = lines.find((line) =>
        line.some((it) => item.y0 < it.y1 && item.y1 > it.y0),
      );
      if (existing) existing.push(item);
      else lines.push([item]);
    }

    const pageItems = allItems
      ? allItems.filter((it) => it.page === page)
      : null;

    for (const lineItems of lines) {
      let x0 = Math.min(...lineItems.map((it) => it.x0));
      let x1 = Math.max(...lineItems.map((it) => it.x1));
      const y0 = Math.min(...lineItems.map((it) => it.y0));
      const y1 = Math.max(...lineItems.map((it) => it.y1));
      // Extend horizontally to cover the full visual line.
      if (pageItems) {
        for (const it of pageItems) {
          if (it.y0 < y1 && it.y1 > y0) {
            if (it.x0 < x0) x0 = it.x0;
            if (it.x1 > x1) x1 = it.x1;
          }
        }
      }
      tuples.push([page, x0, y0, x1, y1]);
    }
  }

  return tuples;
}

/**
 * Returns a ranked list of search-needle candidates for a given bank
 * entry. The matcher tries them in order and stops on the first hit —
 * earlier candidates are higher-precision (full title + company),
 * later ones are recall-oriented fallbacks (company alone, first/last
 * words of a bullet).
 *
 * Multi-needle generation handles the common parse failure mode where
 * `deriveSearchNeedle` produces a single string that the parser has
 * rewritten just enough to break in-order token matching — e.g. the
 * parser drops a connector word, abbreviates a company, or fills the
 * title with extra metadata. Trying multiple framings of the same
 * entry recovers most of these without per-case branching.
 */
export function deriveSearchNeedles(
  category: string,
  content: Record<string, unknown>,
): string[] {
  const pick = (key: string): string =>
    typeof content[key] === "string" ? (content[key] as string) : "";
  const out: string[] = [];
  const push = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  };

  switch (category) {
    case "experience": {
      const title = pick("title");
      const company = pick("company");
      push([title, company].filter(Boolean).join(" "));
      push([title, "at", company].filter(Boolean).join(" "));
      if (title) push(title);
      if (company) push(company);
      break;
    }
    case "project": {
      const name = pick("name") || pick("title");
      const description = pick("description");
      if (name) push(name);
      if (description) {
        push(description);
        const words = description.split(/\s+/).filter(Boolean);
        if (words.length > 8) push(words.slice(0, 8).join(" "));
        if (words.length > 8) push(words.slice(-8).join(" "));
      }
      break;
    }
    case "education": {
      const institution = pick("institution");
      const degree = pick("degree");
      const field = pick("field");
      push([institution, degree, field].filter(Boolean).join(" "));
      push([degree, field].filter(Boolean).join(" "));
      if (institution) push(institution);
      break;
    }
    case "skill": {
      const name = pick("name");
      if (name) push(name);
      break;
    }
    case "bullet":
    case "achievement": {
      const description = pick("description");
      if (description) {
        push(description);
        const words = description.split(/\s+/).filter(Boolean);
        if (words.length > 8) push(words.slice(0, 8).join(" "));
        if (words.length > 8) push(words.slice(-8).join(" "));
      }
      break;
    }
    case "certification": {
      const name = pick("name");
      const issuer = pick("issuer");
      push([name, issuer].filter(Boolean).join(" "));
      if (name) push(name);
      if (issuer) push(issuer);
      break;
    }
    case "hackathon": {
      const name = pick("name");
      const project = pick("project");
      push([name, project].filter(Boolean).join(" "));
      if (name) push(name);
      if (project) push(project);
      break;
    }
    default:
      push(pick("description"));
      push(pick("name"));
      push(pick("title"));
      break;
  }
  return out;
}

/**
 * Backward-compatible wrapper that returns just the highest-precision
 * candidate. Existing callers can keep using this; new callers that
 * want recall improvements should call `deriveSearchNeedles`.
 */
export function deriveSearchNeedle(
  category: string,
  content: Record<string, unknown>,
): string {
  return deriveSearchNeedles(category, content)[0] ?? "";
}
