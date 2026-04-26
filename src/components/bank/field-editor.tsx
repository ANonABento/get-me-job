"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listToText, textToList } from "./chunk-card-utils";
import type { FieldEditorProps } from "./chunk-card.types";

export function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <Input
            id={`field-${field.key}`}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="h-8 text-sm"
          />
        </div>
      );
    case "textarea":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <textarea
            id={`field-${field.key}`}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <input
            id={`field-${field.key}`}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
        </div>
      );
    case "list":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <textarea
            id={`field-${field.key}`}
            value={listToText(value)}
            onChange={(e) => onChange(field.key, textToList(e.target.value))}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      );
    case "select":
      return (
        <div className="space-y-1">
          <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <select
            id={`field-${field.key}`}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    default:
      return null;
  }
}
