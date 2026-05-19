// P3/#39 — Generic "Detected: <source> — N rows" card used by the popup for
// each bulk-scrape source (WaterlooWorks, Greenhouse, Lever, Workday). Lifts
// the existing WW-specific block in App.tsx into a reusable shape so adding a
// new source becomes a one-line change.
//
// Renders:
//   <header> "<sourceLabel> list" + "N rows" badge
//   <action-grid> "Scrape N visible" + "Scrape filtered set"
//   <bulk-result> imported/attempted/pages summary + optional "View tracker →"
//   <inline-error> if a run failed
//
// Visual tokens come from `popup/styles.css` (paper/ink/rust palette).
// No hardcoded colors, no inline color styles.

import React, { useState } from "react";

export type BulkScrapeMode = "visible" | "paginated";

/**
 * Per-row validation failure surfaced from the import endpoint. Each
 * entry is one posting the server couldn't accept — typically because
 * a single field violated the Zod cap (description, title, etc.).
 * Aggregated across all chunks in a single scrape run.
 */
export interface BulkScrapeFailure {
  sourceJobId?: string;
  title?: string;
  company?: string;
  errors: Array<{ field: string; message: string }>;
}

export interface BulkScrapeResult {
  imported: number;
  attempted: number;
  pages: number;
  duplicateCount?: number;
  dedupedIds?: string[];
  errors: string[];
  // Per-row validation failures from the server (RCA #56). Empty array
  // means every row that reached the server validated; non-empty means
  // the popup should surface a "N failed" line + expandable details.
  failed?: BulkScrapeFailure[];
}

export interface BulkProgress {
  scrapedCount: number;
  attemptedCount: number;
  currentPage: number;
  totalRowsOnPage: number;
  lastTitle?: string;
  errors: string[];
}

export interface BulkSourceCardProps {
  /** Human-readable source name shown in the card header & badge ("Greenhouse"). */
  sourceLabel: string;
  /** Row count detected on the current page. */
  detectedCount: number;
  /** Which mode (if any) is currently running. `null` when idle. */
  busy: BulkScrapeMode | null;
  /** Live progress snapshot while busy. `null` between rows / when idle. */
  progress?: BulkProgress | null;
  /** Last completed result for this source (renders the imported/attempted line). */
  lastResult: BulkScrapeResult | null;
  /** Error string from the last failed attempt, if any. */
  lastError: string | null;
  /** Called when the user clicks "Scrape N visible". */
  onScrapeVisible: () => void;
  /** Called when the user clicks "Scrape filtered set" (paginated mode). */
  onScrapePaginated: () => void;
  /** Called when the user clicks the "Stop" button while a scrape is in flight. */
  onCancel?: () => void;
  /** Optional: rendered as a deep-link when the result has imports > 0. */
  onViewTracker?: () => void;
  /**
   * Optional caps surfaced under the "Scrape all" button so users can see
   * the limit before they wonder why a scrape stopped early. Hidden when
   * undefined to keep behavior backward-compatible for sources that don't
   * pipe settings through (Greenhouse, Lever, Workday today).
   */
  limits?: { maxJobs: number; maxPages: number } | null;
  /** Called when the user clicks the "Adjust" link next to the limits. */
  onOpenOptions?: () => void;
}

