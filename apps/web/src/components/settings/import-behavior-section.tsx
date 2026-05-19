"use client";

/**
 * Settings section for opportunity-import behavior. Spec:
 * docs/opportunity-customization-spec.md §4 bucket E.
 *
 * Three controls — auto-import toggle (informational for now; the
 * review-queue gate is still the default), default status dropdown,
 * and the auto-tag rules list-builder. All three live in the same
 * opportunity_view_preferences row.
 */
import { Loader2, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { AutoTagRulesBuilder } from "@/components/settings/auto-tag-rules-builder";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/components/ui/page-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import { cn } from "@/lib/utils";
import {
  IMPORT_DEFAULT_STATUSES,
  type ImportDefaultStatus,
  type OpportunityAutoTagRule,
} from "@slothing/shared/schemas";

interface ImportBehaviorPreferences {
  autoImportEnabled: boolean;
  defaultImportStatus: ImportDefaultStatus;
  autoTagRules: OpportunityAutoTagRule[];
}

const STATUS_LABELS: Record<ImportDefaultStatus, string> = {
  pending: "Pending review",
  saved: "Saved (skip review)",
};

export function ImportBehaviorSection() {
  const [prefs, setPrefs] = useState<ImportBehaviorPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const showErrorToast = useErrorToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/preferences/opportunities");
        const data = await readJsonResponse<{
          preferences: ImportBehaviorPreferences;
        }>(response, "Failed to load preferences");
        if (!cancelled) setPrefs(data.preferences);
      } catch (error) {
        if (!cancelled) {
          showErrorToast(error, {
            title: "Could not load import preferences",
            fallbackDescription: "Please refresh the page.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showErrorToast]);

  const patch = async (updates: Partial<ImportBehaviorPreferences>) => {
    if (!prefs) return;
    const next = { ...prefs, ...updates };
    setPrefs(next);
    setSaving(true);
    try {
      const response = await fetch("/api/preferences/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await readJsonResponse<{
        preferences: ImportBehaviorPreferences;
      }>(response, "Failed to save preference");
      setPrefs(data.preferences);
    } catch (error) {
      // Rollback to whatever the server last accepted.
      setPrefs(prefs);
      showErrorToast(error, {
        title: "Could not save preference",
        fallbackDescription: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prefs) {
    return (
      <PageSection
        icon={Tags}
        title="Import behavior"
        description="Auto-tag rules + defaults for newly-imported opportunities."
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection
      icon={Tags}
      title="Import behavior"
      description="Auto-tag rules + defaults for newly-imported opportunities."
    >
      <div className="space-y-6">
        {/* Auto-import toggle. Informational for now — the import path
            still routes through the review queue regardless. A future
            phase will use this to bypass the queue. */}
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.autoImportEnabled}
              onChange={(event) =>
                void patch({ autoImportEnabled: event.target.checked })
              }
              className="h-4 w-4 rounded border"
            />
            <span>Auto-import bulk-scraped postings</span>
          </label>
          <p className="ml-6 mt-1 text-xs text-muted-foreground">
            When off (default), scrapes land in the review queue. Turning on
            stamps the default status below directly. (UI ships now; bypass
            logic lands in a follow-up.)
          </p>
        </div>

        {/* Default status */}
        <div>
          <Label
            className="text-sm font-medium"
            htmlFor="default-import-status"
          >
            Default status for imported postings
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Applied by the import endpoint when the scraper doesn&apos;t specify
            a status (most extension imports).
          </p>
          <Select
            value={prefs.defaultImportStatus}
            onValueChange={(next) =>
              void patch({ defaultImportStatus: next as ImportDefaultStatus })
            }
          >
            <SelectTrigger
              id="default-import-status"
              className="mt-2 h-9 w-[260px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPORT_DEFAULT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <hr className="border-border" />

        {/* Auto-tag rules */}
        <div>
          <Label className="text-sm font-medium">Auto-tag rules</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Each rule attaches one or more tags to every newly-imported posting
            whose metadata matches the trigger. Rules apply only at import time
            — existing postings keep their current tags.
          </p>
          <div className="mt-3">
            <AutoTagRulesBuilder
              rules={prefs.autoTagRules}
              onChange={(next) => void patch({ autoTagRules: next })}
            />
          </div>
        </div>

        {saving && (
          <p
            className={cn(
              "text-xs",
              saving ? "text-muted-foreground" : "text-transparent",
            )}
          >
            Saving…
          </p>
        )}
      </div>
    </PageSection>
  );
}
