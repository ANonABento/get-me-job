"use client";

import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Search, X } from "lucide-react";

import { FilterTabs, type FilterTabOption } from "@/components/ui/filter-tabs";
import { Input } from "@/components/ui/input";
import { THEME_CONTROL_CLASSES } from "@/lib/theme/component-classes";
import { cn } from "@/lib/utils";

export interface SearchFilterSortOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SearchFilterToolbarProps<
  TFilter extends string,
  TSort extends string,
> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchAriaLabel: string;
  searchPlaceholder: string;
  searchTitle?: string;
  clearSearchAriaLabel?: string;
  sortValue: TSort;
  onSortChange: (value: TSort) => void;
  sortOptions: ReadonlyArray<SearchFilterSortOption<TSort>>;
  sortAriaLabel: string;
  filterOptions: ReadonlyArray<FilterTabOption<TFilter>>;
  filterValue: TFilter;
  onFilterChange: (value: TFilter) => void;
  filterAriaLabel: string;
  controls?: ReactNode;
  resultCountLabel?: ReactNode;
  className?: string;
}

function SearchFilterToolbarInner<
  TFilter extends string,
  TSort extends string,
>(
  {
    searchValue,
    onSearchChange,
    searchAriaLabel,
    searchPlaceholder,
    searchTitle,
    clearSearchAriaLabel,
    sortValue,
    onSortChange,
    sortOptions,
    sortAriaLabel,
    filterOptions,
    filterValue,
    onFilterChange,
    filterAriaLabel,
    controls,
    resultCountLabel,
    className,
  }: SearchFilterToolbarProps<TFilter, TSort>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={ref}
            aria-label={searchAriaLabel}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className={cn("pl-10", clearSearchAriaLabel && "pr-12")}
            title={searchTitle}
          />
          {clearSearchAriaLabel && searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label={clearSearchAriaLabel}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <select
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value as TSort)}
          className={cn(
            THEME_CONTROL_CLASSES,
            "w-full px-3 py-2 text-sm lg:w-36",
          )}
          aria-label={sortAriaLabel}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {controls ? (
          <div className="flex flex-wrap items-center gap-2">{controls}</div>
        ) : null}
        {resultCountLabel ? (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {resultCountLabel}
          </span>
        ) : null}
      </div>

      <FilterTabs
        ariaLabel={filterAriaLabel}
        options={filterOptions}
        value={filterValue}
        onChange={onFilterChange}
      />
    </div>
  );
}

export const SearchFilterToolbar = forwardRef(
  SearchFilterToolbarInner,
) as <TFilter extends string, TSort extends string>(
  props: SearchFilterToolbarProps<TFilter, TSort> & {
    ref?: Ref<HTMLInputElement>;
  },
) => ReactElement;
