"use client";

import { forwardRef, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { BANK_CATEGORIES, type BankCategory } from "@/types";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_CONTROL_CLASSES } from "@/lib/theme/component-classes";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

const CATEGORY_LABELS: Record<BankCategory, string> = {
  experience: "Experience",
  skill: "Skills",
  project: "Projects",
  hackathon: "Hackathons",
  paragraph: "Paragraphs",
  education: "Education",
  bullet: "Bullets",
  achievement: "Achievements",
  certification: "Certifications",
};

type SortOption = "date" | "confidence";
type CategoryFilter = BankCategory | "all";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: Record<string, number>;
  controls?: ReactNode;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      query,
      onQueryChange,
      activeCategory,
      onCategoryChange,
      sortBy,
      onSortChange,
      counts,
      controls,
    },
    ref,
  ) {
    const a11yT = useA11yTranslations();

    // The "All" tab count must match what clicking it actually shows. Today
    // the All filter excludes child bullets (see sortedEntries in
    // components-tab.tsx), so the badge needs to count non-child entries —
    // exactly what `counts.all` carries when the caller derived it via
    // `deriveCategoryCounts`. Fall back to summing the per-category values
    // for callers that haven't migrated.
    const totalCount =
      typeof counts.all === "number"
        ? counts.all
        : Object.values(counts).reduce((a, b) => a + b, 0);
    const categoryOptions = [
      { value: "all" as const, label: "All", count: totalCount },
      ...BANK_CATEGORIES.map((cat) => ({
        value: cat,
        label: CATEGORY_LABELS[cat],
        count: counts[cat] || 0,
        disabled: !counts[cat],
      })),
    ];

    return (
      <div className="space-y-3">
        {/* Search input */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={ref}
              aria-label={a11yT("searchYourCareerProfile")}
              placeholder={a11yT("searchYourCareerProfile2")}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="pl-10 pr-12"
              title={a11yT("pressToFocus")}
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={a11yT("clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={cn(THEME_CONTROL_CLASSES, "px-3 py-2 text-sm lg:w-36")}
            aria-label={a11yT("sortOrder")}
          >
            <option value="date">Newest</option>
            <option value="confidence">Confidence</option>
          </select>
          {controls ? (
            <div className="flex flex-wrap items-center gap-2">{controls}</div>
          ) : null}
        </div>

        {/* Category filter chips */}
        <FilterTabs
          ariaLabel={a11yT("filterByCategory")}
          options={categoryOptions}
          value={activeCategory}
          onChange={onCategoryChange}
        />
      </div>
    );
  },
);

export { CATEGORY_LABELS };
export type { SortOption };
