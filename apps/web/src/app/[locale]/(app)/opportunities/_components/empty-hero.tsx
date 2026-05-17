"use client";

import { Briefcase, FileDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { StandardEmptyState } from "@/components/ui/page-layout";
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
    <StandardEmptyState
      icon={Briefcase}
      title={a11yT("trackYourFirstOpportunity")}
      description="Save a role to start tracking applications, deadlines, and tailored documents."
      action={
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
    />
  );
}
