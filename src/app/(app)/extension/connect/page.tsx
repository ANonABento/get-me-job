"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Chrome, AlertCircle } from "lucide-react";

function ExtensionConnectPageWithAuth() {
  const { isSignedIn, isLoaded } = useUser();
  const [status, setStatus] = useState<"loading" | "connecting" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Redirect to sign in
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent("/extension/connect")}`;
      return;
    }

    // User is signed in, generate token
    generateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  async function generateToken() {
    setStatus("connecting");
    try {
      const response = await fetch("/api/extension/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceInfo: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const { token, expiresAt } = await response.json();

      // Send token to extension
      // Try extension messaging (if extension provides externally_connectable)
      try {
        // @ts-expect-error - chrome may not exist
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          // Try to send to extension
          // @ts-expect-error - extension ID would be set
          chrome.runtime.sendMessage(
            undefined, // Extension ID would go here
            { type: "AUTH_CALLBACK", token, expiresAt },
            (response: unknown) => {
              if (response) {
                setStatus("success");
              } else {
                // Fallback: show token for manual copy
                showManualConnect(token, expiresAt);
              }
            }
          );
        } else {
          showManualConnect(token, expiresAt);
        }
      } catch {
        showManualConnect(token, expiresAt);
      }

      setStatus("success");

      // Close tab after short delay
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
    }
  }

  function showManualConnect(token: string, expiresAt: string) {
    // Store in localStorage for extension to pick up
    localStorage.setItem("columbus_extension_token", JSON.stringify({ token, expiresAt }));
    setStatus("success");
  }

  if (!isLoaded || status === "loading") {
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
          <CardTitle>Connect Taida Extension</CardTitle>
          <CardDescription>
            Link your browser extension to your Taida account
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
              <Button onClick={generateToken}>Try Again</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExtensionConnectPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Extension auth unavailable</CardTitle>
            <CardDescription>
              Add Clerk environment variables to connect the browser extension in this environment.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <ExtensionConnectPageWithAuth />;
}
