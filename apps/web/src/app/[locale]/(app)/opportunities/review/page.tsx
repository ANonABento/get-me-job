"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { OpportunityReviewQueue } from "@/components/opportunities/review-queue";
import { PresetBar } from "@/components/opportunities/preset-bar";
import { SortDropdown } from "@/components/opportunities/sort-dropdown";
import { SavePresetDialog } from "@/components/opportunities/save-preset-dialog";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { OpportunitiesReviewSkeleton } from "@/components/skeletons/opportunities-review-skeleton";
import { Button } from "@/components/ui/button";
import { AppPage, PageContent } from "@/components/ui/page-layout";
import { PrerequisiteEmptyState } from "@/components/ui/empty-states";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import type { SettingsResponse } from "@/types/api";
import type { Opportunity } from "@/types/opportunity";
import type {
  OpportunityPreset,
  OpportunitySortId,
  PayNormalizationCurrency,
  PayNormalizationUnit,
} from "@slothing/shared/schemas";
import type { CurrencyRateMap } from "@/lib/opportunities/pay";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";
import { sortOpportunities } from "@/lib/opportunities/sort";

interface OpportunitiesResponse {
  opportunities?: Opportunity[];
}

interface PresetsResponse {
  presets?: OpportunityPreset[];
}

interface OpportunityPreferencesResponse {
  preferences?: {
    payNormalizationUnit?: PayNormalizationUnit;
    payNormalizationCurrency?: PayNormalizationCurrency;
  };
}

interface CurrencyRatesResponse {
  rates?: CurrencyRateMap;
}

