"use client";

/**
 * InterviewShell — the editorial 3-column scaffold for /interview.
 *
 * Layout mirrors the v2 `.ip-grid` (280px / 1fr / 320px), collapsing rails
 * progressively at narrower breakpoints. Each slot is rendered as-is; the
 * stage slot is wrapped in an EditorialPanel so it gets the paper-card frame
 * the v2 design calls for.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InterviewShellProps {
  /** Left rail — session list. */
  rail: ReactNode;
  /** Center stage — transcript / composer / score strip. */
  stage: ReactNode;
  /** Right rail — coach (per Open Q#5: primary coach placement). */
  coach: ReactNode;
  className?: string;
}

export function InterviewShell({
  rail,
  stage,
  coach,
  className,
}: InterviewShellProps) {
  return (
    <div
      className={cn(
        // 280 / 1fr / 320 at xl; collapse coach at lg; collapse both at sm
        "grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]",
        className,
      )}
    >
      <div className="min-w-0 order-2 lg:order-1">{rail}</div>
      <div className="min-w-0 order-1 lg:order-2">{stage}</div>
      <div className="min-w-0 order-3 hidden xl:block">{coach}</div>
    </div>
  );
}
