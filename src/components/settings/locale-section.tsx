"use client";

import { Globe2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPreferredLocale,
  writePreferredLocale,
} from "@/components/format/time-ago";
import { SUPPORTED_LOCALES, normalizeLocale } from "@/lib/format/time";

interface SettingsResponse {
  locale?: string | null;
}

export function LocaleSection() {
  const [locale, setLocale] = useState("en-US");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLocale() {
      try {
        const response = await fetch("/api/settings");
        const data = (await response.json()) as SettingsResponse;
        const nextLocale = normalizeLocale(data.locale ?? getPreferredLocale());
        if (!active) return;
        setLocale(nextLocale);
        writePreferredLocale(nextLocale);
      } catch {
        if (!active) return;
        setLocale(getPreferredLocale());
      }
    }

    void loadLocale();
    return () => {
      active = false;
    };
  }, []);

  async function handleLocaleChange(nextLocale: string) {
    const normalized = normalizeLocale(nextLocale);
    setLocale(normalized);
    writePreferredLocale(normalized);
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: normalized }),
      });

      if (!response.ok) {
        throw new Error("Failed to save locale");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Locale</h2>
            <p className="text-sm text-muted-foreground">
              Format dates and numbers for your region.
            </p>
          </div>
        </div>
        {saving && (
          <Loader2
            className="mt-1 h-4 w-4 animate-spin text-muted-foreground"
            aria-label="Saving locale"
          />
        )}
      </div>

      <Select value={locale} onValueChange={(value) => void handleLocaleChange(value)}>
        <SelectTrigger aria-label="Locale">
          <SelectValue placeholder="Select locale" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LOCALES.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </section>
  );
}
