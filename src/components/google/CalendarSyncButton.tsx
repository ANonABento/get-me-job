"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useErrorToast } from "@/hooks/use-error-toast";

type SyncType = "all" | "interviews" | "deadlines" | "reminders";

interface SyncResultItem {
  type: "interview" | "deadline" | "reminder";
  title: string;
  success: boolean;
  eventLink?: string;
  error?: string;
}

interface SyncResponse {
  success: boolean;
  synced: number;
  failed: number;
  results: SyncResultItem[];
}

interface CalendarSyncButtonProps {
  onSyncComplete?: (result: SyncResponse) => void;
  compact?: boolean;
}

export function CalendarSyncButton({
  onSyncComplete,
  compact = false,
}: CalendarSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState<SyncType>("all");
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const showErrorToast = useErrorToast();

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const res = await fetch("/api/google/auth");
      const data = await res.json();
      setConnected(data.connected);
    } catch {
      setConnected(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/google/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncType }),
      });

      const data: SyncResponse = await res.json();
      setResult(data);
      onSyncComplete?.(data);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not sync calendar",
        fallbackDescription: "Please check your Google connection and try again.",
      });
      setResult({
        success: false,
        synced: 0,
        failed: 1,
        results: [
          {
            type: "interview",
            title: "Sync failed",
            success: false,
            error: "Network error",
          },
        ],
      });
    } finally {
      setSyncing(false);
    }
  }

  // Not connected - show message
  if (connected === false) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>Connect Google in Settings to sync calendar</span>
      </div>
    );
  }

  // Still loading connection status
  if (connected === null) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <Button
          onClick={handleSync}
          disabled={syncing}
          size="sm"
          className="w-full"
        >
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Sync to Google Calendar
            </>
          )}
        </Button>

        {result && (
          <p className="text-xs text-center">
            {result.success ? (
              <span className="text-success">
                Synced {result.synced} events
              </span>
            ) : (
              <span className="text-warning">
                {result.synced} synced, {result.failed} failed
              </span>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={syncType}
          onValueChange={(v) => setSyncType(v as SyncType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select what to sync" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="interviews">Interviews Only</SelectItem>
            <SelectItem value="deadlines">Deadlines Only</SelectItem>
            <SelectItem value="reminders">Reminders Only</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Sync to Google Calendar
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.success
              ? "bg-success/10 border-success/30 dark:bg-success/10 dark:border-success/30"
              : "bg-warning/10 border-warning/30 dark:bg-warning/10 dark:border-warning/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="h-5 w-5 text-warning" />
            )}
            <span className="font-medium">
              {result.success
                ? `Successfully synced ${result.synced} events`
                : `Synced ${result.synced} events, ${result.failed} failed`}
            </span>
          </div>

          {result.results.length > 0 && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {result.results.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.success ? (
                      <CheckCircle className="h-3 w-3 text-success shrink-0" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.eventLink && (
                    <a
                      href={item.eventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
              {result.results.length > 10 && (
                <p className="text-xs text-muted-foreground pt-1">
                  And {result.results.length - 10} more...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
