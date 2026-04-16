"use client";

import { cn } from "@/lib/utils";
import type { ResumeTemplate } from "@/lib/resume/template-types";
import { Check } from "lucide-react";

interface TemplatePickerProps {
  templates: ResumeTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function TemplatePicker({ templates, selectedId, onSelect }: TemplatePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Template</h3>
      <div className="grid grid-cols-3 gap-2">
        {templates.map((template) => {
          const selected = template.id === selectedId;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={cn(
                "relative flex flex-col items-center rounded-lg border p-2.5 text-center transition-all hover:border-primary/50",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border"
              )}
            >
              {/* Mini preview swatch */}
              <div
                className="mb-1.5 h-10 w-full rounded"
                style={{
                  background: `linear-gradient(135deg, ${template.styles.accentColor}22, ${template.styles.accentColor}44)`,
                  borderBottom: `2px solid ${template.styles.accentColor}`,
                }}
              />
              <span className="text-xs font-medium leading-tight">
                {template.name}
              </span>

              {selected && (
                <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {(() => {
        const selected = templates.find((t) => t.id === selectedId);
        return selected ? (
          <p className="text-xs text-muted-foreground">{selected.description}</p>
        ) : null;
      })()}
    </div>
  );
}
