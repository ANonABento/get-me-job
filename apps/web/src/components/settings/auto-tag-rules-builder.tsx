"use client";

/**
 * Auto-tag rules list-builder used by the import-behavior settings
 * section. Spec: docs/opportunity-customization-spec.md §4 bucket E.
 *
 * Each row: enabled-toggle · trigger dropdown · trigger value text ·
 * tag chips (with add/remove) · delete button. Add row at the bottom.
 *
 * State is owned by the parent (so the parent can PATCH the whole
 * preferences blob in one round-trip); this component is purely
 * controlled.
 */
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AUTO_TAG_TRIGGER_TYPES,
  type AutoTagTriggerType,
  type OpportunityAutoTagRule,
} from "@slothing/shared/schemas";

const TRIGGER_LABELS: Record<AutoTagTriggerType, string> = {
  "source-equals": "Source equals",
  "title-includes": "Title includes",
  "work-term-includes": "Work term includes",
  "level-equals": "Level equals",
};

const TRIGGER_PLACEHOLDERS: Record<AutoTagTriggerType, string> = {
  "source-equals": "waterlooworks",
  "title-includes": "co-op",
  "work-term-includes": "Fall",
  "level-equals": "junior",
};

export interface AutoTagRulesBuilderProps {
  rules: OpportunityAutoTagRule[];
  onChange(rules: OpportunityAutoTagRule[]): void;
  maxRules?: number;
}

export function AutoTagRulesBuilder({
  rules,
  onChange,
  maxRules = 50,
}: AutoTagRulesBuilderProps) {
  const atMax = rules.length >= maxRules;

  const update = (id: string, patch: Partial<OpportunityAutoTagRule>) => {
    onChange(
      rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  };
  const remove = (id: string) => {
    onChange(rules.filter((rule) => rule.id !== id));
  };
  const append = () => {
    if (atMax) return;
    onChange([
      ...rules,
      {
        // Stable enough for in-session keys; the server reissues IDs on
        // first save if we ever need them globally unique.
        id: `rule-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        enabled: true,
        trigger: "source-equals",
        triggerValue: "",
        tags: [],
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No rules yet. Each rule tags freshly-imported postings whose metadata
          matches the trigger.
        </p>
      )}
      {rules.map((rule) => (
        <RuleRow
          key={rule.id}
          rule={rule}
          onChange={(patch) => update(rule.id, patch)}
          onRemove={() => remove(rule.id)}
        />
      ))}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={append}
        disabled={atMax}
        className="gap-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Add rule
      </Button>
      {atMax && (
        <p className="text-xs text-muted-foreground">
          Rule limit reached ({maxRules}). Delete one to add another.
        </p>
      )}
    </div>
  );
}

function RuleRow({
  rule,
  onChange,
  onRemove,
}: {
  rule: OpportunityAutoTagRule;
  onChange(patch: Partial<OpportunityAutoTagRule>): void;
  onRemove(): void;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        rule.enabled ? "bg-card" : "bg-muted/50 opacity-70",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
            className="h-4 w-4 rounded border"
          />
          <span className="text-muted-foreground">When</span>
        </label>
        <Select
          value={rule.trigger}
          onValueChange={(next) =>
            onChange({ trigger: next as AutoTagTriggerType })
          }
        >
          <SelectTrigger className="h-8 w-[200px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUTO_TAG_TRIGGER_TYPES.map((trigger) => (
              <SelectItem key={trigger} value={trigger}>
                {TRIGGER_LABELS[trigger]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={rule.triggerValue}
          onChange={(event) => onChange({ triggerValue: event.target.value })}
          placeholder={TRIGGER_PLACEHOLDERS[rule.trigger]}
          maxLength={200}
          className="h-8 max-w-[220px] text-sm"
        />
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
          aria-label="Delete rule"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3">
        <Label className="text-xs text-muted-foreground">Apply tags</Label>
        <TagChipInput
          tags={rule.tags}
          onChange={(next) => onChange({ tags: next })}
        />
      </div>
    </div>
  );
}

/**
 * Token-input control — type a tag + press Enter / "," to commit;
 * backspace on empty input pops the last tag; click the × on a chip
 * to remove. No external dep.
 */
function TagChipInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange(next: string[]): void;
}) {
  const [draft, setDraft] = useState("");
  const commit = (value: string) => {
    const trimmed = value.trim().slice(0, 40);
    if (!trimmed) return;
    // Case-insensitive dedupe at the UI layer too — matches the engine.
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    if (tags.length >= 10) return;
    onChange([...tags, trimmed]);
    setDraft("");
  };
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-md border bg-card px-2 py-1.5">
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((_, i) => i !== index))}
            className="rounded-full hover:bg-primary/20"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit(draft);
          } else if (
            event.key === "Backspace" &&
            draft === "" &&
            tags.length > 0
          ) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={tags.length === 0 ? "co-op, fall-2026, …" : ""}
        className="min-w-[120px] flex-1 border-0 bg-transparent text-xs outline-none"
        maxLength={40}
      />
    </div>
  );
}
