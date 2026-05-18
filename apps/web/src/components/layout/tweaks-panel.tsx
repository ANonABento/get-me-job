"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bug,
  CalendarClock,
  Camera,
  CheckCircle2,
  Clipboard,
  Database,
  ExternalLink,
  Gauge,
  Loader2,
  RotateCcw,
  Settings,
  Shuffle,
  X,
  type LucideIcon,
} from "lucide-react";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { isSlothingLocalStorageKey, STORAGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ACCENTS,
  BODY_FONTS,
  DENSITIES,
  DISPLAY_FONTS,
  INKS,
  RADII,
  useEditorialPrefs,
  type AccentId,
  type BodyFontId,
  type DensityId,
  type DisplayFontId,
  type InkId,
  type RadiusId,
} from "@/lib/editorial-prefs";
import { useTheme } from "@/components/theme-provider";

const DEV_TOOLS_STORAGE_KEY = "slothing:dev-tools";
const DEV_TOOLS_ENABLED_VALUE = "enabled";
const DEV_API_DELAY_KEY = "slothing:dev:api-delay-ms";
const DEV_API_ERROR_RATE_KEY = "slothing:dev:api-error-rate";
const DEV_FAKE_DATE_KEY = "slothing:dev:fake-date";
const DEV_LAST_IMPORT_KEY = "slothing:dev:last-import";
const DEV_REFRESH_DELAY_MS = 650;

type SeedPreset = "empty" | "opportunities" | "components" | "full";

