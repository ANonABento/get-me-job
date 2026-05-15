"use client";

/**
 * Knowledge Bank — umbrella page that hosts both the Components tab
 * (resume/document parsed entries) and the Answers tab (Q&A library).
 *
 * Decision: `/bank` and `/answer-bank` merge here under the editorial v2
 * "Knowledge Bank" surface. The URL `?tab=components|answers` is the
 * source of truth; `/answer-bank` 308-redirects to `?tab=answers`.
 */

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Award,
  Boxes,
  Briefcase,
  Building2,
  Cable,
  ClipboardList,
  Database,
  FileBadge,
  FolderTree,
  GraduationCap,
  Layers,
  Library,
  ListChecks,
  Plus,
  Sparkles,
  Trophy,
  Wrench,
} from "lucide-react";

import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { MonoCap } from "@/components/editorial";
import { BANK_CATEGORIES, type BankCategory } from "@/types";
import { pluralize } from "@/lib/text/pluralize";
import { cn } from "@/lib/utils";

import { BankComponentsTab } from "./components-tab";
import { BankAnswersTab } from "./answers-tab";

type KnowledgeTab = "components" | "answers";

function isKnowledgeTab(value: string | null): value is KnowledgeTab {
  return value === "components" || value === "answers";
}

interface CategoryRailItem {
  id: BankCategory | "all";
  label: string;
  icon: typeof Database;
}

const CATEGORY_RAIL_ITEMS: CategoryRailItem[] = [
  { id: "all", label: "All components", icon: Layers },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skill", label: "Skills", icon: Wrench },
  { id: "project", label: "Projects", icon: FolderTree },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "bullet", label: "Bullets", icon: ListChecks },
  { id: "achievement", label: "Achievements", icon: Award },
  { id: "certification", label: "Certifications", icon: FileBadge },
  { id: "hackathon", label: "Hackathons", icon: Trophy },
];

type SourceFilter = "all" | "manual" | "extension" | "curated";

interface SourceRailItem {
  id: SourceFilter;
  label: string;
  icon: typeof Database;
}

const ANSWER_SOURCE_ITEMS: SourceRailItem[] = [
  { id: "all", label: "All sources", icon: Library },
  { id: "manual", label: "Manual", icon: Sparkles },
  { id: "extension", label: "From extension", icon: Cable },
  { id: "curated", label: "Curated", icon: Building2 },
];

export default function BankPage() {
  return (
    <Suspense fallback={null}>
      <BankPageInner />
    </Suspense>
  );
}

