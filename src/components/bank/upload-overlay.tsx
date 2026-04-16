"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  CloudUpload,
  FileText,
  File,
  Loader2,
  CheckCircle2,
  X,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Constants & helpers (exported for testing)
// ---------------------------------------------------------------------------

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

/** Human-readable labels keyed by MIME type */
export const MIME_LABELS: Record<AcceptedMimeType, string> = {
  "application/pdf": "PDF",
  "text/plain": "TXT",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
};

export function isAcceptedType(mime: string): mime is AcceptedMimeType {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mime);
}

/** Return a user-friendly error when type validation fails. */
export function fileTypeError(fileName: string): string {
  return `"${fileName}" is not a supported file type. Please upload a PDF, DOCX, or TXT file.`;
}

// Upload pipeline stages — order matters for the progress bar
export const UPLOAD_STAGES = [
  "uploading",
  "extracting",
  "parsing",
  "storing",
] as const;
export type UploadStage = (typeof UPLOAD_STAGES)[number];

export const STAGE_LABELS: Record<UploadStage, string> = {
  uploading: "Uploading file…",
  extracting: "Extracting text…",
  parsing: "Parsing sections…",
  storing: "Storing entries…",
};

/** Return 0-based index of a stage (for progress fraction). */
export function stageIndex(stage: UploadStage): number {
  return UPLOAD_STAGES.indexOf(stage);
}

/** Progress fraction (0–1) for a given stage. */
export function stageProgress(stage: UploadStage): number {
  return (stageIndex(stage) + 1) / UPLOAD_STAGES.length;
}

// ---------------------------------------------------------------------------
// Component types
// ---------------------------------------------------------------------------

type OverlayStep = "idle" | "dragging" | "processing" | "done" | "error";

interface FileResult {
  fileName: string;
  entryCount: number;
}

