"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useErrorToast } from "@/hooks/use-error-toast";
import { isNextAuthConfiguredOnClient } from "@/lib/auth-client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { GoogleIcon } from "./GoogleIcon";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface ConnectionStatus {
  connected: boolean;
  email?: string;
  name?: string;
  picture?: string;
}

interface GoogleConnectButtonProps {
  onConnectionChange?: (connected: boolean) => void;
  showStatus?: boolean;
}

function GoogleConnectButtonWithSession({
  onConnectionChange,
  showStatus = true,
}: GoogleConnectButtonProps) {
  const a11yT = useA11yTranslations();

  const { status: sessionStatus } = useSession();
  const isSignedIn = sessionStatus === "authenticated";
  const sessionLoading = sessionStatus === "loading";
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showErrorToast = useErrorToast();

  const checkConnection = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/google/auth");
      if (!res.ok) {
        throw new Error("Failed to check connection");
      }
      const data: ConnectionStatus = await res.json();
      setStatus(data);
      onConnectionChange?.(data.connected);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not check Google connection",
        fallbackDescription: "Please try checking the connection again.",
      });
      setError("Failed to check connection");
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, [onConnectionChange, showErrorToast]);

  useEffect(() => {
    if (sessionLoading) return;
    if (!isSignedIn) {
      setError(null);
      setLoading(false);
      setStatus({ connected: false });
      onConnectionChange?.(false);
      return;
    }
    checkConnection();
  }, [checkConnection, sessionLoading, isSignedIn, onConnectionChange]);

  useEffect(() => {
    function handleFocus() {
      if (!isSignedIn) return;
      checkConnection();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkConnection, isSignedIn]);

  function handleConnect() {
    signIn("google", { callbackUrl: window.location.href });
  }

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="outline" onClick={checkConnection}>
        <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
        Retry
      </Button>
    );
  }

  if (status?.connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {status.picture && (
            <Image
              src={status.picture}
              alt={a11yT("googleProfile")}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="flex items-center text-sm font-medium text-success">
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Google Connected
            </span>
            {showStatus && status.email && (
              <span className="text-xs text-muted-foreground">
                {status.email}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleConnect}>
          Manage
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} className="gap-2">
      <GoogleIcon className="h-4 w-4" />
      {isSignedIn ? "Connect Google account" : "Sign in to connect Google"}
    </Button>
  );
}

export function GoogleConnectButton(props: GoogleConnectButtonProps) {
  if (!isNextAuthConfiguredOnClient()) {
    return (
      <div className="space-y-2">
        <Button variant="outline" disabled className="gap-2">
          <GoogleIcon className="h-4 w-4" />
          Google setup required
        </Button>
        <p className="max-w-md text-xs leading-5 text-muted-foreground">
          Add Google OAuth credentials and set NEXT_PUBLIC_NEXTAUTH_ENABLED=true
          to enable Calendar, Gmail, Drive, Docs, Sheets, and Contacts.
        </p>
      </div>
    );
  }

  return <GoogleConnectButtonWithSession {...props} />;
}
