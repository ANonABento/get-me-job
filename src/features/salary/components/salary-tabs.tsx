import { SALARY_TOOL_TABS } from "@/features/salary/constants";
import type { SalaryToolTab } from "@/features/salary/types";
import { cn } from "@/lib/utils";

interface SalaryTabsProps {
  activeTab: SalaryToolTab;
  onChange: (tab: SalaryToolTab) => void;
}

export function SalaryTabs({ activeTab, onChange }: SalaryTabsProps) {
  return (
    <div className="border-b bg-card/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 py-2">
          {SALARY_TOOL_TABS.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