type DevToolStatus =
  | { kind: "idle" }
  | { kind: "busy"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function TweaksPanel() {
  const { prefs, setPref } = useEditorialPrefs();
  const { isDark, setIsDark } = useTheme();
  const { confirm, dialog } = useConfirmDialog();
  const [open, setOpen] = useState(false);
  const [devToolsEnabled, setDevToolsEnabled] = useState(false);
  const [devToolStatus, setDevToolStatus] = useState<DevToolStatus>({
    kind: "idle",
  });
  const [apiDelayMs, setApiDelayMs] = useState(0);
  const [apiErrorRate, setApiErrorRate] = useState(0);
  const [fakeDate, setFakeDate] = useState("");
  const originalFetchRef = useRef<typeof window.fetch | null>(null);
  const originalDateRef = useRef<DateConstructor | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDevelopment) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const queryValue = params.get("devTools");
      if (queryValue === "1" || queryValue === "true") {
        window.localStorage.setItem(
          DEV_TOOLS_STORAGE_KEY,
          DEV_TOOLS_ENABLED_VALUE,
        );
        setDevToolsEnabled(true);
        return;
      }
      if (queryValue === "0" || queryValue === "false") {
        window.localStorage.removeItem(DEV_TOOLS_STORAGE_KEY);
        setDevToolsEnabled(false);
        return;
      }

      setDevToolsEnabled(
        window.localStorage.getItem(DEV_TOOLS_STORAGE_KEY) ===
          DEV_TOOLS_ENABLED_VALUE,
      );
      setApiDelayMs(readNumberStorage(DEV_API_DELAY_KEY));
      setApiErrorRate(readNumberStorage(DEV_API_ERROR_RATE_KEY));
      setFakeDate(window.localStorage.getItem(DEV_FAKE_DATE_KEY) ?? "");
    } catch {
      setDevToolsEnabled(false);
    }
  }, [isDevelopment]);

  useEffect(() => {
    if (!isDevelopment || !devToolsEnabled) return;
    if (apiDelayMs <= 0 && apiErrorRate <= 0) return;

    originalFetchRef.current ??= window.fetch.bind(window);
    const baseFetch = originalFetchRef.current;
    window.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : input.toString();
      const shouldAffect =
        isSameOriginApiUrl(url) && !url.includes("/api/dev/");
      if (shouldAffect && apiDelayMs > 0) {
        await sleep(apiDelayMs);
      }
      if (shouldAffect && apiErrorRate > 0 && Math.random() < apiErrorRate) {
        return new Response(
          JSON.stringify({ error: "Dev tools injected API failure." }),
          {
            status: 503,
            headers: { "content-type": "application/json" },
          },
        );
      }
      return baseFetch(input, init);
    };

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
        originalFetchRef.current = null;
      }
    };
  }, [apiDelayMs, apiErrorRate, devToolsEnabled, isDevelopment]);

  useEffect(() => {
    if (!isDevelopment || !devToolsEnabled || !fakeDate) return;
    const fakeTime = new Date(`${fakeDate}T12:00:00`).getTime();
    if (Number.isNaN(fakeTime)) return;

    originalDateRef.current ??= window.Date;
    const RealDate = originalDateRef.current;
    const MockDate = function MockDate(this: Date, ...args: unknown[]) {
      if (this instanceof MockDate) {
        return args.length === 0
          ? new RealDate(fakeTime)
          : new RealDate(...(args as ConstructorParameters<DateConstructor>));
      }
      return new RealDate(fakeTime).toString();
    } as unknown as DateConstructor;
    MockDate.now = () => fakeTime;
    MockDate.parse = RealDate.parse;
    MockDate.UTC = RealDate.UTC;
    Object.defineProperty(MockDate, "prototype", {
      value: RealDate.prototype,
    });
    Object.setPrototypeOf(MockDate, RealDate);
    window.Date = MockDate;

    return () => {
      if (originalDateRef.current) {
        window.Date = originalDateRef.current;
        originalDateRef.current = null;
      }
    };
  }, [devToolsEnabled, fakeDate, isDevelopment]);

  async function handleResetBrowserState() {
    const confirmed = await confirm({
      title: "Reset browser state?",
      description:
        "Clears Slothing-owned localStorage keys in this browser, including onboarding, editor history, layout tweaks, and dismissed UI.",
      confirmLabel: "Reset browser state",
    });
    if (!confirmed) return;

    try {
      const length = window.localStorage.length ?? 0;
      const keys: string[] = [];
      for (let i = 0; i < length; i += 1) {
        const key = window.localStorage.key(i);
        if (typeof key === "string" && isSlothingLocalStorageKey(key)) {
          keys.push(key);
        }
      }
      keys.forEach((key) => window.localStorage.removeItem(key));
      window.localStorage.setItem(
        DEV_TOOLS_STORAGE_KEY,
        DEV_TOOLS_ENABLED_VALUE,
      );
      setDevToolStatus({
        kind: "success",
        message: `Cleared ${keys.length} browser key${keys.length === 1 ? "" : "s"}. Refreshing...`,
      });
      refreshCurrentPage();
    } catch (error) {
      setDevToolStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not access browser storage.",
      });
    }
  }

  async function handleResetAppData() {
    const confirmed = await confirm({
      title: "Reset local dev app data?",
      description:
        "Deletes opportunities, documents, profile components, ATS scans, analytics, drafts, reminders, and related local dev data for the current user. This cannot be undone.",
      confirmLabel: "Reset app data",
    });
    if (!confirmed) return;

    setDevToolStatus({ kind: "busy", message: "Resetting local dev data..." });
    try {
      const response = await fetch("/api/dev/clean-slate", {
        method: "DELETE",
        headers: {
          "x-slothing-dev-tools": DEV_TOOLS_ENABLED_VALUE,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Reset failed.",
        );
      }
      const rowsAffected =
        typeof data.rowsAffected === "number" ? data.rowsAffected : 0;
      setDevToolStatus({
        kind: "success",
        message: `Reset complete. Removed ${rowsAffected} database row${rowsAffected === 1 ? "" : "s"}. Refreshing...`,
      });
      refreshCurrentPage();
    } catch (error) {
      setDevToolStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not reset local dev data.",
      });
    }
  }

  async function handleSeedPreset(preset: SeedPreset) {
    const confirmed = await confirm({
      title:
        preset === "empty" ? "Load empty state?" : `Load ${preset} dev preset?`,
      description:
        preset === "empty"
          ? "Deletes current-user local dev data so you can test empty states."
          : "Deletes current-user local dev data, then creates a deterministic fixture for this preset.",
      confirmLabel: preset === "empty" ? "Load empty state" : "Reset and seed",
    });
    if (!confirmed) return;

    setDevToolStatus({ kind: "busy", message: "Loading dev preset..." });
    try {
      const response = await fetch("/api/dev/seed", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-slothing-dev-tools": DEV_TOOLS_ENABLED_VALUE,
        },
        body: JSON.stringify({ preset }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Seed failed.",
        );
      }
      const seeded = data.seeded as Partial<Record<string, number>> | undefined;
      const totalSeeded = seeded
        ? Object.values(seeded).reduce<number>(
            (sum, value) => sum + (typeof value === "number" ? value : 0),
            0,
          )
        : 0;
      setDevToolStatus({
        kind: "success",
        message:
          preset === "empty"
            ? "Empty state loaded. Refreshing..."
            : `Seeded ${totalSeeded} fixture item${totalSeeded === 1 ? "" : "s"}. Refreshing...`,
      });
      refreshCurrentPage();
    } catch (error) {
      setDevToolStatus({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Could not load dev preset.",
      });
    }
  }

  function handleSetApiDelay(value: string) {
    const nextDelay = Number(value);
    setApiDelayMs(nextDelay);
    writeDevStorage(DEV_API_DELAY_KEY, nextDelay > 0 ? String(nextDelay) : "");
  }

  function handleSetApiErrorRate(value: string) {
    const nextRate = Number(value);
    setApiErrorRate(nextRate);
    writeDevStorage(
      DEV_API_ERROR_RATE_KEY,
      nextRate > 0 ? String(nextRate) : "",
    );
  }

  function handleSetFakeDate(value: string) {
    setFakeDate(value);
    writeDevStorage(DEV_FAKE_DATE_KEY, value);
  }

  function handleClearDevSimulation() {
    setApiDelayMs(0);
    setApiErrorRate(0);
    setFakeDate("");
    writeDevStorage(DEV_API_DELAY_KEY, "");
    writeDevStorage(DEV_API_ERROR_RATE_KEY, "");
    writeDevStorage(DEV_FAKE_DATE_KEY, "");
    setDevToolStatus({
      kind: "success",
      message: "Cleared API and clock simulation. Refreshing...",
    });
    refreshCurrentPage();
  }

  function handleEnableDevTools() {
    try {
      window.localStorage.setItem(
        DEV_TOOLS_STORAGE_KEY,
        DEV_TOOLS_ENABLED_VALUE,
      );
    } catch {
      // Ignore blocked storage; local state still enables this session.
    }
    setDevToolsEnabled(true);
    setDevToolStatus({
      kind: "success",
      message: "Dev tools enabled.",
    });
  }

  function handleDisableDevTools() {
    writeDevStorage(DEV_TOOLS_STORAGE_KEY, "");
    setDevToolsEnabled(false);
    setDevToolStatus({ kind: "idle" });
  }

  function handleSkipOnboarding() {
    try {
      window.localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
      setDevToolStatus({
        kind: "success",
        message: "Onboarding marked complete. Refreshing...",
      });
      refreshCurrentPage();
    } catch {
      setDevToolStatus({
        kind: "error",
        message: "Could not write onboarding state.",
      });
    }
  }

  async function handleCopyEnableCommand() {
    const command = `localStorage.setItem("${DEV_TOOLS_STORAGE_KEY}", "${DEV_TOOLS_ENABLED_VALUE}"); location.reload();`;
    try {
      await navigator.clipboard.writeText(command);
      setDevToolStatus({
        kind: "success",
        message: "Copied the enable command.",
      });
    } catch {
      setDevToolStatus({
        kind: "error",
        message: command,
      });
    }
  }

  async function handleCopyVisualAuditCommand() {
    const command =
      "pnpm --filter @slothing/web exec playwright test e2e/visual-audit.spec.ts --project=chromium";
    try {
      await navigator.clipboard.writeText(command);
      setDevToolStatus({
        kind: "success",
        message: "Copied the visual audit command.",
      });
    } catch {
      setDevToolStatus({ kind: "error", message: command });
    }
  }

  function handleOpenAuditRoutes() {
    const routes = [
      "/en/dashboard",
      "/en/opportunities",
      "/en/components",
      "/en/ats",
      "/en/toolkit",
      "/en/analytics",
    ];
    routes.forEach((route, index) => {
      window.setTimeout(
        () => window.open(route, "_blank", "noopener"),
        index * 80,
      );
    });
  }

  async function handleOpenLastImport() {
    try {
      const raw = window.localStorage.getItem(DEV_LAST_IMPORT_KEY);
      if (!raw) {
        setDevToolStatus({
          kind: "error",
          message: "No import has been recorded in this browser yet.",
        });
        return;
      }
      const parsed = JSON.parse(raw) as {
        filename?: string;
        documentId?: string;
        entryCount?: number;
      };
      await navigator.clipboard.writeText(raw);
      window.open("/en/components", "_blank", "noopener");
      setDevToolStatus({
        kind: "success",
        message: `Copied last import (${parsed.entryCount ?? 0} entries from ${parsed.filename ?? "unknown file"}).`,
      });
    } catch {
      setDevToolStatus({
        kind: "error",
        message: "Could not read the last import record.",
      });
    }
  }

  async function copyDebugState() {
    const payload = {
      devToolsEnabled,
      apiDelayMs,
      apiErrorRate,
      fakeDate: fakeDate || null,
      path: window.location.pathname,
      search: window.location.search,
      lastImport: safeJsonParse(
        window.localStorage.getItem(DEV_LAST_IMPORT_KEY),
      ),
    };
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setDevToolStatus({
        kind: "success",
        message: "Copied debug state.",
      });
    } catch {
      setDevToolStatus({ kind: "error", message: text });
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        target instanceof Element &&
        target.closest('[role="dialog"]') &&
        !panelRef.current?.contains(target)
      ) {
        return;
      }
      if (
        panelRef.current?.contains(target) ||
        fabRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      {!open && (
        <button
          ref={fabRef}
          type="button"
          aria-label="Open editorial tweaks"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[89] grid h-11 w-11 place-items-center shadow-lg transition-transform hover:scale-105"
          style={{
            backgroundColor: "var(--ink)",
            color: "var(--bg)",
            borderRadius: "var(--r-pill)",
            boxShadow: "0 10px 30px var(--paper-shadow-strong)",
          }}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Editorial tweaks"
          className="fixed bottom-5 right-5 z-[90] flex max-h-[calc(100dvh-2.5rem)] w-[340px] flex-col"
          style={{
            backgroundColor: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-lg)",
            boxShadow: "0 24px 60px var(--paper-shadow-strong)",
            color: "var(--ink)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--brand)" }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-[10px] uppercase"
                style={{
                  letterSpacing: "0.16em",
                  color: "var(--ink-2)",
                }}
              >
                Tweaks
              </span>
            </div>
            <button
              type="button"
              aria-label="Close tweaks"
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center transition-colors"
              style={{ color: "var(--ink-3)" }}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
            <Section label="Theme">
              <ChipRow
                value={isDark ? "dark" : "light"}
                onChange={(value) => setIsDark(value === "dark")}
                options={[
                  { id: "light", label: "Light" },
                  { id: "dark", label: "Dark" },
                ]}
              />
            </Section>

            <Section label="Accent">
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    title={accent.label}
                    aria-label={`Accent: ${accent.label}`}
                    onClick={() => setPref("accent", accent.id as AccentId)}
                    className="h-7 w-7 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: accent.color,
                      borderRadius: "var(--r-pill)",
                      border:
                        prefs.accent === accent.id
                          ? "2px solid var(--ink)"
                          : "1px solid var(--rule)",
                      boxShadow:
                        prefs.accent === accent.id
                          ? "0 0 0 2px var(--paper)"
                          : "none",
                    }}
                  />
                ))}
              </div>
            </Section>

            <Section label="Ink">
              <ChipRow
                value={prefs.ink}
                onChange={(value) => setPref("ink", value as InkId)}
                options={INKS.map((ink) => ({
                  id: ink.id,
                  label: ink.label,
                }))}
              />
            </Section>

            <Section label="Display font">
              <ChipRow
                value={prefs.display}
                onChange={(value) => setPref("display", value as DisplayFontId)}
                options={DISPLAY_FONTS.map((font) => ({
                  id: font.id,
                  label: font.label,
                }))}
              />
            </Section>

            <Section label="Body font">
              <FontChipRow
                value={prefs.body}
                onChange={(value) => setPref("body", value as BodyFontId)}
                options={BODY_FONTS.map((font) => ({
                  id: font.id,
                  label: font.label,
                  fontFamily: font.previewFamily,
                }))}
              />
            </Section>

            <Section label="Corners">
              <ChipRow
                value={prefs.radius}
                onChange={(value) => setPref("radius", value as RadiusId)}
                options={RADII.map((radius) => ({
                  id: radius.id,
                  label: radius.label,
                }))}
              />
            </Section>

            <Section label="Density">
              <ChipRow
                value={prefs.density}
                onChange={(value) => setPref("density", value as DensityId)}
                options={DENSITIES.map((density) => ({
                  id: density.id,
                  label: density.label,
                }))}
              />
            </Section>

            {isDevelopment && !devToolsEnabled ? (
              <Section label="Dev tools">
                <DevToolButton
                  icon={Bug}
                  label="Enable dev tools"
                  description="Show seed presets, reset actions, API simulation, and audit helpers."
                  onClick={handleEnableDevTools}
                />
              </Section>
            ) : null}

            {isDevelopment && devToolsEnabled ? (
              <Section label="Dev tools">
                <div className="grid gap-2">
                  <DevToolGroup label="Presets">
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          ["empty", "Empty"],
                          ["opportunities", "Jobs"],
                          ["components", "Components"],
                          ["full", "Full"],
                        ] satisfies Array<[SeedPreset, string]>
                      ).map(([preset, label]) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => void handleSeedPreset(preset)}
                          disabled={devToolStatus.kind === "busy"}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                          style={{ borderColor: "var(--rule)" }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </DevToolGroup>
                  <DevToolButton
                    icon={RotateCcw}
                    label="Reset browser state"
                    description="Clear local UI, onboarding, and editor state."
                    onClick={() => void handleResetBrowserState()}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolButton
                    icon={Database}
                    label="Reset app data"
                    description="Delete current-user local dev rows."
                    onClick={() => void handleResetAppData()}
                    disabled={devToolStatus.kind === "busy"}
                    destructive
                  />
                  <DevToolButton
                    icon={CheckCircle2}
                    label="Skip onboarding"
                    description="Mark onboarding complete for faster reloads."
                    onClick={handleSkipOnboarding}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolGroup label="API simulation">
                    <label className="grid gap-1 text-xs text-muted-foreground">
                      Delay
                      <select
                        value={apiDelayMs}
                        onChange={(event) =>
                          handleSetApiDelay(event.currentTarget.value)
                        }
                        className="h-8 rounded-md border bg-background px-2 text-xs text-foreground"
                      >
                        <option value={0}>None</option>
                        <option value={250}>250 ms</option>
                        <option value={750}>750 ms</option>
                        <option value={1500}>1.5 s</option>
                        <option value={3000}>3 s</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs text-muted-foreground">
                      Failure rate
                      <select
                        value={apiErrorRate}
                        onChange={(event) =>
                          handleSetApiErrorRate(event.currentTarget.value)
                        }
                        className="h-8 rounded-md border bg-background px-2 text-xs text-foreground"
                      >
                        <option value={0}>None</option>
                        <option value={0.1}>10%</option>
                        <option value={0.25}>25%</option>
                        <option value={0.5}>50%</option>
                        <option value={1}>100%</option>
                      </select>
                    </label>
                  </DevToolGroup>
                  <DevToolGroup label="Clock">
                    <label className="grid gap-1 text-xs text-muted-foreground">
                      Browser date
                      <input
                        type="date"
                        value={fakeDate}
                        onChange={(event) =>
                          handleSetFakeDate(event.currentTarget.value)
                        }
                        className="h-8 rounded-md border bg-background px-2 text-xs text-foreground"
                      />
                    </label>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      Affects browser-side time only. Server routes still use
                      real local dev time.
                    </p>
                  </DevToolGroup>
                  <DevToolButton
                    icon={Gauge}
                    label="Clear simulations"
                    description="Disable fake clock, API delay, and API failures."
                    onClick={handleClearDevSimulation}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolButton
                    icon={Shuffle}
                    label="Last import"
                    description="Copy last import metadata and open Components."
                    onClick={() => void handleOpenLastImport()}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolButton
                    icon={ExternalLink}
                    label="Open audit routes"
                    description="Open core pages in separate tabs."
                    onClick={handleOpenAuditRoutes}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolButton
                    icon={Camera}
                    label="Copy visual audit"
                    description="Copy the Playwright visual audit command."
                    onClick={() => void handleCopyVisualAuditCommand()}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolButton
                    icon={Clipboard}
                    label="Copy enable command"
                    description="Keep the console snippet handy."
                    onClick={() => void handleCopyEnableCommand()}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolButton
                    icon={Bug}
                    label="Copy debug state"
                    description="Copy current dev tool flags as JSON."
                    onClick={() => void copyDebugState()}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  <DevToolButton
                    icon={X}
                    label="Hide dev tools"
                    description="Keep Tweaks visible but hide the dev-only controls."
                    onClick={handleDisableDevTools}
                    disabled={devToolStatus.kind === "busy"}
                  />
                  {devToolStatus.kind !== "idle" ? (
                    <p
                      className={cn(
                        "rounded-md border px-2.5 py-2 text-xs leading-relaxed",
                        devToolStatus.kind === "error"
                          ? "border-destructive/40 text-destructive"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {devToolStatus.kind === "busy" ? (
                        <Loader2
                          className="mr-1.5 inline h-3.5 w-3.5 animate-spin"
                          aria-hidden
                        />
                      ) : null}
                      {devToolStatus.message}
                    </p>
                  ) : null}
                </div>
              </Section>
            ) : null}
          </div>
        </div>
      )}
      {dialog}
    </>
  );
}

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

