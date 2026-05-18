"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CenteredPagePanel } from "@/components/ui/page-layout";
import { Link } from "@/i18n/navigation";
import { isNextAuthConfiguredOnClient } from "@/lib/auth-client";
import { parseDeviceName } from "@/lib/extension/device-name";
import { nowEpoch } from "@/lib/format/time";
import { CheckCircle, Loader2, Chrome, AlertCircle } from "lucide-react";

type ConnectStatus = "loading" | "connecting" | "success" | "error";
type ExtensionTransport = "runtime" | "localstorage";
type ChromeRuntimeGlobal = {
  chrome?: {
    runtime?: {
      lastError?: { message?: string };
      sendMessage?: (
        extensionId: string,
        message: unknown,
        responseCallback: (response: unknown) => void,
      ) => void;
    };
  };
};

const EXTENSION_TOKEN_STORAGE_KEY = "slothing_extension_token";

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForLocalStoragePickup(
  timeoutMs = 10_000,
  intervalMs = 250,
): Promise<boolean> {
  const deadline = nowEpoch() + timeoutMs;
  while (nowEpoch() < deadline) {
    if (!localStorage.getItem(EXTENSION_TOKEN_STORAGE_KEY)) return true;
    await sleep(intervalMs);
  }
  return !localStorage.getItem(EXTENSION_TOKEN_STORAGE_KEY);
}

function runtimeAccepted(response: unknown): boolean {
  return (
    !!response &&
    typeof response === "object" &&
    "success" in response &&
    (response as { success?: unknown }).success === true
  );
}

function messageForStatus(status: number): string {
  if (status === 401) return "Sign in expired. Reload the page to retry.";
  if (status === 403) {
    return "This account isn't allowed to connect the extension.";
  }
  if (status >= 500) {
    return "Slothing servers are having a problem. Please try again in a minute.";
  }
  return "We couldn't connect the extension. Please try again.";
}

function useTokenGenerator() {
  const [status, setStatus] = useState<ConnectStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [canCloseTab, setCanCloseTab] = useState(true);

  function attemptClose() {
    window.close();
    setTimeout(() => {
      if (!document.hidden) setCanCloseTab(false);
    }, 100);
  }

  async function generateToken() {
    setStatus("connecting");
    setError(null);
    setCanCloseTab(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const extensionId = params.get("extensionId");

      // chrome.runtime is only injected on pages that match an extension's
      // externally_connectable manifest entry. Access through globalThis to
      // keep this file typecheckable without @types/chrome in the main app.
      const chromeGlobal = (globalThis as unknown as ChromeRuntimeGlobal)
        .chrome;
      // chrome.runtime.sendMessage to an extension is only available on
      // browsers that honor MV3 externally_connectable (Chromium-family).
      // Firefox extensions can't be reached via runtime messaging from a
      // regular web page, so fall back to the localStorage transport — the
      // extension polls that key on next activation and picks up the token.
      const canUseRuntime = Boolean(
        extensionId && chromeGlobal?.runtime?.sendMessage,
      );
      const transport: ExtensionTransport = canUseRuntime
        ? "runtime"
        : "localstorage";
      const userAgent = navigator.userAgent;

      const response = await fetch("/api/extension/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceInfo: parseDeviceName(userAgent),
          userAgent,
          transport,
        }),
      });

      if (!response.ok) {
        setError(messageForStatus(response.status));
        setStatus("error");
        return;
      }

      const { token, expiresAt } = await response.json();

      const fallbackToLocalStorage = async () => {
        // Fallback for when chrome.runtime.sendMessage is unreachable from this
        // page. The extension polls this key on next activation and deletes it
        // after pickup. Server-minted localStorage tokens use a 5-minute TTL.
        localStorage.setItem(
          EXTENSION_TOKEN_STORAGE_KEY,
          JSON.stringify({
            token,
            expiresAt,
            apiBaseUrl: window.location.origin,
          }),
        );
        if (await waitForLocalStoragePickup()) {
          setStatus("success");
          return;
        }
        setError(
          "The extension did not pick up the connection. Reload this tab or reconnect from the extension.",
        );
        setStatus("error");
      };

      try {
        if (extensionId && chromeGlobal?.runtime?.sendMessage) {
          chromeGlobal.runtime.sendMessage(
            extensionId,
            {
              type: "AUTH_CALLBACK",
              token,
              expiresAt,
              apiBaseUrl: window.location.origin,
            },
            (response: unknown) => {
              if (
                chromeGlobal.runtime?.lastError ||
                !runtimeAccepted(response)
              ) {
                void fallbackToLocalStorage();
              } else {
                setStatus("success");
              }
            },
          );
        } else {
          await fallbackToLocalStorage();
        }
      } catch {
        await fallbackToLocalStorage();
      }
    } catch {
      setError("Couldn't reach Slothing. Check your internet connection.");
      setStatus("error");
    }
  }

  return { status, error, canCloseTab, generateToken, attemptClose };
}

function StatusCard({
  status,
  error,
  canCloseTab,
  onRetry,
  onClose,
}: {
  status: ConnectStatus;
  error: string | null;
  canCloseTab: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  if (status === "loading") {
    return (
      <CenteredPagePanel>
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </CenteredPagePanel>
    );
  }

  return (
    <CenteredPagePanel>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
          <Chrome className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Connect Slothing Extension
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Link your browser extension to your Slothing account.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center space-y-4">
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
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-center font-medium text-success">
              Extension connected successfully.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Return to your browser to use the extension.
            </p>
            {canCloseTab && (
              <Button variant="outline" onClick={onClose}>
                Close tab
              </Button>
            )}
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
      </div>

      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        Need the extension?{" "}
        <Link href="/extension" className="font-medium text-primary underline">
          Install it
        </Link>
      </p>
    </CenteredPagePanel>
  );
}

function ExtensionConnectPageWithAuth() {
  const { status: sessionStatus } = useSession();
  const isLoaded = sessionStatus !== "loading";
  const isSignedIn = sessionStatus === "authenticated";
  const { status, error, canCloseTab, generateToken, attemptClose } =
    useTokenGenerator();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      window.location.href = `/sign-in?callbackUrl=${encodeURIComponent("/extension/connect")}`;
      return;
    }

    generateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <StatusCard
        status="loading"
        error={null}
        canCloseTab={canCloseTab}
        onRetry={generateToken}
        onClose={attemptClose}
      />
    );
  }

  return (
    <StatusCard
      status={status}
      error={error}
      canCloseTab={canCloseTab}
      onRetry={generateToken}
      onClose={attemptClose}
    />
  );
}

function ExtensionConnectPageLocalDev() {
  const { status, error, canCloseTab, generateToken, attemptClose } =
    useTokenGenerator();

  useEffect(() => {
    generateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StatusCard
      status={status}
      error={error}
      canCloseTab={canCloseTab}
      onRetry={generateToken}
      onClose={attemptClose}
    />
  );
}

export default function ExtensionConnectPage() {
  if (!isNextAuthConfiguredOnClient()) {
    return <ExtensionConnectPageLocalDev />;
  }
  return <ExtensionConnectPageWithAuth />;
}
