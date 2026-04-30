"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardEmptyState } from "@/components/ui/page-layout";

export function JobsNoResults({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <StandardEmptyState
      icon={Search}
      title="No jobs match your filters"
      description="Try adjusting your search or filters to find what you're looking for."
      action={
        <Button variant="outline" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      }
    />
  );
}
