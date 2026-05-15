"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface EditorialDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /**
   * Optional eyebrow shown above the title (e.g. "OPPORTUNITY").
   */
  eyebrow?: string;
  /** Right-side header slot (e.g. status pill, action menu). */
  headerAction?: ReactNode;
  /** Footer slot, pinned to the bottom of the drawer. */
  footer?: ReactNode;
  children: ReactNode;
  /**
   * Width in px. Defaults to 480 per the design handoff. The drawer
   * still maxes out at the viewport width on narrow screens.
   */
  widthPx?: number;
  /**
   * Aria label for the close button. Defaults to "Close".
   */
  closeLabel?: string;
}

export function EditorialDetailDrawer({
  open,
  onClose,
  title,
  eyebrow,
  headerAction,
  footer,
  children,
  widthPx = 480,
  closeLabel = "Close",
}: EditorialDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Esc closes the drawer.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll while open and restore focus on close.
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the drawer itself for keyboard users.
    drawerRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  // Focus trap — Tab cycles within the drawer.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !drawer.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !drawer.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (typeof window === "undefined") {
    // Avoid rendering the portal during SSR; the drawer hydrates client-side.
    return null;
  }
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[80] flex"
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="Dismiss drawer"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-scrim/50 backdrop-blur-sm"
      />
      {/* Drawer body */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={cn(
          "ml-auto flex h-full w-full flex-col border-l border-rule bg-paper shadow-panel outline-none animate-slide-in-right",
        )}
        style={{ maxWidth: `${widthPx}px` }}
      >
        <header
          className={cn(
            "flex items-start justify-between gap-3 border-b border-rule px-5 py-4",
          )}
        >
          <div className="min-w-0">
            {eyebrow ? (
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                {eyebrow}
              </span>
            ) : null}
            <h2 className="truncate font-display text-[18px] font-semibold tracking-tight text-ink">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {headerAction ? (
              <div className="flex-shrink-0">{headerAction}</div>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="grid h-8 w-8 place-items-center rounded-md text-ink-2 transition-colors hover:bg-rule-strong-bg hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer ? (
          <footer className="border-t border-rule px-5 py-3">{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
