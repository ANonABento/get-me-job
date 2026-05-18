"use client";

import {
  Bell,
  Briefcase,
  CalendarClock,
  FileDown,
  FileText,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { OnboardingEmptyState } from "@/components/ui/empty-states";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface OpportunitiesEmptyHeroProps {
  onAdd: () => void;
  onImport: () => void;
}

export function OpportunitiesEmptyHero({
  onAdd,
  onImport,
}: OpportunitiesEmptyHeroProps) {
  const a11yT = useA11yTranslations();
  const t = useTranslations("opportunities");

  return (
    <OnboardingEmptyState
      icon={Briefcase}
      illustrationName="opportunities-zero"
      title={a11yT("trackYourFirstOpportunity")}
      description="Save a role to start tracking applications, deadlines, and tailored documents."
      steps={[
        {
          icon: Briefcase,
          label: "Add a role",
          description: "Save the posting, company, deadline, and source.",
        },
        {
          icon: FileText,
          label: "Tailor docs",
          description: "Connect components and drafts to the opportunity.",
        },
        {
          icon: CalendarClock,
          label: "Track follow-up",
          description: "Keep status, reminders, and next steps visible.",
        },
      ]}
      primaryAction={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="gradient" onClick={onImport}>
            <FileDown className="mr-2 h-4 w-4" />
            {t("importJob")}
          </Button>
          <Button variant="secondary" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addOpportunity")}
          </Button>
        </div>
      }
      secondaryAction={
        <p className="flex max-w-md items-center justify-center gap-2 text-xs text-muted-foreground">
          <Bell className="h-4 w-4 shrink-0" aria-hidden />
          Review queue captures can land here first, then move into your board.
        </p>
      }
    />
  );
}
