"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportJobActionsProps {
  disabled: boolean;
  loading: boolean;
  icon: LucideIcon;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ImportJobActions({
  disabled,
  loading,
  icon: Icon,
  submitLabel,
  onCancel,
  onSubmit,
}: ImportJobActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        disabled={disabled}
        className="gradient-bg text-primary-foreground hover:opacity-90"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Icon className="h-4 w-4 mr-2" />
        )}
        {submitLabel}
      </Button>
    </div>
  );
}