export default function OpportunityReviewPage() {
  const a11yT = useA11yTranslations();

  const [jobs, setJobs] = useState<Opportunity[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const showErrorToast = useErrorToast();
  // P0 preset state — server-backed presets list, the one applied right
  // now (null = no preset, raw queue), and a manual sort override that
  // takes effect when no preset is active.
  const [presets, setPresets] = useState<OpportunityPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [manualSortId, setManualSortId] =
    useState<OpportunitySortId>("most-recent");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [payDisplayUnit, setPayDisplayUnit] =
    useState<PayNormalizationUnit>("annual");
  const [payDisplayCurrency, setPayDisplayCurrency] =
    useState<PayNormalizationCurrency>("USD");
  const [currencyRates, setCurrencyRates] = useState<CurrencyRateMap>({});
  const { confirm: confirmDelete, dialog: confirmDialog } = useConfirmDialog();

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        settingsResponse,
        jobsResponse,
        presetsResponse,
        preferencesResponse,
        ratesResponse,
      ] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/opportunities"),
        fetch("/api/opportunity-presets?scope=review"),
        fetch("/api/preferences/opportunities"),
        fetch("/api/currency-rates"),
      ]);
      const settingsData = await readJsonResponse<SettingsResponse>(
        settingsResponse,
        "Failed to load settings",
      );
      const jobsData = await readJsonResponse<OpportunitiesResponse>(
        jobsResponse,
        "Failed to load opportunities",
      );
      const presetsData = await readJsonResponse<PresetsResponse>(
        presetsResponse,
        "Failed to load presets",
      );
      const preferencesData =
        await readJsonResponse<OpportunityPreferencesResponse>(
          preferencesResponse,
          "Failed to load preferences",
        );
      const ratesData = await readJsonResponse<CurrencyRatesResponse>(
        ratesResponse,
        "Failed to load currency rates",
      );

      setEnabled(settingsData.opportunityReview?.enabled ?? true);
      setJobs(jobsData.opportunities || []);
      setPresets(presetsData.presets || []);
      if (preferencesData.preferences?.payNormalizationUnit) {
        setPayDisplayUnit(preferencesData.preferences.payNormalizationUnit);
      }
      if (preferencesData.preferences?.payNormalizationCurrency) {
        setPayDisplayCurrency(
          preferencesData.preferences.payNormalizationCurrency,
        );
      }
      if (ratesData.rates) {
        setCurrencyRates(ratesData.rates);
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load review queue",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  const activePreset = useMemo(
    () =>
      activePresetId
        ? (presets.find((p) => p.id === activePresetId) ?? null)
        : null,
    [activePresetId, presets],
  );

  const effectiveSortId: OpportunitySortId =
    activePreset?.sortId ?? manualSortId;

  // Apply the active preset's filters + sort to the raw jobs list. Filter
  // shape is intentionally permissive — extra keys are ignored. P0 only
  // honors `status`, `type`, `source`, `tags`, and `search` (the current
  // OpportunityFilters set); later phases can widen this.
  const visibleJobs = useMemo(() => {
    const filters = activePreset?.filters ?? {};
    const filtered = jobs.filter((job) => {
      if (filters.status && job.status !== filters.status) return false;
      if (filters.type && job.type !== filters.type) return false;
      if (filters.source && job.source !== filters.source) return false;
      if (filters.tags && filters.tags.length > 0) {
        const jobTags = new Set(job.tags ?? []);
        if (!filters.tags.every((t) => jobTags.has(t))) return false;
      }
      if (filters.search) {
        const needle = filters.search.toLowerCase();
        const haystack =
          `${job.title} ${job.company} ${job.summary}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
    return sortOpportunities(filtered, effectiveSortId, {
      payTargetCurrency: payDisplayCurrency,
      currencyRates,
    });
  }, [jobs, activePreset, effectiveSortId, payDisplayCurrency, currencyRates]);

  const applyPreset = (preset: OpportunityPreset) => {
    setActivePresetId(preset.id);
  };
  const clearPreset = () => setActivePresetId(null);

  const savePreset = async ({
    name,
    pinned,
  }: {
    name: string;
    pinned: boolean;
  }) => {
    setSavingPreset(true);
    try {
      const response = await fetch("/api/opportunity-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          scope: "review",
          // P0: capture the active preset's filters or empty (no filter UI
          // outside presets yet). Phase C adds an inline filter editor;
          // until then the most useful save is "current sort under the
          // active filter set".
          filters: activePreset?.filters ?? {},
          sortId: effectiveSortId,
          pinned,
        }),
      });
      const data = (await readJsonResponse<{ preset?: OpportunityPreset }>(
        response,
        "Failed to save preset",
      )) as { preset?: OpportunityPreset };
      if (data.preset) {
        setPresets((current) => [...current, data.preset as OpportunityPreset]);
        setActivePresetId(data.preset.id);
      }
      setSaveDialogOpen(false);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not save preset",
        fallbackDescription: "Please try again.",
      });
    } finally {
      setSavingPreset(false);
    }
  };

  const deletePreset = async (preset: OpportunityPreset) => {
    const confirmed = await confirmDelete({
      title: `Delete "${preset.name}"?`,
      description: "This preset will be removed permanently.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/opportunity-presets/${preset.id}`, {
        method: "DELETE",
      });
      await readJsonResponse<unknown>(response, "Failed to delete preset");
      setPresets((current) => current.filter((p) => p.id !== preset.id));
      if (activePresetId === preset.id) setActivePresetId(null);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not delete preset",
        fallbackDescription: "Please try again.",
      });
    }
  };

  const updateJobStatus = async (
    job: Opportunity,
    status: Opportunity["status"],
  ) => {
    if (!status) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/opportunities/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await readJsonResponse<unknown>(response, "Failed to update opportunity");
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id ? { ...item, status } : item,
        ),
      );
    } catch (error) {
      showErrorToast(error, {
        title: "Could not update opportunity",
        fallbackDescription: "Please try again.",
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const applyNow = async (job: Opportunity) => {
    if (job.sourceUrl) {
      window.open(job.sourceUrl, "_blank", "noopener,noreferrer");
    }
    await updateJobStatus(job, "applied");
  };

  if (loading) {
    return <OpportunitiesReviewSkeleton />;
  }

  if (!enabled) {
    return (
      <AppPage>
        <PageContent>
          <PrerequisiteEmptyState
            icon={Settings}
            title={a11yT("reviewQueueDisabled")}
            description="Enable it in Settings to review pending opportunities."
            action={
              <Button asChild>
                <Link href="/settings">Open Settings</Link>
              </Button>
            }
          />
        </PageContent>
      </AppPage>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Link
        href="/opportunities"
        className="fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        aria-label={a11yT("openOpportunities")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="pl-16">
        <PresetBar
          presets={presets}
          activePresetId={activePresetId}
          onApply={applyPreset}
          onClear={clearPreset}
          onSaveCurrent={() => setSaveDialogOpen(true)}
          onDelete={deletePreset}
        />
        <SortDropdown
          value={effectiveSortId}
          onChange={(next) => {
            // Manual sort only takes effect when no preset is active.
            // Picking a sort while a preset is applied clears the preset
            // so the new sort sticks visibly — saves an extra click.
            if (activePresetId) setActivePresetId(null);
            setManualSortId(next);
          }}
        />
      </div>
      <OpportunityReviewQueue
        jobs={visibleJobs}
        updating={updating}
        onStatusChange={updateJobStatus}
        onApplyNow={applyNow}
        payDisplayUnit={payDisplayUnit}
        payDisplayCurrency={payDisplayCurrency}
        currencyRates={currencyRates}
      />
      <SavePresetDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        busy={savingPreset}
        defaultName={activePreset ? `${activePreset.name} (copy)` : undefined}
        onSubmit={savePreset}
      />
      {confirmDialog}
    </div>
  );
}
