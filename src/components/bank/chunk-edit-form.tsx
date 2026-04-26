"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldEditor } from "./field-editor";
import type { FieldDef } from "./chunk-card.types";

interface ChunkEditFormProps {
  fields: FieldDef[];
  editContent: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ChunkEditForm({
  fields,
  editContent,
  onFieldChange,
  onCancel,
  onSave,
}: ChunkEditFormProps) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <FieldEditor
          key={field.key}
          field={field}
          value={editContent[field.key]}
          onChange={onFieldChange}
        />
      ))}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={onSave}>
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}
