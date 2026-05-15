"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Mail, DollarSign, FileText, MessageSquareReply } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonoCap } from "@/components/editorial";
import {
  PagePanel,
  PagePanelHeader,
  StandardEmptyState,
} from "@/components/ui/page-layout";
import { EmailTemplatesPane } from "./email-templates-pane";
import { SalaryResearchPane } from "./salary-research-pane";

export type ToolkitTabId = "email" | "salary" | "cover-letter" | "recruiter";

const TAB_IDS: readonly ToolkitTabId[] = [
  "email",
  "salary",
  "cover-letter",
  "recruiter",
] as const;

const TAB_LABELS: Record<ToolkitTabId, string> = {
  email: "Email Templates",
  salary: "Salary",
  "cover-letter": "Cover Letter",
  recruiter: "Recruiter Rewriter",
};

const TAB_ICONS: Record<ToolkitTabId, typeof Mail> = {
  email: Mail,
  salary: DollarSign,
  "cover-letter": FileText,
  recruiter: MessageSquareReply,
};

const TAB_SECTION_LABEL: Record<ToolkitTabId, string> = {
  email: "01 · Outreach",
  salary: "02 · Compensation",
  "cover-letter": "03 · Letters",
  recruiter: "04 · Inbox",
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

  const setTab = useCallback(
    (next: ToolkitTabId) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Toolkit" className="border-b border-rule">
        <div className="flex flex-wrap gap-1">
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
                  "relative flex min-h-11 items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {TAB_LABELS[id]}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`toolkit-pane-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`toolkit-tab-${activeTab}`}
        data-pane={activeTab}
        className="space-y-4"
      >
        <MonoCap>{TAB_SECTION_LABEL[activeTab]}</MonoCap>
        {activeTab === "email" && <EmailTemplatesPane />}
        {activeTab === "salary" && <SalaryResearchPane />}
        {activeTab === "cover-letter" && <ComingSoonPane id="cover-letter" />}
        {activeTab === "recruiter" && <ComingSoonPane id="recruiter" />}
      </div>
    </div>
  );
}

function ComingSoonPane({ id }: { id: ToolkitTabId }) {
  const Icon = TAB_ICONS[id];
  const label = TAB_LABELS[id];
  const description =
    id === "cover-letter"
      ? "Cover letter editing already lives in Studio. A shortcut from here is on the way — for now, head to Studio to write or tailor letters."
      : "Drop a recruiter's note in and we'll rewrite your reply in your voice. Wiring this up in the next wave.";

  return (
    <PagePanel>
      <PagePanelHeader title={label} icon={Icon} className="mb-4" />
      <StandardEmptyState
        icon={Icon}
        title="Coming soon"
        description={description}
      />
    </PagePanel>
  );
}

export function ToolkitTabs() {
  return (
    <Suspense fallback={null}>
      <ToolkitTabsInner />
    </Suspense>
  );
}
