"use client";

import { useState, useCallback, useEffect } from "react";
import { CloudUpload, FileText, File, Loader2, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadStep = "idle" | "dragging" | "uploading" | "parsing" | "done" | "error";

interface UploadOverlayProps {
  onComplete: () => void;
}

export function UploadOverlay({ onComplete }: UploadOverlayProps) {
  const [step, setStep] = useState<UploadStep>("idle");
  const [dragCount, setDragCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const isDragging = dragCount > 0;

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

  const processFile = useCallback(
    async (file: globalThis.File) => {
      setFileName(file.name);
      setStep("uploading");
      setError(null);

      try {
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
        setStep("parsing");
        const parseRes = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId }),
        });
        if (!parseRes.ok) {
          const errData = await parseRes.json().catch(() => null);
          throw new Error(errData?.error || "Parse failed");
        }

        setStep("done");
        setTimeout(() => {
          setStep("idle");
          setDragCount(0);
          onComplete();
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep("error");
      }
    },
    [onComplete]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragCount(0);

      const files = e.dataTransfer?.files;
      if (!files?.length) return;

      const file = files[0];
      const validTypes = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF, DOCX, or TXT file");
        setStep("error");
        return;
      }

      processFile(file);
    },
    [processFile]
  );

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

  const isVisible = isDragging || step === "uploading" || step === "parsing" || step === "done" || step === "error";

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity",
        isDragging && step === "idle" ? "opacity-100" : "",
        step !== "idle" ? "opacity-100" : ""
      )}
    >
      <div className="rounded-2xl border bg-card p-12 text-center max-w-md mx-4 shadow-xl">
        {/* Dragging state */}
        {isDragging && step === "idle" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl gradient-bg text-white flex items-center justify-center mb-6 animate-bounce">
              <CloudUpload className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">Drop your file</h2>
            <p className="text-muted-foreground mt-2">
              Drop your resume, cover letter, or any career document
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

        {/* Uploading */}
        {step === "uploading" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl gradient-bg text-white flex items-center justify-center mb-6">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold">Uploading</h2>
            <p className="text-muted-foreground mt-2">{fileName}</p>
          </>
        )}

        {/* Parsing */}
        {step === "parsing" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl gradient-bg text-white flex items-center justify-center mb-6">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold">Parsing & Chunking</h2>
            <p className="text-muted-foreground mt-2">
              Extracting knowledge from {fileName}
            </p>
          </>
        )}

        {/* Done */}
        {step === "done" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl bg-success/20 text-success flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">Done!</h2>
            <p className="text-muted-foreground mt-2">
              Knowledge bank updated
            </p>
          </>
        )}

        {/* Error */}
        {step === "error" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/20 text-destructive flex items-center justify-center mb-6">
              <X className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">Upload Failed</h2>
            <p className="text-destructive mt-2">{error}</p>
            <button
              onClick={() => {
                setStep("idle");
                setError(null);
              }}
              className="mt-4 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors text-sm"
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}