function Section({ label, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="font-mono text-[10px] uppercase"
        style={{
          letterSpacing: "0.14em",
          color: "var(--ink-3)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function DevToolGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-md border p-2.5"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

interface DevToolButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

function DevToolButton({
  icon: Icon,
  label,
  description,
  onClick,
  disabled,
  destructive,
}: DevToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        destructive
          ? "border-destructive/30 hover:bg-destructive/5"
          : "hover:bg-muted/40",
      )}
      style={{
        borderColor: destructive ? undefined : "var(--rule)",
      }}
    >
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          destructive ? "text-destructive" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <span className="min-w-0">
        <span
          className={cn(
            "block text-xs font-medium",
            destructive ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function readNumberStorage(key: string): number {
  const raw = window.localStorage.getItem(key);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

function writeDevStorage(key: string, value: string) {
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore blocked storage in development helpers.
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function refreshCurrentPage() {
  window.setTimeout(() => {
    window.location.reload();
  }, DEV_REFRESH_DELAY_MS);
}

function isSameOriginApiUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.origin === window.location.origin &&
      parsed.pathname.startsWith("/api/")
    );
  } catch {
    return url.startsWith("/api/");
  }
}

function safeJsonParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

interface ChipRowProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}

function ChipRow({ value, onChange, options }: ChipRowProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            )}
            style={{
              backgroundColor: active ? "var(--ink)" : "var(--bg)",
              color: active ? "var(--bg)" : "var(--ink-2)",
              border: active ? "1px solid var(--ink)" : "1px solid var(--rule)",
              borderRadius: "var(--r-pill)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface FontChipRowProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string; fontFamily: string }[];
}

/**
 * Mirror of `ChipRow` but each chip renders its label set in the font
 * it represents. Powers the Body-font picker so the preview lives
 * inside the chip itself instead of needing a separate sample row.
 */
function FontChipRow({ value, onChange, options }: FontChipRowProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={cn(
              "px-2.5 py-1 text-[12px] font-medium transition-colors",
            )}
            style={{
              backgroundColor: active ? "var(--ink)" : "var(--bg)",
              color: active ? "var(--bg)" : "var(--ink-2)",
              border: active ? "1px solid var(--ink)" : "1px solid var(--rule)",
              borderRadius: "var(--r-pill)",
              fontFamily: option.fontFamily,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
