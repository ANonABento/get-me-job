"use client";

import type { ElementType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { AlertCircle, Filter, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_ILLUSTRATION_FORMATS = ["svg", "webp", "png"] as const;

function getIllustrationSources(name?: string): string[] {
  if (!name) return [];

  const cleanName = name
    .replace(/^\/?illustrations\/empty\//, "")
    .replace(/^\/+/, "");
  const extensionMatch = cleanName.match(/\.(svg|webp|png)$/i);
  const basename = extensionMatch
    ? cleanName.slice(0, -extensionMatch[0].length)
    : cleanName;

  if (!/^[a-z0-9][a-z0-9-]*$/.test(basename)) return [];

  if (extensionMatch) {
    return [
      `/illustrations/empty/${basename}.${extensionMatch[1].toLowerCase()}`,
    ];
  }

  return EMPTY_ILLUSTRATION_FORMATS.map(
    (format) => `/illustrations/empty/${basename}.${format}`,
  );
}

/**
 * Renders an illustration from `/public/illustrations/empty/<name>`.
 *
 * If the asset is missing or `name` is omitted, falls back to the provided
 * lucide `icon` rendered inside a primary-tinted disc the same size as the
 * illustration slot. SVG is preferred, with WebP/PNG as clean fallbacks for
 * future generated raster assets.
 */
interface EmptyIllustrationProps {
  /** Filename under /public/illustrations/empty/. Extension optional. */
  name?: string;
  /** Lucide icon used as the fallback. */
  icon?: ElementType;
  /** Decorative by default; only set if the image carries meaning. */
  alt?: string;
  className?: string;
}

export function EmptyIllustration({
  name,
  icon: Icon,
  alt = "",
  className,
}: EmptyIllustrationProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = getIllustrationSources(name);
  const src = sources[sourceIndex];

  useEffect(() => {
    setSourceIndex(0);
  }, [name]);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={src}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setSourceIndex((index) => index + 1)}
        className={cn(
          "h-44 w-44 select-none object-contain sm:h-56 sm:w-56",
          className,
        )}
      />
    );
  }

  if (Icon) {
    return (
      <div
        className={cn(
          "flex h-44 w-44 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-56 sm:w-56",
          className,
        )}
        aria-hidden
      >
        <Icon className="h-16 w-16 sm:h-20 sm:w-20" />
      </div>
    );
  }

  return null;
}

export interface HowItWorksStep {
  /** Short label — "Upload resume", "Connect inbox". */
  label: string;
  /** Optional one-line elaboration shown under the label. */
  description?: string;
  /** Optional icon shown in the numbered disc instead of the index. */
  icon?: ElementType;
}

interface HowItWorksDiagramProps {
  steps: HowItWorksStep[];
  className?: string;
}

export function HowItWorksDiagram({
  steps,
  className,
}: HowItWorksDiagramProps) {
  if (steps.length === 0) return null;
  return (
    <ol
      className={cn(
        "flex flex-col gap-4 text-left sm:flex-row sm:items-start sm:gap-6",
        className,
      )}
    >
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        return (
          <li
            key={`${step.label}-${index}`}
            className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary"
              aria-hidden
            >
              {StepIcon ? <StepIcon className="h-4 w-4" /> : index + 1}
            </span>
            <div className="min-w-0 sm:max-w-[14rem]">
              <p className="font-display text-sm font-semibold text-foreground">
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {step.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Rich onboarding empty state — illustration + headline + value prop +
 * 3-step "how it works" diagram + primary/secondary actions. Use when a
 * user has zero of something AND has never had any (new-account, never
 * connected, never uploaded). Not for filtered-to-zero or error cases.
 */
interface OnboardingEmptyStateProps {
  title: string;
  description?: ReactNode;
  /** Illustration filename under /public/illustrations/empty/. */
  illustrationName?: string;
  /** Lucide icon used when `illustrationName` is missing / fails. */
  icon?: ElementType;
  /** 2-4 numbered steps describing how the feature works. */
  steps?: HowItWorksStep[];
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function OnboardingEmptyState({
  title,
  description,
  illustrationName,
  icon,
  steps,
  primaryAction,
  secondaryAction,
  className,
}: OnboardingEmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-6 rounded-lg border bg-paper p-8 text-center sm:p-12",
        className,
      )}
    >
      <EmptyIllustration name={illustrationName} icon={icon} />
      <div className="max-w-prose space-y-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {steps && steps.length > 0 ? (
        <HowItWorksDiagram steps={steps} className="w-full max-w-2xl" />
      ) : null}
      {primaryAction || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  );
}

export interface ZeroResultFilter {
  label: string;
  /** When provided, the chip renders an `x` and calls this on click. */
  onRemove?: () => void;
}

/**
 * Filter / search returned 0 but data exists. Lists active filters as
 * chips and offers a clear-all escape. Use the lighter
 * `StandardEmptyState` if no filter context is needed.
 */
interface ZeroResultEmptyStateProps {
  title?: string;
  description?: ReactNode;
  /** Active filters surfaced as removable chips. */
  filters?: ZeroResultFilter[];
  /** Primary action — usually a "Clear filters" button. */
  action?: ReactNode;
  className?: string;
}

export function ZeroResultEmptyState({
  title = "No matches",
  description = "Try adjusting your filters or search terms.",
  filters,
  action,
  className,
}: ZeroResultEmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border bg-paper p-8 text-center",
        className,
      )}
    >
      <Filter className="h-8 w-8 text-muted-foreground" aria-hidden />
      <div className="max-w-prose space-y-1">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {filters && filters.length > 0 ? (
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {filters.map((filter, index) => (
            <li key={`${filter.label}-${index}`}>
              {filter.onRemove ? (
                <button
                  type="button"
                  onClick={filter.onRemove}
                  className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                >
                  {filter.label}
                  <X className="h-3 w-3" aria-hidden />
                  <span className="sr-only">Remove {filter.label}</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                  {filter.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {action ? <div className="flex items-center gap-3">{action}</div> : null}
    </section>
  );
}

/**
 * Fetch / mutation failure. Pairs a destructive-tinted disc with an error
 * summary and a retry slot. Surface the underlying error code in `code`
 * (rendered in mono) when it's useful for support.
 */
interface ErrorEmptyStateProps {
  title?: string;
  description?: ReactNode;
  /** Optional error code rendered as a mono caption. */
  code?: string;
  /** Retry / report actions. */
  action?: ReactNode;
  className?: string;
}

export function ErrorEmptyState({
  title = "Something went wrong",
  description = "We hit an unexpected error loading this page. Try again, or get in touch if it sticks around.",
  code,
  action,
  className,
}: ErrorEmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border bg-paper p-8 text-center",
        className,
      )}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" aria-hidden />
      </div>
      <div className="max-w-prose space-y-1">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {code ? (
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {code}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Feature gated behind a prerequisite step (e.g. ATS scanner needs a
 * resume on file). Deep-link to the prerequisite via `action`; offer an
 * escape hatch like "use sample data" via `secondaryAction` when honest.
 */
interface PrerequisiteEmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ElementType;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function PrerequisiteEmptyState({
  title,
  description,
  icon: Icon = Lock,
  action,
  secondaryAction,
  className,
}: PrerequisiteEmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border bg-paper p-8 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="max-w-prose space-y-1">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  );
}
