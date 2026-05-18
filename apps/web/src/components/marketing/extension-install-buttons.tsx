"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  detectBrowserFromUserAgent,
  getExtensionStoresForBrowser,
  type DetectedBrowser,
} from "@/lib/extension/install";
import { cn } from "@/lib/utils";

interface ExtensionInstallButtonsProps {
  variant: "primary" | "compact";
  onlyDetected?: boolean;
  className?: string;
}

export function ExtensionInstallButtons({
  variant,
  onlyDetected = false,
  className,
}: ExtensionInstallButtonsProps) {
  const [detectedBrowser, setDetectedBrowser] =
    useState<DetectedBrowser>("unknown");

  useEffect(() => {
    setDetectedBrowser(detectBrowserFromUserAgent(navigator.userAgent));
  }, []);

  const stores = useMemo(() => {
    const ordered = getExtensionStoresForBrowser(detectedBrowser);
    return onlyDetected && detectedBrowser !== "unknown"
      ? ordered.slice(0, 1)
      : ordered;
  }, [detectedBrowser, onlyDetected]);
  const [primary, ...secondary] = stores;
  const primaryStore = primary ?? null;
  const isCompact = variant === "compact";

  if (!primaryStore) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isCompact ? "items-start" : "items-center sm:items-start",
        className,
      )}
    >
      <StoreButton
        store={primaryStore}
        prominent={!isCompact}
        compact={isCompact}
      />

      {!onlyDetected && secondary.length > 0 ? (
        <div
          className={cn(
            "flex flex-col gap-2",
            isCompact ? "w-full" : "w-full sm:w-auto",
          )}
        >
          <p className="text-xs font-medium text-muted-foreground">
            Other browsers
          </p>
          <div className="flex flex-wrap gap-2">
            {secondary.map((store) => (
              <StoreButton
                key={store.key}
                store={store}
                prominent={false}
                compact={isCompact}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StoreButton({
  store,
  prominent,
  compact,
}: {
  store: ReturnType<typeof getExtensionStoresForBrowser>[number];
  prominent: boolean;
  compact: boolean;
}) {
  const Icon = store.icon;
  const label = compact ? store.compactLabel : store.ctaLabel;
  const button = (
    <>
      <Icon className={cn("shrink-0", prominent ? "h-5 w-5" : "h-4 w-4")} />
      <span>{label}</span>
      {store.url ? (
        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : null}
    </>
  );

  if (store.disabled || !store.url) {
    return (
      <Button
        type="button"
        disabled
        variant={prominent ? "default" : "outline"}
        size={compact ? "sm" : "lg"}
        className={cn(
          compact ? "min-w-0 px-3" : "w-full sm:w-auto",
          prominent && "disabled:opacity-100 disabled:cursor-default",
        )}
      >
        {button}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant={prominent ? "default" : "outline"}
      size={compact ? "sm" : "lg"}
      className={cn(compact ? "min-w-0 px-3" : "w-full sm:w-auto")}
    >
      <a href={store.url} target="_blank" rel="noopener noreferrer">
        {button}
      </a>
    </Button>
  );
}
