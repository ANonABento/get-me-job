import { CheckCircle, XCircle } from "lucide-react";
import type { SettingsStatusResult } from "@/features/settings/types";

interface SettingsStatusBannerProps {
  result: SettingsStatusResult;
}

export function SettingsStatusBanner({ result }: SettingsStatusBannerProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl ${
        result.success
          ? "bg-success/10 text-success border border-success/20"
          : "bg-destructive/10 text-destructive border border-destructive/20"
      }`}
    >
      {result.success ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <span className="font-medium">{result.message}</span>
    </div>
  );
}

