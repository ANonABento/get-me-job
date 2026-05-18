"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { BankEntry } from "@/types";
import { CATEGORY_CONFIG } from "./chunk-card-config";
import { getEntryTitle } from "./chunk-card-utils";
import { ChunkCard } from "./chunk-card";

interface ComponentDetailDrawerProps {
  entry: BankEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childEntries: BankEntry[];
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onCreateChild?: (parent: BankEntry, description: string) => void;
  onReorderChild?: (
    parent: BankEntry,
    childId: string,
    direction: "up" | "down",
  ) => void;
  sourceFilenames?: Map<string, string>;
}

export function ComponentDetailDrawer({
  entry,
  open,
  onOpenChange,
  childEntries,
  onUpdate,
  onDelete,
  onCreateChild,
  onReorderChild,
  sourceFilenames,
}: ComponentDetailDrawerProps) {
  const config = entry ? CATEGORY_CONFIG[entry.category] : null;
  const Icon = config?.icon;
  const title = entry ? getEntryTitle(entry) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        aria-describedby={undefined}
        onClick={(event) => event.stopPropagation()}
      >
        {entry && config && Icon ? (
          <>
            <SheetHeader>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-md p-2 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate" title={title}>
                    {title || "Untitled component"}
                  </SheetTitle>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-2xs">
                      {config.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <SheetDescription className="sr-only">
                Edit the parsed component fields and manage its bullets.
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="px-0 py-0">
              <ChunkCard
                entry={entry}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onCreateChild={onCreateChild}
                onReorderChild={onReorderChild}
                childEntries={childEntries}
                forceExpanded
                sourceFilenames={sourceFilenames}
              />
            </SheetBody>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
