"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { BANK_CATEGORIES, type BankCategory } from "@/types";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<BankCategory, string> = {
  experience: "Experience",
  skill: "Skills",
  project: "Projects",
  education: "Education",
  achievement: "Achievements",
  certification: "Certifications",
};

type SortOption = "date" | "confidence";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  activeCategory: BankCategory | "all";
  onCategoryChange: (category: BankCategory | "all") => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: Record<string, number>;
}

function CountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span className={cn(
      "ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs",
      active ? "bg-white/20 text-white" : "bg-background text-muted-foreground"
    )}>
      {count}
    </span>
  );
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  counts,
}, ref) {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            placeholder="Search your knowledge bank..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-10 pr-10"
            title="Press / to focus"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
          aria-label="Sort order"
        >
          <option value="date">Newest</option>
          <option value="confidence">Confidence</option>
        </select>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
        <button
          role="tab"
          aria-selected={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
            activeCategory === "all"
              ? "gradient-bg text-white shadow-sm scale-105"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          All
          <CountBadge count={totalCount} active={activeCategory === "all"} />
        </button>
        {BANK_CATEGORIES.map((cat) => (
          <button
            role="tab"
            aria-selected={activeCategory === cat}
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === cat
                ? "gradient-bg text-white shadow-sm scale-105"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
              !counts[cat] && activeCategory !== cat && "opacity-50"
            )}
          >
            {CATEGORY_LABELS[cat]}
            <CountBadge count={counts[cat] || 0} active={activeCategory === cat} />
          </button>
        ))}
      </div>
    </div>
  );
});

export { CATEGORY_LABELS };
export type { SortOption };
