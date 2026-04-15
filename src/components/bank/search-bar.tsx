"use client";

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

export function SearchBar({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  counts,
}: SearchBarProps) {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your knowledge bank..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="date">Newest</option>
          <option value="confidence">Confidence</option>
        </select>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "gradient-bg text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          All ({totalCount})
        </button>
        {BANK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeCategory === cat
                ? "gradient-bg text-white"
                : "bg-muted text-muted-foreground hover:text-foreground",
              !counts[cat] && "opacity-50"
            )}
          >
            {CATEGORY_LABELS[cat]} ({counts[cat] || 0})
          </button>
        ))}
      </div>
    </div>
  );
}

export { CATEGORY_LABELS };
export type { SortOption };
