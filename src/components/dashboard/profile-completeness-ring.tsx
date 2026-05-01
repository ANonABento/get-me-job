"use client";

import Link from "next/link";
import { useId } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ProfileCompletenessResult } from "@/lib/profile-completeness";

interface ProfileCompletenessRingProps {
  data: ProfileCompletenessResult;
}

const RING_SIZE = 120;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProfileCompletenessRing({
  data,
}: ProfileCompletenessRingProps) {
  const { percentage, sections, nextAction } = data;
  const gradientId = `profile-completeness-ring-${useId().replace(/:/g, "")}`;
  const offset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-start gap-6">
        {/* SVG Ring */}
        <Link
          href={nextAction?.href ?? "/profile"}
          className="shrink-0 group"
          aria-label={`Profile ${percentage}% complete. Click to complete your profile.`}
        >
          <div
            className="relative"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              className="transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                className="text-muted/30"
              />
              {/* Progress circle */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    className="text-success"
                  />
                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    className="text-primary"
                  />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text — overlays the ring */}
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold pointer-events-none">
              {percentage}%
            </span>
          </div>
        </Link>

        {/* Section checklist */}
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Profile Completeness
          </h3>
          <ul className="space-y-1.5">
            {sections.map((section) => (
              <li key={section.key}>
                <Link
                  href={section.href}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  {section.complete ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={
                      section.complete
                        ? "text-muted-foreground line-through"
                        : "font-medium"
                    }
                  >
                    {section.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next action CTA */}
      {nextAction && (
        <Link
          href={nextAction.href}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          Complete your {nextAction.label.toLowerCase()}
        </Link>
      )}
    </div>
  );
}
