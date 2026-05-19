"use client";

/**
 * `<LayoutBuilderSheet>` — right-side `<Sheet>` wrapper around the
 * layout builder, used from the review-queue toolbar. Persists changes
 * via PATCH /api/preferences/opportunities with a 300ms debounce so the
 * user doesn't see a network indicator on every drag/toggle.
 *
 * The settings page embeds `<LayoutBuilder>` directly (no sheet), but
 * shares the same persistence flow through the parent.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import {
  DEFAULT_LAYOUT,
  getEffectiveLayout,
} from "@/lib/opportunities/default-layout";
import type { LayoutPreference } from "@/lib/opportunities/layout-chunks";

import { LayoutBuilder } from "./layout-builder";

const DEBOUNCE_MS = 300;

interface LayoutBuilderSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Current layout (from the page's preferences fetch). */
  value: LayoutPreference | null | undefined;
  /** Called on every successful persist so the page can re-render the live card. */
  onPersisted(next: LayoutPreference): void;
}

export function LayoutBuilderSheet({
  open,
  onOpenChange,
  value,
  onPersisted,
}: LayoutBuilderSheetProps) {
  const showErrorToast = useErrorToast();
  // Local draft so dragging doesn't fire a PATCH per move. The debounce
  // below flushes after the user stops interacting.
  const [draft, setDraft] = useState<LayoutPreference>(() =>
    getEffectiveLayout(value ?? DEFAULT_LAYOUT),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value into draft when the sheet (re)opens, so a fresh
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

  // Flush any pending save when the sheet closes — the user expects
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Card layout</SheetTitle>
          <SheetDescription>
            Drag chunks within each section to reorder. Toggle the eye to hide a
            chunk without losing its position. Desktop and mobile keep separate
            layouts.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <LayoutBuilder value={draft} onChange={handleChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
