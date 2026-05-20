"use client";

/**
 * `<LayoutBuilderModal>` — centered `<Dialog>` wrapper around the
 * layout builder, used from the review-queue toolbar. Persists changes
 * via PATCH /api/preferences/opportunities with a 300ms debounce so the
 * user doesn't see a network indicator on every drag/toggle.
 *
 * Originally shipped as a right-side sheet; converted to a modal because
 * the builder already has its own live preview, so the "see your real
 * queue card behind it" argument for a sheet didn't carry its weight.
 * Modal gives the builder a roomier preview column without competing
 * with the queue card.
 *
 * The settings page embeds `<LayoutBuilder>` directly (no modal) but
 * shares the same persistence flow through the parent.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import {
  DEFAULT_LAYOUT,
  getEffectiveLayout,
} from "@/lib/opportunities/default-layout";
import type { LayoutPreference } from "@/lib/opportunities/layout-chunks";

import { LayoutBuilder } from "./layout-builder";

const DEBOUNCE_MS = 300;

interface LayoutBuilderModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Current layout (from the page's preferences fetch). */
  value: LayoutPreference | null | undefined;
  /** Called on every successful persist so the page can re-render the live card. */
  onPersisted(next: LayoutPreference): void;
}

export function LayoutBuilderModal({
  open,
  onOpenChange,
  value,
  onPersisted,
}: LayoutBuilderModalProps) {
  const showErrorToast = useErrorToast();
  // Local draft so dragging doesn't fire a PATCH per move. The debounce
  // below flushes after the user stops interacting.
  const [draft, setDraft] = useState<LayoutPreference>(() =>
    getEffectiveLayout(value ?? DEFAULT_LAYOUT),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value into draft when the modal (re)opens, so a fresh
  // open always starts from the persisted state — not stale local edits
  // from a prior session.
  useEffect(() => {
    if (open) {
      setDraft(getEffectiveLayout(value ?? DEFAULT_LAYOUT));
    }
  }, [open, value]);

  const persist = useCallback(
    async (next: LayoutPreference) => {
      try {
        const response = await fetch("/api/preferences/opportunities", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ layoutPreference: next }),
        });
        await readJsonResponse(response, "Failed to save layout");
        onPersisted(next);
      } catch (error) {
        showErrorToast(error, {
          title: "Couldn't save card layout",
          fallbackDescription: "Your changes will retry on the next edit.",
        });
      }
    },
    [onPersisted, showErrorToast],
  );

  const handleChange = (next: LayoutPreference) => {
    setDraft(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persist(next);
    }, DEBOUNCE_MS);
  };

  // Flush any pending save when the modal closes — the user expects
  // their last edit to stick even if they close mid-debounce.
  useEffect(() => {
    if (open) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      void persist(draft);
    }
    // Intentionally omit `draft` + `persist` from deps — we want this
    // to fire ONLY on close transitions, not every draft change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl">
        <DialogHeader>
          <DialogTitle>Card layout</DialogTitle>
          <DialogDescription>
            Drag chunks within each section to reorder. Toggle the eye to hide a
            chunk without losing its position. Desktop and mobile keep separate
            layouts.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <LayoutBuilder value={draft} onChange={handleChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
