"use client";

import { FileUp, PenLine, UserRoundPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileEmptyStateProps {
  onFillManually: () => void;
}

export function ProfileEmptyState({ onFillManually }: ProfileEmptyStateProps) {
  const t = useTranslations("profile.emptyState");

  return (
    <Card data-testid="profile-empty-state">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserRoundPlus className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription className="mx-auto max-w-2xl">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/components">
            <FileUp className="mr-2 h-4 w-4" />
            {t("uploadResume")}
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={onFillManually}>
          <PenLine className="mr-2 h-4 w-4" />
          {t("fillManually")}
        </Button>
      </CardContent>
    </Card>
  );
}
