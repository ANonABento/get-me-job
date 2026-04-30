"use client";

import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardEmptyState } from "@/components/ui/page-layout";

export function JobsEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <StandardEmptyState
      icon={Briefcase}
      title="No jobs tracked yet"
      description="Add a job description to analyze your match score and generate a tailored resume."
      action={
        <Button
          onClick={onAdd}
          size="lg"
          className="gradient-bg text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Your First Job
        </Button>
      }
    />
  );
}
