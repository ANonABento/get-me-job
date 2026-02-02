"use client";

import { AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "default" | "inline" | "card";
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't complete your request. Please try again.",
  onRetry,
  onDismiss,
  variant = "default",
  className = "",
}: ErrorStateProps) {
  if (variant === "inline") {
    return (
      <div
        className={`flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 ${className}`}
      >
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">{title}</p>
          {message && (
            <p className="text-xs text-destructive/80 mt-0.5">{message}</p>
          )}
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`rounded-2xl border border-destructive/50 bg-destructive/5 p-6 ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">{title}</h3>
            {message && (
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            )}
            {(onRetry || onDismiss) && (
              <div className="flex gap-2 mt-4">
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                {onDismiss && (
                  <Button variant="ghost" size="sm" onClick={onDismiss}>
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant - centered full-width
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-destructive">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          {message}
        </p>
      )}
      {(onRetry || onDismiss) && (
        <div className="flex justify-center gap-3 mt-6">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// API Error type for consistent error handling
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

// Helper to extract error message from various error types
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
    if ("error" in error && typeof (error as { error: unknown }).error === "string") {
      return (error as { error: string }).error;
    }
  }
  return "An unexpected error occurred";
}

// Error boundary wrapper component
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  return (
    <ErrorState
      title="Application Error"
      message={error.message || "Something went wrong"}
      onRetry={resetErrorBoundary}
      variant="card"
    />
  );
}
