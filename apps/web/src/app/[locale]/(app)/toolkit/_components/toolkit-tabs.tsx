"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Mail, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PagePanel } from "@/components/ui/page-layout";
import { EmailTemplatesPane } from "./email-templates-pane";
import { SalaryResearchPane } from "./salary-research-pane";

export type ToolkitTabId = "email" | "salary" | "cover-letter";

const TAB_IDS: readonly ToolkitTabId[] = [
  "email",
  "salary",
  "cover-letter",
] as const;

const TAB_LABELS: Record<ToolkitTabId, string> = {
  email: "Email Templates",
  salary: "Salary",
  "cover-letter": "Cover Letter",
};

const TAB_ICONS: Record<ToolkitTabId, typeof Mail> = {
  email: Mail,
  salary: DollarSign,
  "cover-letter": FileText,
};

function normalizeTab(value: string | null | undefined): ToolkitTabId {
  if (!value) return "email";
  const lowered = value.toLowerCase();
  if (TAB_IDS.includes(lowered as ToolkitTabId)) {
    return lowered as ToolkitTabId;
  }
  return "email";
}

function ToolkitTabsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(
    () => normalizeTab(searchParams?.get("tab")),
    [searchParams],
  );

  useEffect(() => {
    if (activeTab === "cover-letter") {
      router.replace("/studio?mode=cover-letter", { scroll: false });
    }
  }, [activeTab, router]);

  const setTab = useCallback(
    (next: ToolkitTabId) => {
      if (next === "cover-letter") {
        router.push("/studio?mode=cover-letter");
        return;
      }

      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="space-y-4">
      <PagePanel className="!p-2">
        <div
          role="tablist"
          aria-label="Toolkit"
          className="flex flex-wrap gap-1"
        >
          {TAB_IDS.map((id) => {
            const Icon = TAB_ICONS[id];
            const isActive = id === activeTab;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`toolkit-pane-${id}`}
                id={`toolkit-tab-${id}`}
                data-tab={id}
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex min-h-10 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {TAB_LABELS[id]}
              </button>
            );
          })}
        </div>
      </PagePanel>

      <div
        id={`toolkit-pane-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`toolkit-tab-${activeTab}`}
        data-pane={activeTab}
        className="min-w-0"
      >
        {activeTab === "email" && <EmailTemplatesPane />}
        {activeTab === "salary" && <SalaryResearchPane />}
      </div>
    </div>
  );
}

export function ToolkitTabs() {
  return (
    <Suspense fallback={null}>
      <ToolkitTabsInner />
    </Suspense>
  );
}
