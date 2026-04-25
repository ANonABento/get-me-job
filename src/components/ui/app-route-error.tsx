"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export interface AppRouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function AppRouteError({ error, reset }: AppRouteErrorProps) {
  useEffect(() => {
    console.error("App route render failed:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-10">
      <ErrorState
        title="We couldn't load this page"
        message="Something went wrong while loading this page. Try again to reload it."
        onRetry={reset}
        variant="card"
        className="w-full max-w-xl"
      />
    </div>
  );
}

