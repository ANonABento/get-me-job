"use client";

import type { BankEntry } from "@/types";

interface ChunkPeekProps {
  childEntries: BankEntry[];
}

/**
 * Read-only bullet list used inline in the components table when a row is
 * expanded via its chevron. No edit / delete / reorder controls — those live
 * in the side drawer (opened via row-body click). Keeping the peek pure-read
 * makes it cheap to scan a row without committing the screen to an edit
 * surface.
 */
export function ChunkPeek({ childEntries }: ChunkPeekProps) {
  if (childEntries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No bullets yet.</p>
    );
  }

  return (
    <ol className="space-y-2 text-sm">
      {childEntries.map((child, index) => (
        <li
          key={child.id}
          className="flex items-start gap-2 rounded-md border border-border/50 bg-card/60 px-3 py-2"
        >
          <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
            {index + 1}
          </span>
          <p className="min-w-0 flex-1 leading-relaxed">
            {String(child.content.description ?? "")}
          </p>
        </li>
      ))}
    </ol>
  );
}
