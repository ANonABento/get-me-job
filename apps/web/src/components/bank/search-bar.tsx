"use client";

import { forwardRef, type ReactNode } from "react";
import { SearchFilterToolbar } from "@/components/ui/search-filter-toolbar";
import { BANK_CATEGORIES, type BankCategory } from "@/types";
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
    const sortOptions = [
      { value: "date" as const, label: "Newest" },
      { value: "confidence" as const, label: "Confidence" },
    ];

    return (
      <SearchFilterToolbar
        ref={ref}
        searchValue={query}
        onSearchChange={onQueryChange}
        searchAriaLabel={a11yT("searchYourCareerProfile")}
        searchPlaceholder={a11yT("searchYourCareerProfile2")}
        searchTitle={a11yT("pressToFocus")}
        clearSearchAriaLabel={a11yT("clearSearch")}
        sortValue={sortBy}
        onSortChange={onSortChange}
        sortOptions={sortOptions}
        sortAriaLabel={a11yT("sortOrder")}
        filterOptions={categoryOptions}
        filterValue={activeCategory}
        onFilterChange={onCategoryChange}
        filterAriaLabel={a11yT("filterByCategory")}
        controls={controls}
      />
    );
  },
);

export { CATEGORY_LABELS };
export type { SortOption };
