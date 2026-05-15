"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MonoCap } from "@/components/editorial";

export interface SettingsNavItem {
  id: string;
  label: string;
  /**
   * Optional right-aligned hint (e.g. status dot or count). Rendered as
   * mono caption text.
   */
  hint?: string;
  /**
   * If `true`, the item is shown in the destructive accent — used for
   * "Danger zone" so it reads as a different class of action.
   */
  destructive?: boolean;
}

interface SettingsNavProps {
  items: ReadonlyArray<SettingsNavItem>;
  /**
   * Optional label rendered above the list (mono caps). Defaults to
   * "Sections" to match the v2 design.
   */
  label?: string;
  className?: string;
}

/**
 * Vertical settings nav — anchor links + scroll-spy active state.
 *
 * Uses an `IntersectionObserver` on each section to determine which
 * item is "current" as the user scrolls. Falls back to the first item
 * on initial render.
 */
export function SettingsNav({
  items,
  label = "Sections",
  className,
}: SettingsNavProps) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that is
        // currently intersecting. Falls back to the most recent one
        // when nothing intersects (e.g. between two short sections).
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      {
        // Trigger as soon as the section crosses ~25% of the viewport
        // from the top. The "-65% bottom" keeps the active state stable
        // when the section is mostly off-screen at the bottom.
        rootMargin: "-25% 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      className={cn("sticky top-4 flex flex-col gap-1 self-start", className)}
      aria-label="Settings sections"
    >
      <MonoCap size="sm" tone="muted" className="px-3 pb-2 pt-1">
        {label}
      </MonoCap>
      <ul className="flex flex-col gap-[2px]">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md border-l-2 border-transparent px-3 py-1.5 text-[13px] transition-colors",
                  "text-ink-2 hover:bg-rule-strong-bg hover:text-ink",
                  isActive &&
                    "border-l-brand bg-rule-strong-bg font-semibold text-ink",
                  item.destructive && "text-destructive hover:text-destructive",
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.hint ? (
                  <MonoCap size="sm" tone="muted" className="ml-auto">
                    {item.hint}
                  </MonoCap>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
