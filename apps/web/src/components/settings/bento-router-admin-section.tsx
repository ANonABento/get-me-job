"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  BentoRouterAdminPage,
  type BentoTaskAdminModelOption,
  type BentoTaskAdminSummary,
  type BentoTaskPolicyPatch,
  type ProviderConfigSummary,
} from "@anonabento/bento-router/admin";
import { PageSection } from "@/components/ui/page-layout";
import { BrainCircuit } from "lucide-react";

interface BentoRouterAdminState {
  tasks: BentoTaskAdminSummary[];
  models: BentoTaskAdminModelOption[];
  providers: ProviderConfigSummary[];
}

export function SlothingBentoRouterAdminSection() {
  const [state, setState] = useState<BentoRouterAdminState | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const response = await fetch("/api/settings/llm/bentorouter", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("BentoRouter settings are unavailable.");
    }
    const next = (await response.json()) as BentoRouterAdminState;
    setState(next);
    setSelectedTaskId((current) => current ?? next.tasks[0]?.id);
  }

  useEffect(() => {
    void refresh().catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Load failed.");
    });
  }, []);

  const cssVars = useMemo(
    () =>
      ({
        "--bento-router-bg": "hsl(var(--background))",
        "--bento-router-fg": "hsl(var(--foreground))",
        "--bento-router-muted": "hsl(var(--muted-foreground))",
        "--bento-router-border": "hsl(var(--border))",
        "--bento-router-accent": "hsl(var(--primary))",
        "--bento-router-radius": "8px",
      }) as CSSProperties,
    [],
  );

  return (
    <PageSection
      title="BentoRouter provider policies"
      description="Manage provider keys and per-task model policies with BentoRouter."
      icon={BrainCircuit}
      contentClassName="space-y-4"
    >
      {error ? (
        <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          {error}
        </p>
      ) : null}
      {!state && !error ? (
        <p className="text-sm text-muted-foreground">
          Loading BentoRouter policies...
        </p>
      ) : null}
      {state ? (
        <BentoRouterAdminPage
          tasks={state.tasks}
          models={state.models}
          providers={state.providers}
          userId="current"
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onAddProvider={async (input) => {
            const response = await fetch(
              "/api/settings/llm/bentorouter/providers",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
              },
            );
            if (!response.ok) throw new Error("Failed to add provider.");
            await refresh();
          }}
          onRemoveProvider={async (_userId, id) => {
            const response = await fetch(
              "/api/settings/llm/bentorouter/providers",
              {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
              },
            );
            if (!response.ok) throw new Error("Failed to remove provider.");
            await refresh();
          }}
          onValidateProvider={async (input) => {
            const response = await fetch(
              "/api/settings/llm/bentorouter/providers/validate",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
              },
            );
            if (!response.ok) {
              return {
                ok: false,
                error: {
                  code: "validation_request_failed",
                  message: "Provider validation failed.",
                },
              };
            }
            return response.json();
          }}
          onPolicyChange={(taskId, policy) => {
            void updatePolicy(taskId, policy)
              .then(refresh)
              .catch((caught) => {
                setError(
                  caught instanceof Error
                    ? caught.message
                    : "Failed to update policy.",
                );
              });
          }}
          style={cssVars}
        />
      ) : null}
    </PageSection>
  );
}

async function updatePolicy(taskId: string, policy: BentoTaskPolicyPatch) {
  const response = await fetch(
    `/api/settings/llm/bentorouter/policies/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(policy),
    },
  );
  if (!response.ok) throw new Error("Failed to update BentoRouter policy.");
}
