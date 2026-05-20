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
  DEFAULT_BENTO_LAYOUT,
  getEffectiveBentoLayout,
} from "@/lib/opportunities/default-bento";
import type { BentoLayoutPreference } from "@/lib/opportunities/bento-layout";

import { BentoLayoutBuilder } from "./bento-layout-builder";
import { BentoGrid } from "./bento-grid";
import { LAYOUT_PREVIEW_OPPORTUNITY } from "@/lib/opportunities/layout-preview-fixture";

const DEBOUNCE_MS = 300;

interface LayoutBuilderModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  /**
   * Current stored layout (raw — could be bento, legacy F.1, or null).
   * `getEffectiveBentoLayout` normalises it before the builder mounts.
   */
  value: unknown;
  /** Called on every successful persist so the page can re-render the live card. */
  onPersisted(next: BentoLayoutPreference): void;
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
  const [draft, setDraft] = useState<BentoLayoutPreference>(() =>
    getEffectiveBentoLayout(value ?? DEFAULT_BENTO_LAYOUT),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value into draft when the modal (re)opens, so a fresh
  // open always starts from the persisted state — not stale local edits
  // from a prior session.
  useEffect(() => {
    if (open) {
      setDraft(getEffectiveBentoLayout(value ?? DEFAULT_BENTO_LAYOUT));
    }
  }, [open, value]);

  const persist = useCallback(
    async (next: BentoLayoutPreference) => {
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

  const handleChange = (next: BentoLayoutPreference) => {
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

  // Static preview context so the BentoGrid can render the fixture
  // without needing real callbacks. Action buttons in the preview are
  // no-ops; "Show more" toggles are also stubbed.
  const previewContext = {
    preview:
      LAYOUT_PREVIEW_OPPORTUNITY.summary.slice(0, 260) +
      (LAYOUT_PREVIEW_OPPORTUNITY.summary.length > 260 ? "…" : ""),
    expanded: false,
    setExpanded: () => undefined,
    tags: LAYOUT_PREVIEW_OPPORTUNITY.tags ?? [],
    payDisplayUnit: "annual" as const,
    payDisplayCurrency: "USD",
    onAction: () => undefined,
    actionDisabled: false,
    canApply: true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(95vw,1500px)] !max-w-none">
        <DialogHeader>
          <DialogTitle>Card layout</DialogTitle>
          <DialogDescription>
            Drag chunks between cells, resize, regroup. The preview on the right
            shows exactly how the review card will render.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[78vh] grid-cols-1 gap-6 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Editor — left column on wide viewports. */}
          <div className="min-w-0">
            <BentoLayoutBuilder value={draft} onChange={handleChange} />
          </div>
          {/* Live preview — right column. Sticky on wide viewports so the
              card stays visible while the user scrolls the editor. */}
          <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start">
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Live preview · Desktop
            </p>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <BentoGrid
                layout={draft.desktop}
                mobileExpandedCount={draft.mobile.expandedCount}
                device="desktop"
                opportunity={LAYOUT_PREVIEW_OPPORTUNITY}
                context={previewContext}
              />
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
