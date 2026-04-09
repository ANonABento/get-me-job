"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_REMOTE_OPTIONS,
  JOB_SORT_OPTIONS,
  JOB_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
} from "@/features/jobs/constants";
import { Filter, Search, SortAsc, X } from "lucide-react";

interface JobsFiltersProps {
  hasActiveFilters: boolean;
  jobsCount: number;
  onClearFilters: () => void;
  onRemoteFilterChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  remoteFilter: string;
  searchQuery: string;
  sortBy: string;
  statusFilter: string;
  typeFilter: string;
  visibleJobsCount: number;
}

export function JobsFilters({
  hasActiveFilters,
  jobsCount,
  onClearFilters,
  onRemoteFilterChange,
  onSearchQueryChange,
  onSortByChange,
  onStatusFilterChange,
  onTypeFilterChange,
  remoteFilter,
  searchQuery,
  sortBy,
  statusFilter,
  typeFilter,
  visibleJobsCount,
}: JobsFiltersProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 border-b">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company, or keywords..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {JOB_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={remoteFilter} onValueChange={onRemoteFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {JOB_REMOTE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-32">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {JOB_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            Showing {visibleJobsCount} of {jobsCount} jobs
          </span>
        </div>
      )}
    </div>
  );
}
