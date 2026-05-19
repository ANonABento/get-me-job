"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ListChecks,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HighlightLayer, type HighlightInput } from "./highlight-layer";

type PdfPreviewTab = "pdf" | "source" | "diagnostics";

interface PdfPreviewDiagnostic {
  lineCount: number;
  parsedRoots: {
    education: number;
    experiences: number;
    projects: number;
    skills: number;
  };
  missingRootSourceSpans: string[];
  missingBulletSourceSpans: string[];
  partialRootSourceSpans: string[];
  partialBulletSourceSpans: string[];
}

interface PdfPreviewProps {
  documentId: string;
  filename: string;
  highlights: HighlightInput[];
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  sourceText?: string;
  diagnostic?: PdfPreviewDiagnostic | null;
  diagnosticLoading?: boolean;
  /**
   * Imperative request to navigate to the page containing the given entry's
   * first bbox. Returns a function the parent can call (via ref); driven by
   * P1.6 "View in document" link.
   */
  onRegisterNavigator?: (navigator: (entryId: string) => void) => () => void;
}

interface PdfJsViewport {
  width: number;
  height: number;
}

interface PdfJsPage {
  getViewport: (opts: { scale: number }) => PdfJsViewport;
  render: (opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfJsViewport;
  }) => { promise: Promise<void> };
}

interface PdfJsDocument {
  numPages: number;
  getPage: (n: number) => Promise<PdfJsPage>;
  destroy?: () => Promise<void> | void;
}

interface PdfJsModule {
  getDocument: (opts: { data: Uint8Array; verbosity?: number }) => {
    promise: Promise<PdfJsDocument>;
  };
  GlobalWorkerOptions?: { workerSrc: string };
}

let pdfjsPromise: Promise<PdfJsModule> | null = null;
const PDFJS_MODULE_PATH = "/pdfjs/pdf.mjs";

/**
 * Load pdfjs-dist once and configure its worker. The non-legacy build is the
 * browser-targeted ESM module. Worker URL is served from `/pdfjs/`-prefixed
 * public assets — `new URL(..., import.meta.url)` doesn't resolve through
 * Next.js's webpack for ESM packages, and we don't want to fall back to
 * "fake worker" mode (which warns loudly and runs PDF parsing on the main
 * thread, blocking the modal).
 *
 * Loading the legacy build (`pdfjs-dist/legacy/build/pdf.mjs`) in Next.js's
 * (app-pages-browser) layer triggers `Object.defineProperty called on
 * non-object` inside its webpack-shim header — we steer clear of it here.
 */
function loadPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    // `webpackIgnore: true` tells Next.js's webpack not to re-bundle the
    // pdfjs module — the browser fetches the ESM directly from `/public`.
    // Re-bundling triggered a webpack-runtime collision (pdfjs's own
    // `__webpack_require__.r(...)` shim called inside Next's webpack
    // runtime) that threw `Object.defineProperty called on non-object`.
    pdfjsPromise = import(
      /* @vite-ignore */ /* webpackIgnore: true */ PDFJS_MODULE_PATH
    ).then((mod) => {
      const pdfjs = mod as unknown as PdfJsModule;
      if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";
      }
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; doc: PdfJsDocument; pageDimensions: PdfJsViewport[] };

