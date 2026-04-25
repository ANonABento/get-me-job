"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobsNoResults({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="rounded-2xl border bg-card p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
        <Search className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold">No jobs match your filters</h3>
      <p className="text-muted-foreground mt-2">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
      <Button variant="outline" onClick={onClearFilters} className="mt-4">
        Clear All Filters
      </Button>
    </div>
  );
}
