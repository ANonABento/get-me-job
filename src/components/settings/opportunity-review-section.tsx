"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Rows3, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readJsonResponse } from "@/lib/http";
import type { SettingsResponse } from "@/types/api";

export function OpportunityReviewSection() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreference() {
      try {
        const response = await fetch("/api/settings");
        const data = await readJsonResponse<SettingsResponse>(
          response,
          "Failed to load review queue setting",
        );
        if (data.opportunityReview) {
          setEnabled(data.opportunityReview.enabled);
        }
      } catch {
        setMessage("Could not load review queue setting.");
      } finally {
        setLoading(false);
      }
    }

    void fetchPreference();
  }, []);

  const toggleEnabled = async () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityReview: {
            enabled: nextEnabled,
          },
        }),
      });

      await readJsonResponse<unknown>(
        response,
        "Failed to save review queue setting",
      );
      setMessage(
        nextEnabled ? "Review queue enabled." : "Review queue disabled.",
      );
    } catch {
      setEnabled(!nextEnabled);
      setMessage("Could not save review queue setting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rows3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Opportunity Review Queue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review pending opportunities with a swipe-first card stack.
            </p>
            <Link
              href="/opportunities/review"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Open review queue
            </Link>
          </div>
        </div>

        <Button
          type="button"
          variant={enabled ? "default" : "outline"}
          onClick={toggleEnabled}
          disabled={loading || saving}
          aria-pressed={enabled}
          className="w-full shrink-0 sm:w-auto"
        >
          {loading || saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : enabled ? (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          {enabled ? "Enabled" : "Disabled"}
        </Button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
