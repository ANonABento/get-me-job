"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  GitCompare,
  Minus,
  Plus,
  RefreshCw,
} from "lucide-react";
import { ResumePreview } from "@/components/studio/resume-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  compareBuilderVersionSections,
  findBuilderVersionPair,
  hasBuilderVersionContentChange,
  type BuilderSectionDiff,
} from "@/lib/builder/version-compare";
import type { BuilderVersion } from "@/lib/builder/version-history";
import { formatRelativeTime } from "@/lib/utils";

type ComparePane = "before" | "after";

function diffVariant(type: BuilderSectionDiff["type"]) {
  if (type === "added") return "success" as const;
  if (type === "removed") return "destructive" as const;
  return "warning" as const;
}

function diffIcon(type: BuilderSectionDiff["type"]) {
  if (type === "added") return Plus;
  if (type === "removed") return Minus;
  return RefreshCw;
}

function VersionSummary({
  label,
  version,
}: {
  label: string;
  version: BuilderVersion;
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius)] border-[length:var(--border-width)] bg-card px-3 py-2">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-semibold">{version.name}</p>
      <p className="text-xs text-muted-foreground">
        {formatRelativeTime(version.savedAt)}
      </p>
    </div>
  );
}

function DiffSummary({
  diffs,
  contentChanged,
}: {
  diffs: BuilderSectionDiff[];
  contentChanged: boolean;
}) {
  if (diffs.length === 0 && !contentChanged) {
    return (
      <div className="rounded-[var(--radius)] border-[length:var(--border-width)] bg-card px-4 py-3 text-sm text-muted-foreground">
        No section or document body changes found between these versions.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {contentChanged && (
        <Badge variant="info" className="gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Body changed
        </Badge>
      )}
      {diffs.map((diff) => {
        const Icon = diffIcon(diff.type);
        return (
          <Badge
            key={`${diff.type}-${diff.id}`}
            variant={diffVariant(diff.type)}
            className="gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" />
            {diff.label} {diff.type}
          </Badge>
        );
      })}
    </div>
  );
}

function VersionPreview({
  version,
  label,
  highlight,
}: {
  version: BuilderVersion;
  label: string;
  highlight: "removed" | "added";
}) {
  const highlightClass =
    highlight === "added"
      ? "border-success bg-success/5"
      : "border-destructive bg-destructive/5";

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] bg-background">
      <div
        className={`border-b-[length:var(--border-width)] px-4 py-3 ${highlightClass}`}
      >
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <h2 className="truncate text-base font-semibold">{version.name}</h2>
      </div>
      <div className="min-h-[70vh] flex-1 overflow-hidden">
        <ResumePreview
          templateId={version.state.templateId}
          html={version.state.html}
          content={version.state.content}
          documentMode={version.state.documentMode}
          editable={false}
        />
      </div>
    </section>
  );
}

function StudioCompareContent() {
  const searchParams = useSearchParams();
  const beforeId = searchParams.get("a") ?? "";
  const afterId = searchParams.get("b") ?? "";
  const [before, setBefore] = useState<BuilderVersion | null>(null);
  const [after, setAfter] = useState<BuilderVersion | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mobilePane, setMobilePane] = useState<ComparePane>("before");

  useEffect(() => {
    const pair = findBuilderVersionPair(window.localStorage, beforeId, afterId);
    setBefore(pair.before);
    setAfter(pair.after);
    setLoaded(true);
  }, [afterId, beforeId]);

  const sectionDiffs = useMemo(
    () => (before && after ? compareBuilderVersionSections(before, after) : []),
    [after, before],
  );
  const contentChanged = Boolean(
    before && after && hasBuilderVersionContentChange(before, after),
  );

  if (!loaded) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading comparison...
      </div>
    );
  }

  if (!beforeId || !afterId || !before || !after) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="max-w-md rounded-[var(--radius)] border-[length:var(--border-width)] bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <GitCompare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Comparison unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose two saved studio versions and open this page with both
            version IDs.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/studio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to studio
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-muted/30">
      <header className="border-b-[length:var(--border-width)] bg-background px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
              <Link href="/studio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Studio
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Resume Version Compare</h1>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
            <VersionSummary label="Before" version={before} />
            <VersionSummary label="After" version={after} />
          </div>
        </div>
        <div className="mt-3">
          <DiffSummary diffs={sectionDiffs} contentChanged={contentChanged} />
        </div>
      </header>

      <div className="border-b-[length:var(--border-width)] bg-background p-2 md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {(["before", "after"] as ComparePane[]).map((pane) => (
            <Button
              key={pane}
              type="button"
              size="sm"
              variant={mobilePane === pane ? "default" : "outline"}
              onClick={() => setMobilePane(pane)}
            >
              {pane === "before" ? "Before" : "After"}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 p-3 md:grid md:grid-cols-2 md:gap-3 md:p-4">
        <div
          className={
            mobilePane === "before" ? "block h-full" : "hidden md:block"
          }
        >
          <VersionPreview version={before} label="Before" highlight="removed" />
        </div>
        <div
          className={
            mobilePane === "after" ? "block h-full" : "hidden md:block"
          }
        >
          <VersionPreview version={after} label="After" highlight="added" />
        </div>
      </div>
    </main>
  );
}

export default function StudioComparePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">
          Loading comparison...
        </div>
      }
    >
      <StudioCompareContent />
    </Suspense>
  );
}
