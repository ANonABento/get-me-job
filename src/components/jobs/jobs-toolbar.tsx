"use client";

import { Filter, Search, SortAsc, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPageWidthClassName,
  type PageWidth,
} from "@/components/ui/page-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JobRemoteFilter, JobSortOption, JobStatusFilter, JobTypeFilter } from "@/app/(app)/jobs/filter-jobs";
import { cn } from "@/lib/utils";
import { TRACKED_JOB_STATUSES, TRACKED_JOB_STATUS_LABELS } from "@/lib/constants/jobs";

interface JobsToolbarProps {
  searchQuery: string;
  statusFilter: JobStatusFilter;
  typeFilter: JobTypeFilter;
  remoteFilter: JobRemoteFilter;
  sortBy: JobSortOption;
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: JobStatusFilter) => void;
  onTypeChange: (value: JobTypeFilter) => void;
  onRemoteChange: (value: JobRemoteFilter) => void;
  onSortChange: (value: JobSortOption) => void;
  onClearFilters: () => void;
  width?: PageWidth;
}

export function JobsToolbar(props: JobsToolbarProps) {
  const {
    searchQuery,
    statusFilter,
    typeFilter,
    remoteFilter,
    sortBy,
    hasActiveFilters,
    filteredCount,
    totalCount,
    onSearchChange,
    onStatusChange,
    onTypeChange,
    onRemoteChange,
    onSortChange,
    onClearFilters,
    width = "wide",
  } = props;

  return (
    <div
      className={cn(
        "border-b px-5 py-6 sm:px-8",
        getPageWidthClassName(width),
      )}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company, or keywords..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-10 pr-12"
          />
          {searchQuery && (
            <button
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as JobStatusFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {TRACKED_JOB_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {TRACKED_JOB_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value) => onTypeChange(value as JobTypeFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Select value={remoteFilter} onValueChange={(value) => onRemoteChange(value as JobRemoteFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => onSortChange(value as JobSortOption)}>
            <SelectTrigger className="w-32">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
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
            Showing {filteredCount} of {totalCount} jobs
          </span>
        </div>
      )}
    </div>
  );
}