export function PdfPreview({
  documentId,
  filename,
  highlights,
  selectedEntryId,
  onSelectEntry,
  sourceText,
  diagnostic,
  diagnosticLoading,
  onRegisterNavigator,
}: PdfPreviewProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [activeTab, setActiveTab] = useState<PdfPreviewTab>("pdf");
  const [pageNumber, setPageNumber] = useState(1);
  const [pendingScrollEntryId, setPendingScrollEntryId] = useState<
    string | null
  >(null);
  const [zoom, setZoom] = useState(1);
  const [previewWidth, setPreviewWidth] = useState(0);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch + parse PDF on mount.
  useEffect(() => {
    let cancelled = false;
    let docHandle: PdfJsDocument | null = null;
    setState({ status: "loading" });

    (async () => {
      try {
        const res = await fetch(`/api/bank/documents/${documentId}/pdf`);
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Preview unavailable for this upload."
              : `Failed to load preview (${res.status}).`,
          );
        }
        const buffer = new Uint8Array(await res.arrayBuffer());
        const pdfjs = await loadPdfjs();
        const loadingTask = pdfjs.getDocument({
          data: buffer,
          verbosity: 0,
        });
        docHandle = await loadingTask.promise;
        if (cancelled) {
          await docHandle.destroy?.();
          return;
        }
        const dims: PdfJsViewport[] = [];
        for (let p = 1; p <= docHandle.numPages; p += 1) {
          const page = await docHandle.getPage(p);
          dims.push(page.getViewport({ scale: 1 }));
        }
        if (cancelled) {
          await docHandle.destroy?.();
          return;
        }
        setState({ status: "ready", doc: docHandle, pageDimensions: dims });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Could not load preview.",
        });
      }
    })();

    return () => {
      cancelled = true;
      docHandle?.destroy?.();
    };
  }, [documentId]);

  const currentPageDimensions = useMemo(() => {
    if (state.status !== "ready") return null;
    return state.pageDimensions[pageNumber - 1] ?? null;
  }, [state, pageNumber]);

  useEffect(() => {
    const node = previewViewportRef.current;
    if (!node) return;

    const updatePreviewWidth = () => {
      setPreviewWidth(node.clientWidth);
    };
    updatePreviewWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePreviewWidth);
      return () => window.removeEventListener("resize", updatePreviewWidth);
    }

    const observer = new ResizeObserver(updatePreviewWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const renderScale = useMemo(() => {
    if (!currentPageDimensions || previewWidth <= 0) return zoom;
    const horizontalPadding = 32;
    const fitWidth = Math.max(240, previewWidth - horizontalPadding);
    const fitScale = fitWidth / currentPageDimensions.width;
    return Math.max(0.25, Math.min(2.5, fitScale * zoom));
  }, [currentPageDimensions, previewWidth, zoom]);

  // Render the current page to canvas whenever doc / page / zoom changes.
  useEffect(() => {
    if (activeTab !== "pdf" || state.status !== "ready" || !canvasRef.current) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const page = await state.doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        if (!cancelled) {
          console.error("[pdf-preview] render failed", err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, state, pageNumber, renderScale]);

  // Imperative jump-to-entry, exposed via onRegisterNavigator.
  const navigate = useCallback(
    (entryId: string) => {
      const target = highlights.find((h) => h.entryId === entryId);
      if (!target || target.bboxes.length === 0) return;
      setActiveTab("pdf");
      setPageNumber(target.bboxes[0][0]);
      setPendingScrollEntryId(entryId);
    },
    [highlights],
  );
  useEffect(() => {
    if (!onRegisterNavigator) return;
    return onRegisterNavigator(navigate);
  }, [navigate, onRegisterNavigator]);

  const totalPages = state.status === "ready" ? state.doc.numPages : 1;
  const pageHighlights = highlights
    .map((h) => ({
      entryId: h.entryId,
      category: h.category,
      sourceQuality: h.sourceQuality,
      bboxes: h.bboxes.filter((b) => b[0] === pageNumber),
    }))
    .filter((h) => h.bboxes.length > 0);
  const showHighlightFallback = highlights.every((h) => h.bboxes.length === 0);
  const rootCount = diagnostic
    ? diagnostic.parsedRoots.education +
      diagnostic.parsedRoots.experiences +
      diagnostic.parsedRoots.projects +
      diagnostic.parsedRoots.skills
    : 0;
  const missingCount = diagnostic
    ? diagnostic.missingRootSourceSpans.length +
      diagnostic.missingBulletSourceSpans.length
    : 0;
  const partialCount = diagnostic
    ? diagnostic.partialRootSourceSpans.length +
      diagnostic.partialBulletSourceSpans.length
    : 0;
  const diagnosticSummary = diagnosticLoading
    ? "Parser-v2 loading"
    : diagnostic
      ? `${diagnostic.lineCount} lines · ${rootCount} roots`
      : null;

  useEffect(() => {
    if (
      activeTab !== "pdf" ||
      state.status !== "ready" ||
      !pendingScrollEntryId ||
      !currentPageDimensions
    ) {
      return;
    }

    const viewport = previewViewportRef.current;
    const target = pageHighlights.find(
      (highlight) => highlight.entryId === pendingScrollEntryId,
    );
    const bbox = target?.bboxes[0];
    if (!viewport || !bbox) return;

    const [, x0, y0, x1, y1] = bbox;
    const centerX = ((x0 + x1) / 2) * renderScale;
    const centerY = ((y0 + y1) / 2) * renderScale;
    viewport.scrollTo({
      left: Math.max(0, centerX - viewport.clientWidth / 2),
      top: Math.max(0, centerY - viewport.clientHeight / 2),
      behavior: "smooth",
    });
    setPendingScrollEntryId(null);
  }, [
    activeTab,
    currentPageDimensions,
    pageHighlights,
    pendingScrollEntryId,
    renderScale,
    state.status,
  ]);

  function tabButton(tab: PdfPreviewTab, label: string) {
    const selected = activeTab === tab;
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => setActiveTab(tab)}
        className={cn(
          "h-7 rounded-md px-2 text-xs font-medium transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {label}
      </button>
    );
  }

  function renderPdfPanel() {
    if (state.status === "loading") {
      return (
        <div className="flex h-full min-h-[400px] items-center justify-center px-6 text-sm text-muted-foreground">
          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview...
            </div>
            <div className="mx-auto aspect-[8.5/11] w-44 overflow-hidden rounded-md border bg-card p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-5 space-y-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-2 animate-pulse rounded bg-muted"
                    style={{ width: `${index % 3 === 0 ? 72 : 92}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (state.status === "error") {
      return (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm font-medium">{state.message}</p>
          <p className="text-xs text-muted-foreground">
            Components are still editable. Source text and diagnostics remain
            available when parser-v2 extraction succeeded.
          </p>
        </div>
      );
    }

    return (
      <div
        ref={previewViewportRef}
        className="flex-1 overflow-auto px-4 pb-4 pt-3"
      >
        <div className={cn("relative mx-auto block w-fit")}>
          <canvas
            ref={canvasRef}
            className="block border bg-card shadow-sm"
            aria-label={`${filename} page ${pageNumber}`}
          />
          {currentPageDimensions ? (
            <HighlightLayer
              highlights={pageHighlights}
              selectedEntryId={selectedEntryId}
              onSelectEntry={onSelectEntry}
              pageWidth={currentPageDimensions.width}
              pageHeight={currentPageDimensions.height}
              renderScale={renderScale}
            />
          ) : null}
        </div>
        {showHighlightFallback ? (
          <p className="mt-3 max-w-prose text-xs text-muted-foreground">
            Could not locate parsed components in this PDF. Text-layer positions
            did not match any extracted entry.
          </p>
        ) : null}
      </div>
    );
  }

  function renderSourcePanel() {
    return (
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-3">
        {sourceText?.trim() ? (
          <pre className="whitespace-pre-wrap break-words rounded-md border bg-muted/20 p-3 font-body text-sm leading-6 text-foreground">
            {sourceText}
          </pre>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border bg-muted/20 px-6 text-center">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Source text unavailable</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Parser-v2 extraction did not return raw source text for this
              document.
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderDiagnosticsPanel() {
    if (diagnosticLoading) {
      return (
        <div className="flex min-h-[220px] items-center justify-center gap-2 px-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading parser-v2 diagnostics
        </div>
      );
    }

    if (!diagnostic) {
      return (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-6 text-center">
          <ListChecks className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">Diagnostics unavailable</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            No parser-v2 diagnostic payload was returned for this preview.
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-3">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Source lines
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {diagnostic.lineCount}
            </p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Parsed roots
            </p>
            <p className="mt-1 text-2xl font-semibold">{rootCount}</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Missing spans
            </p>
            <p className="mt-1 text-2xl font-semibold">{missingCount}</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Partial spans
            </p>
            <p className="mt-1 text-2xl font-semibold">{partialCount}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex min-w-[12rem] flex-1 items-center gap-2">
            <span
              className="min-w-0 truncate font-medium text-foreground"
              title={filename}
            >
              {filename}
            </span>
            {diagnosticSummary ? (
              <span className="hidden shrink-0 text-muted-foreground xl:inline">
                {diagnosticSummary}
              </span>
            ) : null}
          </div>
          {activeTab === "pdf" ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPageNumber((n) => Math.max(1, n - 1))}
                disabled={pageNumber <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="tabular-nums">
                Page {pageNumber} of {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setPageNumber((n) => Math.min(totalPages, n + 1))
                }
                disabled={pageNumber >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <span className="mx-1.5 h-3 w-px bg-border" aria-hidden="true" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))
                }
                aria-label="Zoom out"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))
                }
                aria-label="Zoom in"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : null}
          <div className="ml-auto flex shrink-0 items-center rounded-md border bg-background p-0.5">
            {tabButton("pdf", "PDF")}
            {tabButton("source", "Source")}
            {tabButton("diagnostics", "Diagnostics")}
          </div>
          {diagnosticSummary ? (
            <span className="text-muted-foreground xl:hidden">
              {diagnosticSummary}
            </span>
          ) : null}
        </div>
      </div>
      {activeTab === "pdf"
        ? renderPdfPanel()
        : activeTab === "source"
          ? renderSourcePanel()
          : renderDiagnosticsPanel()}
    </div>
  );
}