interface UploadOverlayProps {
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UploadOverlay({ onComplete }: UploadOverlayProps) {
  const [step, setStep] = useState<OverlayStep>("idle");
  const [dragCount, setDragCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage>("uploading");
  const [results, setResults] = useState<FileResult[]>([]);
  const [fileQueue, setFileQueue] = useState<globalThis.File[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const processingRef = useRef(false);

  const isDragging = dragCount > 0;

  // --- drag handlers -------------------------------------------------------

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.types.includes("Files")) {
      setDragCount((c) => c + 1);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragCount((c) => Math.max(0, c - 1));
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  // --- file processing -----------------------------------------------------

  const processFile = useCallback(
    async (file: globalThis.File): Promise<FileResult> => {
      setCurrentFile(file.name);
      setStage("uploading");

      // Upload
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => null);
        throw new Error(errData?.error || "Upload failed");
      }
      const uploadData = await uploadRes.json();
      const documentId = uploadData.document?.id;
      if (!documentId) throw new Error("Upload completed without a document ID");

      // Parse
      setStage("extracting");
      // Small visual pause so user sees stage transition
      await new Promise((r) => setTimeout(r, 300));
      setStage("parsing");

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      if (!parseRes.ok) {
        const errData = await parseRes.json().catch(() => null);
        throw new Error(errData?.error || "Parse failed");
      }
      const parseData = await parseRes.json();

      setStage("storing");
      await new Promise((r) => setTimeout(r, 300));

      const entryCount =
        parseData.entriesCreated ??
        parseData.entries?.length ??
        parseData.count ??
        0;

      return { fileName: file.name, entryCount };
    },
    []
  );

  const processQueue = useCallback(
    async (files: globalThis.File[]) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setStep("processing");
      setResults([]);

      const completed: FileResult[] = [];
      for (let i = 0; i < files.length; i++) {
        setQueueIndex(i);
        try {
          const result = await processFile(files[i]);
          completed.push(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setStep("error");
          processingRef.current = false;
          return;
        }
      }

      setResults(completed);
      setStep("done");
      setTimeout(() => {
        setStep("idle");
        setDragCount(0);
        setResults([]);
        setFileQueue([]);
        setQueueIndex(0);
        processingRef.current = false;
        onComplete();
      }, 2000);
    },
    [onComplete, processFile]
  );

  // --- drop handler --------------------------------------------------------

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragCount(0);

      const droppedFiles = e.dataTransfer?.files;
      if (!droppedFiles?.length) return;

      const validFiles: globalThis.File[] = [];
      const invalidNames: string[] = [];

      for (let i = 0; i < droppedFiles.length; i++) {
        const f = droppedFiles[i];
        if (isAcceptedType(f.type)) {
          validFiles.push(f);
        } else {
          invalidNames.push(f.name);
        }
      }

      if (invalidNames.length > 0 && validFiles.length === 0) {
        setError(fileTypeError(invalidNames[0]));
        setStep("error");
        return;
      }

      if (validFiles.length === 0) return;

      setFileQueue(validFiles);
      processQueue(validFiles);
    },
    [processQueue]
  );

  // --- window listeners ----------------------------------------------------

  useEffect(() => {
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  // --- visibility ----------------------------------------------------------

  const isVisible = isDragging || step !== "idle";
  if (!isVisible) return null;

  // --- helpers for render --------------------------------------------------

  const totalEntries = results.reduce((sum, r) => sum + r.entryCount, 0);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200",
        "bg-background/80 backdrop-blur-sm",
        isDragging && step === "idle"
          ? "opacity-100"
          : step !== "idle"
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
      )}
    >
      {/* Animated dashed border (visible during drag) */}
      {isDragging && step === "idle" && (
        <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-primary/50 animate-pulse pointer-events-none" />
      )}

      <div className="rounded-2xl border bg-card p-12 text-center max-w-md mx-4 shadow-xl">
        {/* ── Dragging ─────────────────────────────────────────────── */}
        {isDragging && step === "idle" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl gradient-bg text-white flex items-center justify-center mb-6 animate-bounce">
              <CloudUpload className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">Drop to upload</h2>
            <p className="text-muted-foreground mt-2">
              Resume, cover letter, or any career document
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
                <FileText className="h-4 w-4" />
                PDF
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <FileText className="h-4 w-4" />
                DOCX
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
                <File className="h-4 w-4" />
                TXT
              </span>
            </div>
          </>
        )}

        {/* ── Processing ───────────────────────────────────────────── */}
        {step === "processing" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl gradient-bg text-white flex items-center justify-center mb-6">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold">{STAGE_LABELS[stage]}</h2>
            <p className="text-muted-foreground mt-2">{currentFile}</p>

            {/* Progress bar */}
            <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stageProgress(stage) * 100}%` }}
              />
            </div>

            {/* Stage indicators */}
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              {UPLOAD_STAGES.map((s) => (
                <span
                  key={s}
                  className={cn(
                    "transition-colors",
                    stageIndex(s) <= stageIndex(stage) && "text-primary font-medium"
                  )}
                >
                  {MIME_LABELS[s as AcceptedMimeType] ?? s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              ))}
            </div>

            {/* Multi-file indicator */}
            {fileQueue.length > 1 && (
              <p className="mt-3 text-xs text-muted-foreground">
                File {queueIndex + 1} of {fileQueue.length}
              </p>
            )}
          </>
        )}

        {/* ── Done ─────────────────────────────────────────────────── */}
        {step === "done" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl bg-success/20 text-success flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">
              Added {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {results.length === 1
                ? `from ${results[0].fileName}`
                : `from ${results.length} files`}
            </p>
          </>
        )}

        {/* ── Error ────────────────────────────────────────────────── */}
        {step === "error" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/20 text-destructive flex items-center justify-center mb-6">
              <X className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">Upload Failed</h2>
            <p className="text-destructive mt-2">{error}</p>
            <div className="mt-4 flex justify-center gap-3">
              {fileQueue.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    processQueue(fileQueue);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Retry
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep("idle");
                  setError(null);
                  setFileQueue([]);
                  setQueueIndex(0);
                  processingRef.current = false;
                }}
              >
                Dismiss
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
