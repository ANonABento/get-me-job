"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  File,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  CloudUpload,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  formatExistingUploadDate,
  getExistingUploadTimestamp,
  type UploadConflictResponse,
} from "@/lib/upload-conflict";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  documentId?: string;
}

export interface UploadResult {
  file: File;
  documentId: string;
}

interface DropzoneProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-6 w-6 text-destructive" />,
  docx: <FileText className="h-6 w-6 text-info" />,
  doc: <FileText className="h-6 w-6 text-info" />,
  txt: <File className="h-6 w-6 text-muted-foreground" />,
};

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return fileTypeIcons[ext] || <File className="h-6 w-6 text-muted-foreground" />;
}

export function Dropzone({
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = {
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
  },
}: DropzoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadConflict, setUploadConflict] = useState<UploadConflictResponse | null>(null);
  const conflictResolverRef = useRef<((replace: boolean) => void) | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      status: "pending" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resolveUploadConflict = (replace: boolean) => {
    conflictResolverRef.current?.(replace);
    conflictResolverRef.current = null;
    setUploadConflict(null);
  };

  const confirmReplacement = (existing: UploadConflictResponse["existing"]) =>
    new Promise<boolean>((resolve) => {
      conflictResolverRef.current = resolve;
      setUploadConflict({ existing });
    });

  const uploadFiles = async () => {
    setIsUploading(true);
    const filesToUpload = files.filter((f) => f.status === "pending");
    const successfulUploads: UploadResult[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const fileIndex = files.findIndex((f) => f.file === filesToUpload[i].file);

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: "uploading" as const, progress: 0 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", filesToUpload[i].file);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === fileIndex && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 100);

        let response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (response.status === 409) {
          const conflictData = await response.json().catch(() => null);
          const existing = conflictData?.existing;
          const shouldReplace = existing
            ? await confirmReplacement(existing)
            : false;

          if (!shouldReplace) {
            throw new Error("Upload canceled");
          }

          response = await fetch("/api/upload?force=true", {
            method: "POST",
            body: formData,
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Upload failed");
        }

        const data = await response.json();
        const documentId = data.document?.id;

        if (!documentId) {
          throw new Error("Upload completed without a document ID");
        }

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? { ...f, status: "success" as const, progress: 100, documentId }
              : f
          )
        );

        successfulUploads.push({ file: filesToUpload[i].file, documentId });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? { ...f, status: "error" as const, error: errorMessage }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    onUploadComplete?.(successfulUploads);
  };

  const pendingFiles = files.filter((f) => f.status === "pending");
  const hasFiles = files.length > 0;

  return (
    <div className="space-y-6">
      <Dialog
        open={!!uploadConflict}
        onOpenChange={(open) => {
          if (!open) resolveUploadConflict(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace existing upload?</DialogTitle>
            <DialogDescription>
              {uploadConflict
                ? `Looks like you uploaded "${uploadConflict.existing.filename}" on ${formatExistingUploadDate(getExistingUploadTimestamp(uploadConflict.existing))}. Replace it, or cancel?`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => resolveUploadConflict(false)}>
              Cancel
            </Button>
            <Button onClick={() => resolveUploadConflict(true)} autoFocus>
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed p-8 lg:p-12 text-center cursor-pointer transition-all duration-300",
          isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.02]",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <input {...getInputProps()} aria-label="Upload resume file" aria-describedby="dropzone-help" />

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-accent blur-3xl" />
        </div>

        <div className="relative z-10">
          <div
            className={cn(
              "mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragActive
                ? "gradient-bg text-primary-foreground scale-110"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isDragActive ? (
              <CloudUpload className="h-10 w-10 animate-bounce" />
            ) : (
              <Upload className="h-10 w-10" />
            )}
          </div>

          <h3 className="mt-6 text-xl font-semibold">
            {isDragReject
              ? "File type not supported"
              : isDragActive
              ? "Drop to upload"
              : "Drag & drop your resume"}
          </h3>

          <p className="mt-2 text-muted-foreground">
            {isDragReject
              ? "Please upload PDF or TXT files only"
              : "or click to browse from your computer"}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
              <FileText className="h-4 w-4" />
              PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
              <File className="h-4 w-4" />
              TXT
            </span>
          </div>

          <p id="dropzone-help" className="mt-4 text-xs text-muted-foreground">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* File List */}
      {hasFiles && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </h4>
            {files.some((f) => f.status === "success") && (
              <span className="text-sm text-success flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Uploaded
              </span>
            )}
          </div>

          <div className="space-y-2">
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className={cn(
                  "group relative flex items-center gap-4 rounded-xl border p-4 transition-all",
                  uploadedFile.status === "success" && "border-success/50 bg-success/5",
                  uploadedFile.status === "error" && "border-destructive/50 bg-destructive/5",
                  uploadedFile.status === "uploading" && "border-primary/50 bg-primary/5"
                )}
              >
                {/* File Icon */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  {getFileIcon(uploadedFile.file.name)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium truncate pr-8">{uploadedFile.file.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatFileSize(uploadedFile.file.size)}</span>
                  {uploadedFile.status === "uploading" && (
                    <span className="text-primary">{uploadedFile.progress}%</span>
                  )}
                  {uploadedFile.status === "error" && uploadedFile.error && (
                    <span className="text-destructive">{uploadedFile.error}</span>
                  )}
                </div>

                  {/* Progress Bar */}
                  {uploadedFile.status === "uploading" && (
                    <Progress value={uploadedFile.progress} size="sm" className="mt-2" />
                  )}
                </div>

                {/* Status Indicator */}
                <div className="shrink-0" aria-live="polite">
                  {uploadedFile.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {uploadedFile.status === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {uploadedFile.status === "success" && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {uploadedFile.status === "error" && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {pendingFiles.length > 0 && (
        <Button
          onClick={uploadFiles}
          disabled={isUploading}
          size="lg"
          className="w-full gradient-bg text-primary-foreground hover:opacity-90"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CloudUpload className="mr-2 h-5 w-5" />
              Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
