"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Chrome, AlertCircle } from "lucide-react";

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

type ConnectStatus = "loading" | "connecting" | "success" | "error";

function useTokenGenerator() {
  const [status, setStatus] = useState<ConnectStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  async function generateToken() {
    setStatus("connecting");
    try {
      const response = await fetch("/api/extension/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceInfo: navigator.userAgent }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const { token, expiresAt } = await response.json();

      const params = new URLSearchParams(window.location.search);
      const extensionId = params.get("extensionId");

      // chrome.runtime is only injected on pages that match an extension's
      // externally_connectable manifest entry. Access through globalThis to
      // keep this file typecheckable without @types/chrome in the main app.
      const chromeGlobal = (
        globalThis as unknown as {
          chrome?: {
            runtime?: {
              sendMessage?: (
                extensionId: string,
                message: unknown,
                responseCallback: (response: unknown) => void,
              ) => void;
            };
          };
        }
      ).chrome;

      const fallbackToLocalStorage = () => {
        localStorage.setItem(
          "columbus_extension_token",
          JSON.stringify({ token, expiresAt }),
        );
        setStatus("success");
      };

      try {
        if (extensionId && chromeGlobal?.runtime?.sendMessage) {
          chromeGlobal.runtime.sendMessage(
            extensionId,
            { type: "AUTH_CALLBACK", token, expiresAt },
            (response: unknown) => {
              if (!response) {
                fallbackToLocalStorage();
              } else {
                setStatus("success");
              }
            },
          );
        } else {
          fallbackToLocalStorage();
        }
      } catch {
        fallbackToLocalStorage();
      }

      setTimeout(() => window.close(), 2000);
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
    }
  }

  return { status, error, generateToken };
}

function StatusCard({
  status,
  error,
  onRetry,
}: {
  status: ConnectStatus;
  error: string | null;
  onRetry: () => void;
}) {
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Chrome className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Connect Slothing Extension</CardTitle>
          <CardDescription>
            Link your browser extension to your Slothing account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "connecting" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Connecting your extension...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center font-medium text-green-600">
                Extension connected successfully!
              </p>
              <p className="text-center text-sm text-muted-foreground">
                You can now close this tab and use the extension.
              </p>
              <Button variant="outline" onClick={() => window.close()}>
                Close Tab
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center font-medium text-destructive">
                Connection failed
              </p>
              <p className="text-center text-sm text-muted-foreground">
                {error || "An unexpected error occurred"}
              </p>
              <Button onClick={onRetry}>Try Again</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExtensionConnectPageWithAuth() {
  const { isSignedIn, isLoaded } = useUser();
  const { status, error, generateToken } = useTokenGenerator();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent("/extension/connect")}`;
      return;
    }

    generateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <StatusCard status="loading" error={null} onRetry={generateToken} />;
  }

  return <StatusCard status={status} error={error} onRetry={generateToken} />;
}

function ExtensionConnectPageLocalDev() {
  const { status, error, generateToken } = useTokenGenerator();

  useEffect(() => {
    generateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <StatusCard status={status} error={error} onRetry={generateToken} />;
}

export default function ExtensionConnectPage() {
  if (!isClerkConfigured) {
    return <ExtensionConnectPageLocalDev />;
  }
  return <ExtensionConnectPageWithAuth />;
}
