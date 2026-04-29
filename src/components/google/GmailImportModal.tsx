"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  Mail,
  Loader2,
  Plus,
  Building,
  Briefcase,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface ParsedJobInfo {
  type:
    | "recruiter_outreach"
    | "interview_invite"
    | "application_received"
    | "rejection"
    | "offer"
    | "unknown";
  company?: string;
  role?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  interviewDate?: string;
  confidence: number;
}

interface ParsedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  labels: string[];
  parsed: ParsedJobInfo;
}

interface GmailImportModalProps {
  onImport: (email: ParsedEmail) => void;
  trigger?: React.ReactNode;
}

const TYPE_LABELS: Record<string, string> = {
  recruiter_outreach: "Recruiter",
  interview_invite: "Interview",
  application_received: "Applied",
  rejection: "Rejection",
  offer: "Offer",
  unknown: "Unknown",
};

const TYPE_COLORS: Record<string, string> = {
  recruiter_outreach: "bg-info/10 text-info",
  interview_invite: "bg-success/10 text-success",
  application_received: "bg-muted text-muted-foreground",
  rejection: "bg-destructive/10 text-destructive",
  offer: "bg-warning/10 text-warning",
  unknown: "bg-muted text-muted-foreground",
};

export function GmailImportModal({ onImport, trigger }: GmailImportModalProps) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const showErrorToast = useErrorToast();

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/google/auth");
      const data = await res.json();
      setConnected(data.connected);
    } catch {
      setConnected(false);
    }
  }, []);

  const scanEmails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/google/gmail/scan?days=30&maxResults=50");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to scan emails");
        return;
      }

      setEmails(data.emails || []);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not scan Gmail",
        fallbackDescription: "Please check your Google connection and try again.",
      });
      setError("Failed to scan emails from Gmail");
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    if (open) {
      checkConnection();
    }
  }, [open, checkConnection]);

  useEffect(() => {
    if (open && connected) {
      scanEmails();
    }
  }, [open, connected, scanEmails]);

  function handleImport(email: ParsedEmail) {
    onImport(email);
    setOpen(false);
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Import from Gmail
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Import Jobs from Gmail
          </DialogTitle>
          <DialogDescription>
            Scan your inbox for job-related emails and import them as job entries
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Not connected */}
          {connected === false && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Connect your Google account in Settings to import emails
              </p>
            </div>
          )}

          {/* Loading connection */}
          {connected === null && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking connection...</p>
            </div>
          )}

          {/* Connected - show content */}
          {connected && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Scanning emails from the last 30 days...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                  <p className="text-destructive">{error}</p>
                  <Button variant="outline" size="sm" onClick={scanEmails}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Mail className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-center">
                    No job-related emails found in the last 30 days
                  </p>
                  <Button variant="outline" size="sm" onClick={scanEmails}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Found {emails.length} potential job emails</span>
                    <Button variant="ghost" size="sm" onClick={scanEmails}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>

                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={TYPE_COLORS[email.parsed.type]}>
                              {TYPE_LABELS[email.parsed.type]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(email.parsed.confidence * 100)}% match
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {formatDate(email.date)}
                            </span>
                          </div>

                          <p className="font-medium truncate">{email.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            From: {email.from}
                          </p>

                          {(email.parsed.company || email.parsed.role) && (
                            <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                              {email.parsed.company && (
                                <span className="flex items-center text-muted-foreground">
                                  <Building className="h-3 w-3 mr-1" />
                                  {email.parsed.company}
                                </span>
                              )}
                              {email.parsed.role && (
                                <span className="flex items-center text-muted-foreground">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {email.parsed.role}
                                </span>
                              )}
                              {email.parsed.interviewDate && (
                                <span className="flex items-center text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Interview detected
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {email.snippet}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleImport(email)}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Import
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
