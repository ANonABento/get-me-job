"use client";

/**
 * Settings panel for opportunity display + scrape preferences. Spec:
 * docs/opportunity-customization-spec.md §4 buckets C+D.
 *
 * One section in /settings — covers both display knobs (density, default
 * sort, visible badges) and extension-side scrape knobs (throttle,
 * chunk size, max jobs/pages, dedupe). The extension reads the scrape
 * subset directly via /api/extension/preferences (see bucket D wiring).
 */
import { useEffect, useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SORT_OPTIONS } from "@/lib/opportunities/sort";
import { cn } from "@/lib/utils";

const VISIBLE_BADGE_KEYS = [
  "applicants",
  "openings",
  "workTerm",
  "level",
  "remote",
  "source",
  "deadline",
  "salary",
] as const;
type VisibleBadgeKey = (typeof VISIBLE_BADGE_KEYS)[number];

const BADGE_LABELS: Record<VisibleBadgeKey, string> = {
  applicants: "Applicants",
  openings: "Openings",
  workTerm: "Work term",
  level: "Level",
  remote: "Remote",
  source: "Source",
  deadline: "Deadline",
  salary: "Salary",
};

interface Preferences {
  displayDensity: "comfortable" | "compact";
  defaultSortId: string;
  visibleBadges: VisibleBadgeKey[];
  scrapeThrottleMs: number;
  scrapeChunkSize: number;
  scrapeMaxJobs: number;
  scrapeMaxPages: number;
  scrapeDedupeEnabled: boolean;
}

export function OpportunityPreferencesSection() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const showErrorToast = useErrorToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/preferences/opportunities");
        const data = await readJsonResponse<{ preferences: Preferences }>(
          response,
          "Failed to load preferences",
        );
        if (!cancelled) setPreferences(data.preferences);
      } catch (error) {
        if (!cancelled) {
          showErrorToast(error, {
            title: "Could not load preferences",
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

  const patch = async (updates: Partial<Preferences>) => {
    if (!preferences) return;
    const next = { ...preferences, ...updates };
    // Optimistic — toggles + dropdowns feel instant; we revert on failure.
    setPreferences(next);
    setSaving(true);
    try {
      const response = await fetch("/api/preferences/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await readJsonResponse<{ preferences: Preferences }>(
        response,
        "Failed to save preference",
      );
      setPreferences(data.preferences);
    } catch (error) {
      // Restore previous value if the server rejected it.
      setPreferences(preferences);
      showErrorToast(error, {
        title: "Could not save preference",
        fallbackDescription: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !preferences) {
    return (
      <PageSection
        icon={SlidersHorizontal}
        title="Opportunity preferences"
        description="Display + scrape settings for the opportunities surface."
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </PageSection>
    );
  }

  const toggleBadge = (key: VisibleBadgeKey) => {
    const current = new Set(preferences.visibleBadges);
    if (current.has(key)) current.delete(key);
    else current.add(key);
    void patch({
      visibleBadges: Array.from(current) as VisibleBadgeKey[],
    });
  };

  return (
    <PageSection
      icon={SlidersHorizontal}
      title="Opportunity preferences"
      description="Display + scrape settings for the opportunities surface."
    >
      <div className="space-y-6">
        {/* Display density */}
        <div>
          <Label className="text-sm font-medium">Display density</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Comfortable adds breathing room; compact fits more on one screen.
          </p>
          <div className="mt-2 inline-flex rounded-md border bg-card p-0.5">
            {(["comfortable", "compact"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => void patch({ displayDensity: value })}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                  preferences.displayDensity === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Default sort */}
        <div>
          <Label className="text-sm font-medium" htmlFor="default-sort">
            Default sort
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Applied when the review queue opens without an active preset.
          </p>
          <Select
            value={preferences.defaultSortId}
            onValueChange={(next) => void patch({ defaultSortId: next })}
          >
            <SelectTrigger id="default-sort" className="mt-2 h-9 w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  disabled={!option.isAvailable({})}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visible badges */}
        <div>
          <Label className="text-sm font-medium">Visible badges</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Which metadata chips render on each review-queue card.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VISIBLE_BADGE_KEYS.map((key) => {
              const active = preferences.visibleBadges.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleBadge(key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                  aria-pressed={active}
                >
                  {BADGE_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-border" />

        {/* Scrape settings — bucket D */}
        <div>
          <Label className="text-sm font-medium">Scrape settings</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Controls the browser extension&apos;s bulk scrape. Higher throttle =
            slower but more reliable; larger chunks = fewer HTTP roundtrips.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-md">
            <NumericPreference
              id="scrape-throttle"
              label="Row throttle (ms)"
              value={preferences.scrapeThrottleMs}
              min={100}
              max={5000}
              onCommit={(next) => void patch({ scrapeThrottleMs: next })}
            />
            <NumericPreference
              id="scrape-chunk"
              label="Import chunk size"
              value={preferences.scrapeChunkSize}
              min={1}
              max={50}
              onCommit={(next) => void patch({ scrapeChunkSize: next })}
            />
            <NumericPreference
              id="scrape-max-jobs"
              label="Max jobs / scrape"
              value={preferences.scrapeMaxJobs}
              min={1}
              max={1000}
              onCommit={(next) => void patch({ scrapeMaxJobs: next })}
            />
            <NumericPreference
              id="scrape-max-pages"
              label="Max pages / scrape"
              value={preferences.scrapeMaxPages}
              min={1}
              max={200}
              onCommit={(next) => void patch({ scrapeMaxPages: next })}
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preferences.scrapeDedupeEnabled}
              onChange={(event) =>
                void patch({ scrapeDedupeEnabled: event.target.checked })
              }
              className="h-4 w-4 rounded border"
            />
            Skip postings already imported (recommended)
          </label>
        </div>

        {saving && <p className="text-xs text-muted-foreground">Saving…</p>}
      </div>
    </PageSection>
  );
}

/**
 * Numeric input that only writes back on blur / Enter so each keystroke
 * doesn't fire a PATCH. Clamps to [min, max] before commit.
 */
function NumericPreference({
  id,
  label,
  value,
  min,
  max,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit(next: number): void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);
  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    const clamped = Number.isFinite(parsed)
      ? Math.max(min, Math.min(max, parsed))
      : value;
    if (clamped !== value) onCommit(clamped);
    setDraft(String(clamped));
  };
  return (
    <div>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
        className="mt-1 h-8 text-sm"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        {min}–{max}
      </p>
    </div>
  );
}

export function OpportunityPreferencesButton() {
  return (
    <Button asChild variant="ghost" size="sm">
      <a href="#opportunity-preferences">Opportunity preferences</a>
    </Button>
  );
}