function BankPageInner() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: KnowledgeTab = isKnowledgeTab(tabParam) ? tabParam : "components";

  const [categoryCounts, setCategoryCounts] = useState<
    Partial<Record<BankCategory | "all", number>>
  >({});
  const [activeCategory, setActiveCategory] = useState<BankCategory | "all">(
    "all",
  );
  const [pendingExternalCategory, setPendingExternalCategory] = useState<
    BankCategory | "all" | null
  >(null);

  const [sourceCounts, setSourceCounts] = useState<{
    all: number;
    manual: number;
    extension: number;
    curated: number;
  }>({ all: 0, manual: 0, extension: 0, curated: 0 });
  const [activeSource, setActiveSource] = useState<SourceFilter>("all");
  const [pendingSourceFilter, setPendingSourceFilter] =
    useState<SourceFilter | null>(null);

  const [addAnswerHandler, setAddAnswerHandler] = useState<(() => void) | null>(
    null,
  );

  const handleAddAnswerHandleChange = useCallback((handler: () => void) => {
    // Store the function reference. We wrap in another function so React's
    // setState doesn't think we want to compute next state from prev.
    setAddAnswerHandler(() => handler);
  }, []);

  const setTab = useCallback(
    (next: KnowledgeTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "components") params.delete("tab");
      else params.set("tab", next);
      const query = params.toString();
      router.replace(`/${locale}/bank${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [locale, router, searchParams],
  );

  const componentsCount =
    categoryCounts.all ??
    BANK_CATEGORIES.reduce((sum, cat) => sum + (categoryCounts[cat] ?? 0), 0);

  const description = useMemo(() => {
    if (tab === "answers") {
      return "Reusable answers for application forms, autofill, and recurring interview prompts.";
    }
    const componentsLabel = pluralize(componentsCount, "component");
    return `Your career library in one place. ${componentsLabel} extracted from uploads, plus saved Q&A.`;
  }, [tab, componentsCount]);

  return (
    <AppPage>
      <PageHeader
        icon={Database}
        title="Knowledge Bank"
        description={description}
        actions={
          tab === "answers" && addAnswerHandler ? (
            <Button onClick={() => addAnswerHandler()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Answer
            </Button>
          ) : null
        }
      />

      <PageContent className="space-y-6">
        <KnowledgeTabSwitcher tab={tab} onChange={setTab} />

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside
            className="lg:sticky lg:top-4 lg:self-start"
            aria-label="Knowledge Bank filters"
          >
            {tab === "components" ? (
              <CategoryRail
                items={CATEGORY_RAIL_ITEMS}
                counts={categoryCounts}
                activeId={activeCategory}
                onSelect={(id) => {
                  setPendingExternalCategory(id);
                }}
                emptyHint="Upload a resume to see categories"
              />
            ) : (
              <SourceRail
                items={ANSWER_SOURCE_ITEMS}
                counts={sourceCounts}
                activeId={activeSource}
                onSelect={(id) => {
                  setPendingSourceFilter(id);
                }}
              />
            )}
          </aside>

          <div className="min-w-0">
            {tab === "components" ? (
              <BankComponentsTab
                onCategoryCountsChange={setCategoryCounts}
                onActiveCategoryChange={setActiveCategory}
                externalActiveCategory={pendingExternalCategory}
              />
            ) : (
              <BankAnswersTab
                onSourceCountsChange={setSourceCounts}
                onSourceFilterChange={setActiveSource}
                externalSourceFilter={pendingSourceFilter}
                onAddAnswerHandleChange={handleAddAnswerHandleChange}
              />
            )}
          </div>
        </div>
      </PageContent>
    </AppPage>
  );
}

function KnowledgeTabSwitcher({
  tab,
  onChange,
}: {
  tab: KnowledgeTab;
  onChange: (next: KnowledgeTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Knowledge Bank tabs"
      className="inline-flex items-center gap-1 rounded-md border border-rule bg-paper p-1 shadow-sm"
    >
      <TabButton
        active={tab === "components"}
        onClick={() => onChange("components")}
        icon={Boxes}
        label="Components"
      />
      <TabButton
        active={tab === "answers"}
        onClick={() => onChange("answers")}
        icon={ClipboardList}
        label="Answers"
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Database;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-ink text-bg"
          : "text-ink-2 hover:bg-rule-strong-bg hover:text-ink",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

function CategoryRail({
  items,
  counts,
  activeId,
  onSelect,
  emptyHint,
}: {
  items: CategoryRailItem[];
  counts: Partial<Record<BankCategory | "all", number>>;
  activeId: BankCategory | "all";
  onSelect: (id: BankCategory | "all") => void;
  emptyHint?: string;
}) {
  const totalCount =
    counts.all ??
    BANK_CATEGORIES.reduce((sum, cat) => sum + (counts[cat] ?? 0), 0);

  return (
    <nav className="flex flex-col gap-1.5">
      <MonoCap size="sm" tone="muted" className="px-3 pb-1 pt-1">
        Categories
      </MonoCap>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const count = counts[item.id] ?? 0;
        const disabled = item.id !== "all" && count === 0;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            disabled={disabled}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[13.5px] transition-colors",
              isActive
                ? "border border-rule bg-paper font-semibold text-ink"
                : "border border-transparent text-ink-2 hover:bg-rule-strong-bg hover:text-ink",
              disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
            )}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
            <span className="flex-1 truncate">{item.label}</span>
            <span
              className={cn(
                "font-mono text-[11px]",
                isActive ? "text-brand" : "text-ink-3",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
      {emptyHint && totalCount === 0 ? (
        <p className="px-3 pt-3 text-[12px] leading-5 text-ink-3">
          {emptyHint}
        </p>
      ) : null}
    </nav>
  );
}

function SourceRail({
  items,
  counts,
  activeId,
  onSelect,
}: {
  items: SourceRailItem[];
  counts: { all: number; manual: number; extension: number; curated: number };
  activeId: SourceFilter;
  onSelect: (id: SourceFilter) => void;
}) {
  return (
    <nav className="flex flex-col gap-1.5">
      <MonoCap size="sm" tone="muted" className="px-3 pb-1 pt-1">
        Sources
      </MonoCap>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const count = counts[item.id] ?? 0;
        const disabled = item.id !== "all" && count === 0;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            disabled={disabled}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[13.5px] transition-colors",
              isActive
                ? "border border-rule bg-paper font-semibold text-ink"
                : "border border-transparent text-ink-2 hover:bg-rule-strong-bg hover:text-ink",
              disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
            )}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
            <span className="flex-1 truncate">{item.label}</span>
            <span
              className={cn(
                "font-mono text-[11px]",
                isActive ? "text-brand" : "text-ink-3",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
