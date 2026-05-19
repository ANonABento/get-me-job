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

import React from "react";

export type BulkScrapeMode = "visible" | "paginated";

export interface BulkScrapeResult {
  imported: number;
  attempted: number;
  pages: number;
  duplicateCount?: number;
  dedupedIds?: string[];
  errors: string[];
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
          title={`Walks every page in your current filter set; capped at 200 jobs.`}
        >
          {busy === "paginated" ? "Scraping all…" : "Scrape all"}
        </button>
      </div>
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
            {lastResult.errors.length > 0 &&
              ` · ${lastResult.errors.length} errors`}
          </p>
          {lastResult.dedupedIds?.length ? (
            <p className="inline-note bulk-duplicates">
              Duplicates: {lastResult.dedupedIds.join(", ")}
            </p>
          ) : null}
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
