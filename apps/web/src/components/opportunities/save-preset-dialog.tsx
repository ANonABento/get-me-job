"use client";

/**
 * "Save current filter set as a preset" dialog. Compact form — name +
 * pin checkbox. Filters + sort are passed in as already-computed
 * snapshots from whatever surface the user is on, so the dialog itself
 * doesn't need to know about filter shape.
 *
 * Spec: docs/opportunity-customization-spec.md §4 bucket A.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SavePresetDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  defaultName?: string;
  busy?: boolean;
  // Caller wires through the actual filter+sort snapshot — dialog only
  // captures user-facing fields (name + pin).
  onSubmit(input: { name: string; pinned: boolean }): Promise<void> | void;
}

export function SavePresetDialog({
  open,
  onOpenChange,
  defaultName,
  busy,
  onSubmit,
}: SavePresetDialogProps) {
  const [name, setName] = useState(defaultName ?? "");
  const [pinned, setPinned] = useState(true);

  // Reset the name + pin every time the dialog re-opens so a previous
  // save doesn't leak its values into the next session.
  useEffect(() => {
    if (open) {
      setName(defaultName ?? "");
      setPinned(true);
    }
  }, [open, defaultName]);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= 80 && !busy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save preset</DialogTitle>
          <DialogDescription>
            Save the current filters + sort as a preset you can apply with one
            click.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="preset-name">Name</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Co-op, Junior, <100 applicants"
              maxLength={80}
              autoFocus
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {trimmed.length}/80
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(event) => setPinned(event.target.checked)}
              className="h-4 w-4 rounded border"
            />
            Pin to preset bar
          </label>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!canSubmit) return;
              await onSubmit({ name: trimmed, pinned });
            }}
            disabled={!canSubmit}
          >
            {busy ? "Saving…" : "Save preset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
