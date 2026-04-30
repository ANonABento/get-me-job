"use client";

import { Eye, Pencil, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderPanel } from "@/lib/builder/section-manager";

const RESUME_MOBILE_TABS: Array<{
  panel: BuilderPanel;
  label: string;
  Icon: LucideIcon;
}> = [
  { panel: "edit", label: "Edit", Icon: Pencil },
  { panel: "preview", label: "Preview", Icon: Eye },
];

interface MobileBuilderTabsProps {
  mobileView: BuilderPanel;
  onMobileViewChange: (panel: BuilderPanel) => void;
}

export function MobileBuilderTabs({
  mobileView,
  onMobileViewChange,
}: MobileBuilderTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Builder view"
      className="flex border-b-[length:var(--border-width)] bg-background md:hidden"
    >
      {RESUME_MOBILE_TABS.map(({ panel, label, Icon }) => (
        <button
          key={panel}
          id={`builder-${panel}-tab`}
          type="button"
          role="tab"
          aria-selected={mobileView === panel}
          aria-controls={`builder-${panel}-panel`}
          onClick={() => onMobileViewChange(panel)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-[length:calc(var(--border-width)_*_2)] px-4 py-2.5 text-sm font-medium transition-colors",
            mobileView === panel
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
