"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Save } from "lucide-react";

interface ProfileSaveBarProps {
  hasChanges: boolean;
  onDiscard: () => void;
  onSave: () => void;
  saveStatus: "idle" | "success" | "error";
  saving: boolean;
}

export function ProfileSaveBar({
  hasChanges,
  onDiscard,
  onSave,
  saveStatus,
  saving,
}: ProfileSaveBarProps) {
  if (!hasChanges) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveStatus === "success" ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-success font-medium">Changes saved!</span>
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive font-medium">Failed to save</span>
            </>
          ) : (
            <span className="text-muted-foreground">You have unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onDiscard} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button onClick={onSave} disabled={saving} className="gradient-bg text-white hover:opacity-90">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
