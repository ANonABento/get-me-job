"use client";

import { useState, useEffect, useCallback } from "react";
import { TimeAgo } from "@/components/format/time-ago";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  FileText,
  Loader2,
  File,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
import { useErrorToast } from "@/hooks/use-error-toast";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
}

interface DriveFilePickerProps {
  onSelect: (file: DriveFile) => void;
  folder?: "resumes" | "cover_letters" | "backups" | string;
  accept?: string[];
  trigger?: React.ReactNode;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) {
    return <FileText className="h-5 w-5 text-destructive" />;
  }
  if (mimeType.includes("image")) {
    return <FileImage className="h-5 w-5 text-info" />;
  }
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className="h-5 w-5 text-success" />;
  }
  if (mimeType.includes("document") || mimeType.includes("word")) {
    return <FileText className="h-5 w-5 text-info" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatFileSize(bytes?: string): string {
  if (!bytes) return "";
  const size = parseInt(bytes, 10);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DriveFilePicker({
  onSelect,
  folder = "resumes",
  accept,
  trigger,
}: DriveFilePickerProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showErrorToast = useErrorToast();

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/google/drive/list?folder=${folder}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load files");
        return;
      }

      let filteredFiles = data.files || [];
      if (accept && accept.length > 0) {
        filteredFiles = filteredFiles.filter((f: DriveFile) =>
          accept.some((type) => f.mimeType.includes(type)),
        );
      }

      setFiles(filteredFiles);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not load Drive files",
        fallbackDescription:
          "Please check your Google connection and try again.",
      });
      setError("Failed to load files from Google Drive");
    } finally {
      setLoading(false);
    }
  }, [folder, accept, showErrorToast]);

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open, loadFiles]);

  function handleSelect(file: DriveFile) {
    onSelect(file);
    setOpen(false);
  }

  const folderLabel =
    folder === "resumes"
      ? "Resumes"
      : folder === "cover_letters"
        ? "Cover Letters"
        : folder === "backups"
          ? "Backups"
          : folder;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FolderOpen className="mr-2 h-4 w-4" />
            Import from Google Drive
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Select File from Google Drive
          </DialogTitle>
          <DialogDescription>
            Choose a file from your {folderLabel} folder
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading files...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFiles}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                No files found in this folder
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload files to your Slothing folder in Google Drive
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleSelect(file)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  {getFileIcon(file.mimeType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {file.modifiedTime && (
                        <span>
                          <TimeAgo date={file.modifiedTime} />
                        </span>
                      )}
                      {file.size && (
                        <>
                          <span>·</span>
                          <span>{formatFileSize(file.size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
