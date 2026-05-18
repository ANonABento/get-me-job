"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EditorialPanel,
  EditorialPanelBody,
  EditorialPanelHeader,
} from "@/components/editorial";
import { pluralize } from "@/lib/text/pluralize";
import { isSlothingLocalStorageKey } from "@/lib/constants";

/**
 * Number of Slothing-owned local-storage keys that were cleared on the
 * last successful reset. `null` means the action has not been run yet
 * in this session.
 */
type ResetResult =
  | { kind: "idle" }
  | { kind: "done"; cleared: number }
  | { kind: "error"; message: string };

type AccountDeletionResult =
  | { kind: "idle" }
  | { kind: "done"; deletedRows: number }
  | { kind: "error"; message: string };

/**
 * Danger Zone — currently scopes to *local* destructive actions that
 * don't require a backend mutation:
 *
 * - "Reset local preferences" wipes every Slothing-owned localStorage
 *   namespace (see `LOCAL_STORAGE_KEY_PATTERNS` in
 *   `lib/constants/storage.ts`). That covers the canonical `taida:*`
 *   prefix plus the legacy variants we accumulated before
 *   consolidating: `taida-*`, `slothing:*`, `slothing-prefs`,
 *   `get_me_job_*`, and the bare `theme` / `theme-dark` keys. The DB
 *   is left untouched.
 *
 * Adding heavier actions (delete all data, delete account) requires a
 * backend route + Pattern A — leave a clear TODO + tests when wiring
 * them in.
 */
export function DangerZoneSection() {
  const { confirm, dialog } = useConfirmDialog();
  const [busy, setBusy] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [result, setResult] = useState<ResetResult>({ kind: "idle" });
  const [accountResult, setAccountResult] = useState<AccountDeletionResult>({
    kind: "idle",
  });

  async function handleResetLocal() {
    const confirmed = await confirm({
      title: "Reset local preferences?",
      description:
        "Clears onboarding state, builder version history, theme tweaks, and dashboard dismissals stored in this browser. Your account, opportunities, and documents on the server are unaffected.",
      confirmLabel: "Reset local data",
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      // Collect first, then remove. Iterating + removing in the same
      // pass shifts indices on real Storage implementations.
      const length = window.localStorage.length ?? 0;
      const toRemove: string[] = [];
      for (let i = 0; i < length; i++) {
        const key = window.localStorage.key(i);
        if (typeof key === "string" && isSlothingLocalStorageKey(key)) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((key) => {
        window.localStorage.removeItem(key);
      });
      setResult({ kind: "done", cleared: toRemove.length });
    } catch (error) {
      setResult({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not access browser storage.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = await confirm({
      title: "Delete account data?",
      description:
        'This permanently deletes your Slothing account data, opportunities, documents, generated resumes, settings, Google tokens, sessions, and extension tokens. Type "DELETE" in the next prompt is handled by the server request.',
      confirmLabel: "Delete account data",
    });
    if (!confirmed) return;

    setDeletingAccount(true);
    setAccountResult({ kind: "idle" });
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        deleted?: { totalDeletedRows?: number };
      } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Could not delete account data.");
      }
      setAccountResult({
        kind: "done",
        deletedRows: body?.deleted?.totalDeletedRows ?? 0,
      });
    } catch (error) {
      setAccountResult({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not delete account data.",
      });
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <>
      <EditorialPanel className="border-destructive/40">
        <EditorialPanelHeader
          title="Danger zone"
          eyebrow="Irreversible"
          icon={AlertTriangle}
        />
        <EditorialPanelBody className="space-y-4">
          <p className="text-sm text-ink-2">
            These actions cannot be undone. Each one prompts for explicit
            confirmation before running.
          </p>

          <div className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                Reset local preferences
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-3">
                Clears onboarding state, builder version history, theme tweaks,
                and dashboard dismissals stored in this browser. Your account,
                opportunities, and documents on the server are unaffected.
              </p>
              {result.kind === "done" ? (
                <p className="mt-2 text-xs text-ink-2">
                  Cleared {pluralize(result.cleared, "local key")}. Reload the
                  page to see defaults restored.
                </p>
              ) : null}
              {result.kind === "error" ? (
                <p className="mt-2 text-xs text-destructive">
                  {result.message}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void handleResetLocal()}
              disabled={busy}
              className="shrink-0"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              )}
              Reset local data
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                Delete account data
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-3">
                Permanently removes your server-side Slothing data, including
                opportunities, documents, settings, integrations, sessions, and
                extension tokens.
              </p>
              {accountResult.kind === "done" ? (
                <p className="mt-2 text-xs text-ink-2">
                  Deleted {pluralize(accountResult.deletedRows, "database row")}
                  . Sign out and reload before using Slothing again.
                </p>
              ) : null}
              {accountResult.kind === "error" ? (
                <p className="mt-2 text-xs text-destructive">
                  {accountResult.message}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void handleDeleteAccount()}
              disabled={deletingAccount}
              className="shrink-0"
            >
              {deletingAccount ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              )}
              Delete account data
            </Button>
          </div>
        </EditorialPanelBody>
      </EditorialPanel>
      {dialog}
    </>
  );
}
