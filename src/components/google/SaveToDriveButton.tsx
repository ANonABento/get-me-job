"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Loader2,
  CheckCircle,
  Link,
  AlertCircle,
} from "lucide-react";

interface SaveToDriveButtonProps {
  file: File | Blob;
  fileName: string;
  type: "resume" | "cover_letter";
  onSuccess?: (result: { fileId: string; shareableLink?: string }) => void;
  compact?: boolean;
}

export function SaveToDriveButton({
  file,
  fileName,
  type,
  onSuccess,
  compact = false,
}: SaveToDriveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const res = await fetch("/api/google/auth");
      const data = await res.json();
      setConnected(data.connected);
    } catch {
      setConnected(false);
    }
  }

  async function handleSave(createLink = false) {
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append("type", type);
      formData.append("createShareableLink", String(createLink));

      const res = await fetch("/api/google/drive/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSaved(true);

        if (data.shareableLink) {
          await navigator.clipboard.writeText(data.shareableLink);
        }

        onSuccess?.({
          fileId: data.fileId,
          shareableLink: data.shareableLink,
        });
      } else {
        setError(data.error || "Failed to save");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save to Drive");
    } finally {
      setSaving(false);
    }
  }

  // Not connected
  if (connected === false) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>Connect Google in Settings to save to Drive</span>
      </div>
    );
  }

  // Loading connection status
  if (connected === null) {
    return (
      <Button variant="outline" disabled size={compact ? "sm" : "default"}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  // Already saved
  if (saved) {
    return (
      <Button
        variant="outline"
        className="text-green-600"
        disabled
        size={compact ? "sm" : "default"}
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Saved to Drive
      </Button>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            size={compact ? "sm" : "default"}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Compact mode - single button
  if (compact) {
    return (
      <Button
        onClick={() => handleSave(false)}
        disabled={saving}
        size="sm"
        variant="outline"
      >
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Cloud className="mr-2 h-4 w-4" />
        )}
        {saving ? "Saving..." : "Save to Drive"}
      </Button>
    );
  }

  // Full mode - two buttons
  return (
    <div className="flex gap-2">
      <Button onClick={() => handleSave(false)} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Cloud className="mr-2 h-4 w-4" />
        )}
        {saving ? "Saving..." : "Save to Drive"}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSave(true)}
        disabled={saving}
      >
        <Link className="mr-2 h-4 w-4" />
        Save & Get Link
      </Button>
    </div>
  );
}
