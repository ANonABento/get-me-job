"use client";

import dynamic from "next/dynamic";
import { Calendar, Cloud, FolderOpen, Mail } from "lucide-react";
import { SkeletonButton } from "@/components/ui/skeleton";

const GoogleConnectButton = dynamic(
  () => import("@/components/google").then((module) => module.GoogleConnectButton),
  { loading: () => <SkeletonButton className="w-48" />, ssr: false }
);

export function GoogleIntegration() {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl gradient-bg text-primary-foreground">
          <Cloud className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Google Integration</h2>
          <p className="text-sm text-muted-foreground">
            Connect your Google account to sync calendars, store documents, and more
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <GoogleConnectButton />

        <div className="pt-2 border-t">
          <h3 className="text-sm font-medium mb-3">Connected features:</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-info" />
              <span>Calendar Sync</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderOpen className="h-4 w-4 text-warning" />
              <span>Drive Backup</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-destructive" />
              <span>Gmail Import</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Connect your Google account to enable these features. Your data stays private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
