import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AutoSaveStatusState = "saved" | "saving" | "error";

interface AutoSaveStatusProps {
  status: AutoSaveStatusState;
  onRetry?: () => void;
  className?: string;
}

export function AutoSaveStatus({
  status,
  onRetry,
  className,
}: AutoSaveStatusProps) {
  const isSaving = status === "saving";
  const isError = status === "error";
  const label = isError
    ? "Save failed"
    : isSaving
      ? "Saving..."
      : "All changes saved";

  return (
    <div
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius)] border px-3 py-2 text-sm font-medium",
        isError
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-success/30 bg-success/10 text-success",
        isSaving && "border-primary/30 bg-primary/10 text-primary",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {isError ? (
        <AlertCircle className="h-4 w-4" />
      ) : isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      <span>{label}</span>
      {isError && onRetry ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-1 h-7 px-2 text-destructive hover:text-destructive"
          onClick={onRetry}
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
