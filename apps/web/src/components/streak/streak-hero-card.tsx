"use client";

import { Flame, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { pluralize } from "@/lib/text/pluralize";
import { cn } from "@/lib/utils";
import type { StreakState } from "@/lib/streak/types";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface StreakHeroCardProps {
  streak: StreakState | null;
}

/**
 * Editorial paper-card treatment of the daily-rhythm / best-streak data.
 * Paper bg, rule border, mono-caps eyebrow, display-font number — no more
 * primary-tinted hero panel.
 */
export function StreakHeroCard({ streak }: StreakHeroCardProps) {
  const t = useTranslations("streak");
  const a11yT = useA11yTranslations();

  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const weekDays = streak?.weekDays ?? [];

  return (
    <section
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r-lg)",
        padding: "18px 20px",
      }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 flex-shrink-0 place-items-center"
              style={{
                backgroundColor: "var(--brand-soft)",
                color: "var(--brand-dark)",
                borderRadius: "var(--r-sm)",
              }}
              aria-hidden="true"
            >
              <Flame className="h-4 w-4" />
            </span>
            <span
              className="font-mono text-[10px] uppercase"
              style={{
                letterSpacing: "0.16em",
                color: "var(--ink-3)",
              }}
            >
              {t("badgeLabel")}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span
              style={{
                fontFamily: "var(--display)",
                fontSize: "36px",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
              }}
            >
              {currentStreak}
            </span>
            <span className="text-[13.5px]" style={{ color: "var(--ink-3)" }}>
              {pluralize(currentStreak, "day")}
            </span>
          </div>

          <p
            className="mt-2.5 text-[13.5px] leading-snug"
            style={{ color: "var(--ink-2)" }}
          >
            {currentStreak > 0 ? t("activeMessage") : t("startMessage")}
          </p>
        </div>

        <div
          className="flex flex-shrink-0 flex-col gap-2.5 sm:w-[240px]"
          style={{
            backgroundColor: "var(--bg)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-md)",
            padding: "12px 14px",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-mono text-[10px] uppercase"
              style={{
                letterSpacing: "0.16em",
                color: "var(--ink-3)",
              }}
            >
              {t("bestStreak")}
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
              style={{ color: "var(--ink)" }}
            >
              <Trophy
                className="h-3.5 w-3.5"
                style={{ color: "var(--brand)" }}
                aria-hidden="true"
              />
              {pluralize(longestStreak, "day")}
            </span>
          </div>
          <div
            className="grid grid-cols-7 gap-1.5"
            aria-label={a11yT("weeklyActivity")}
          >
            {weekDays.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={cn("h-2.5")}
                style={{
                  borderRadius: "var(--r-pill)",
                  backgroundColor: day.active
                    ? "var(--brand)"
                    : "var(--rule-strong-bg)",
                  boxShadow: day.today ? "0 0 0 3px var(--brand-soft)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
