"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ComponentType } from "react";

interface ProfileEmptySectionStateProps {
  actionLabel: string;
  icon: ComponentType<{ className?: string }>;
  message: string;
  onAction: () => void;
}

export function ProfileEmptySectionState({
  actionLabel,
  icon: Icon,
  message,
  onAction,
}: ProfileEmptySectionStateProps) {
  return (
    <div className="py-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button variant="outline" onClick={onAction}>
        <Plus className="h-4 w-4 mr-1" />
        {actionLabel}
      </Button>
    </div>
  );
}
