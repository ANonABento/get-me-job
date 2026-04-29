"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useErrorToast } from "@/hooks/use-error-toast";

interface SendViaGmailButtonProps {
  to: string;
  subject: string;
  body: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function SendViaGmailButton({
  to,
  subject,
  body,
  onSuccess,
  disabled = false,
}: SendViaGmailButtonProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function handleSend() {
    if (!to) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/google/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        onSuccess?.();
      } else {
        throw new Error(data.error || "Failed to send");
      }
    } catch (err) {
      showErrorToast(err, {
        title: "Could not send Gmail message",
        fallbackDescription: "Please check your Google connection and try again.",
      });
      setError("Failed to send via Gmail");
    } finally {
      setSending(false);
    }
  }

  if (connected === false) {
    return null;
  }

  if (connected === null) {
    return (
      <Button variant="default" disabled className="flex-1">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Gmail
      </Button>
    );
  }

  if (sent) {
    return (
      <Button variant="default" className="flex-1 bg-success" disabled>
        <CheckCircle className="h-4 w-4 mr-2" />
        Sent
      </Button>
    );
  }

  if (error) {
    return (
      <Button
        variant="destructive"
        onClick={handleSend}
        disabled={sending || disabled}
        className="flex-1"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Retry
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSend}
      disabled={sending || disabled}
      className="flex-1 gradient-bg text-primary-foreground hover:opacity-90"
    >
      {sending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Mail className="h-4 w-4 mr-2" />
      )}
      {sending ? "Sending..." : "Gmail"}
    </Button>
  );
}
