"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

interface ProfileSectionProps {
  addLabel?: string;
  children: ReactNode;
  expanded: boolean;
  icon: ComponentType<{ className?: string }>;
  itemCount: string;
  onAdd?: () => void;
  onToggle: () => void;
  title: string;
}

export function ProfileSection({
  addLabel,
  children,
  expanded,
  icon: Icon,
  itemCount,
  onAdd,
  onToggle,
  title,
}: ProfileSectionProps) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{itemCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && expanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              {addLabel}
            </Button>
          )}
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>
      {expanded && <div className="p-5 pt-0 border-t">{children}</div>}
    </div>
  );
}
