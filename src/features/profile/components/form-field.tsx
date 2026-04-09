"use client";

import { Label } from "@/components/ui/label";
import type { ComponentType, ReactNode } from "react";

interface FormFieldProps {
  children: ReactNode;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

export function FormField({ children, icon: Icon, label }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}