export function BulkSourceCard(props: BulkSourceCardProps) {
  const {
    sourceLabel,
    detectedCount,
    busy,
    progress,
    lastResult,
    lastError,
    onScrapeVisible,
    onScrapePaginated,
    onCancel,
    onViewTracker,
    limits,
    onOpenOptions,
  } = props;

  const disabled = busy !== null || detectedCount === 0;

  return (
    <article
      className="card bulk-source"
      data-bulk-source={sourceLabel.toLowerCase()}
    >
      <header className="bulk-source-head">
        <span className="card-title">{sourceLabel}</span>
        <span className="badge">
          {detectedCount} row{detectedCount === 1 ? "" : "s"}
        </span>
      </header>
      <div className="bulk-action-row">
        <button
          className="btn primary"
          onClick={onScrapeVisible}
          disabled={disabled}
        >
          {busy === "visible"
            ? "Scraping visible…"
            : `Scrape ${detectedCount} visible`}
        </button>
        <button
          className="btn"
          onClick={onScrapePaginated}
          disabled={disabled}
          title={
            limits
              ? `Walks every page in your current filter set; capped at ${limits.maxJobs} jobs / ${limits.maxPages} pages.`
              : `Walks every page in your current filter set.`
          }
        >
          {busy === "paginated" ? "Scraping all…" : "Scrape all"}
        </button>
      </div>
      {!busy && limits && (
        <p className="bulk-limits">
          Up to {limits.maxJobs} jobs · {limits.maxPages} pages
          {onOpenOptions && (
            <>
              {" · "}
              <button
                type="button"
                className="link inline-link"
                onClick={onOpenOptions}
              >
                Adjust
              </button>
            </>
          )}
        </p>
      )}
      {busy && (
        <div className="bulk-progress">
          <p className="inline-note bulk-progress-summary">
            {progress ? formatProgressLine(busy, progress) : "Starting…"}
          </p>
          {progress?.lastTitle && (
            <p
              className="inline-note bulk-progress-title clip"
              title={progress.lastTitle}
            >
              {progress.lastTitle}
            </p>
          )}
          {onCancel && (
            <button
              className="btn ghost tight bulk-progress-stop"
              onClick={onCancel}
            >
              Stop
            </button>
          )}
        </div>
      )}
      {lastResult && (
        <div className="bulk-result">
          <p className="inline-note">
            Imported {lastResult.imported}/{lastResult.attempted}
            {lastResult.pages > 1 && ` · ${lastResult.pages} pages`}
            {lastResult.duplicateCount
              ? ` · ${lastResult.duplicateCount} duplicates`
              : ""}
            {lastResult.failed && lastResult.failed.length > 0
              ? ` · ${lastResult.failed.length} failed`
              : ""}
            {lastResult.errors.length > 0 &&
              ` · ${lastResult.errors.length} errors`}
          </p>
          {lastResult.dedupedIds?.length ? (
            <p className="inline-note bulk-duplicates">
              Duplicates: {lastResult.dedupedIds.join(", ")}
            </p>
          ) : null}
          {lastResult.failed && lastResult.failed.length > 0 && (
            <FailedRowsPanel failed={lastResult.failed} />
          )}
          {lastResult.imported > 0 && onViewTracker && (
            <button className="success-link" onClick={onViewTracker}>
              View tracker →
            </button>
          )}
        </div>
      )}
      {lastError && <p className="inline-error">{lastError}</p>}
    </article>
  );
}

/**
 * Collapsible details for per-row import failures. Renders one line per
 * failed posting with title/company + the first field-level reason
 * (typically "description too long (62k chars)"). "Copy as JSON" puts
 * the full payload on the clipboard so the user can paste it into a
 * GitHub issue or our triage Slack channel.
 *
 * Amber, not red — partial failure ≠ broken scrape.
 */
function FailedRowsPanel({
  failed,
}: {
  failed: NonNullable<BulkScrapeResult["failed"]>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(failed, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard write can fail in MV2 popups without user gesture
      // semantics. Swallow — the user can still expand and read.
    }
  };

  return (
    <div className="bulk-failed">
      <button
        type="button"
        className="link inline-link bulk-failed-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? "Hide details ▴" : "Show details ▾"}
      </button>
      {expanded && (
        <>
          <p className="inline-note bulk-failed-hint">
            Likely cause: the posting had a field longer than our import limit
            (description, title, requirements). The schema has been relaxed in
            newer builds, so re-running &quot;Scrape all&quot; may recover
            these.
          </p>
          <ul className="bulk-failed-list">
            {failed.slice(0, 50).map((row, i) => {
              const label = row.title || row.sourceJobId || `Row ${i + 1}`;
              const company = row.company ? ` – ${row.company}` : "";
              const firstError = row.errors[0];
              const reason = firstError
                ? `${firstError.field}: ${firstError.message}`
                : "validation error";
              return (
                <li key={`${row.sourceJobId ?? "n"}-${i}`} title={reason}>
                  <span className="bulk-failed-title clip">
                    {label}
                    {company}
                  </span>
                  <span className="bulk-failed-reason inline-note">
                    {reason}
                  </span>
                </li>
              );
            })}
            {failed.length > 50 && (
              <li className="inline-note">
                … and {failed.length - 50} more (see Copy as JSON)
              </li>
            )}
          </ul>
          <button type="button" className="btn ghost tight" onClick={copyJson}>
            {copied ? "Copied!" : "Copy as JSON"}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Progress label format depends on the scrape mode:
 *
 * - Visible: "Scraped N/total" — total is the row count on the page;
 *   meaningful denominator.
 * - Paginated: "Scraped N · page X" — N is cumulative across pages,
 *   total-rows-on-page belongs to the *current* page so showing
 *   "Scraped 57/50" reads as a bug ("how can you scrape more than
 *   there are?"). Drop the denominator and lead with the page index
 *   instead.
 */
function formatProgressLine(
  mode: BulkScrapeMode,
  progress: BulkProgress,
): string {
  const errorSuffix =
    progress.errors.length > 0
      ? ` · ${progress.errors.length} error${progress.errors.length === 1 ? "" : "s"}`
      : "";
  if (mode === "paginated") {
    return `Scraped ${progress.scrapedCount} · page ${progress.currentPage}${errorSuffix}`;
  }
  return `Scraped ${progress.scrapedCount}/${progress.totalRowsOnPage}${errorSuffix}`;
}
