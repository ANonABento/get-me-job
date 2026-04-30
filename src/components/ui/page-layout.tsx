import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PageWidth = "full" | "narrow" | "wide";

const pageWidthClasses: Record<PageWidth, string> = {
  full: "",
  narrow: "mx-auto max-w-3xl",
  wide: "mx-auto max-w-6xl",
};

export function getPageWidthClassName(width: PageWidth) {
  return pageWidthClasses[width];
}

interface AppPageProps {
  children: ReactNode;
  className?: string;
}

export function AppPage({ children, className }: AppPageProps) {
  return (
    <div className={cn("min-h-screen bg-background pb-24", className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow: string;
  icon: ElementType;
  width?: PageWidth;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  width = "wide",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("border-b bg-card/70", className)}>
      <div className={cn("px-5 py-6 sm:px-8", getPageWidthClassName(width))}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              {eyebrow}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {actions ? (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

interface PageContentProps {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
}

export function PageContent({
  children,
  width = "wide",
  className,
}: PageContentProps) {
  return (
    <div
      className={cn(
        "px-5 py-6 sm:px-8",
        getPageWidthClassName(width),
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StandardEmptyStateProps {
  icon: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function StandardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: StandardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 p-8 text-center",
        className,
      )}
    >
      <Icon className="mb-4 h-10 w-10 text-muted-foreground" />
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
