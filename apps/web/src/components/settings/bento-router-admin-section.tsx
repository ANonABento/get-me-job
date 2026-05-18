"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Route,
  Save,
  Server,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSection } from "@/components/ui/page-layout";
import { cn } from "@/lib/utils";

type ProviderType = "openai" | "anthropic" | "openrouter" | "openai-compatible";

interface BentoRouterAdminState {
  tasks: SlothingTaskAdminSummary[];
  models: SlothingModelOption[];
  providers: ProviderConfigSummary[];
}

interface SlothingTaskAdminSummary {
  id: string;
  appId: string;
  name: string;
  category?: string;
  description?: string;
  effectivePolicy?: SlothingTaskPolicy;
  defaultPolicy?: SlothingTaskPolicy;
}

interface SlothingTaskPolicy {
  primaryModel?: string;
  fallbacks?: string[];
  guardrails?: {
    maxRequestCostUsd?: number;
    timeoutMs?: number;
    maxRetries?: number;
    maxInputTokens?: number;
    maxOutputTokens?: number;
  };
}

type BentoTaskPolicyPatch = Partial<
  Pick<SlothingTaskPolicy, "primaryModel" | "fallbacks" | "guardrails">
>;

interface SlothingModelOption {
  id: string;
  displayName?: string;
  provider?: string;
  qualityTier?: string;
  maxContextTokens?: number;
  caps?: Record<string, boolean>;
}

interface ProviderConfigSummary {
  id: string;
  type: ProviderType;
  displayName: string;
  defaultModel?: string;
  baseUrl?: string;
  createdAt?: string;
}

interface ProviderFormState {
  type: ProviderType;
  displayName: string;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

interface ProviderNotice {
  tone: "success" | "warning";
  message: string;
}

const providerTypes: Array<{ value: ProviderType; label: string }> = [
  { value: "openrouter", label: "OpenRouter" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "openai-compatible", label: "OpenAI-compatible" },
];

const emptyProviderForm: ProviderFormState = {
  type: "openrouter",
  displayName: "",
  apiKey: "",
  baseUrl: "",
  defaultModel: "",
};

const fieldClassName =
  "h-11 w-full rounded-md border-[length:var(--border-width)] border-input bg-background px-3 py-2 text-sm [letter-spacing:var(--letter-spacing)] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function SlothingBentoRouterAdminSection() {
  const [state, setState] = useState<BentoRouterAdminState | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [draftProvider, setDraftProvider] = useState("");
  const [draftModelId, setDraftModelId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [providerForm, setProviderForm] =
    useState<ProviderFormState>(emptyProviderForm);
  const [providerBusy, setProviderBusy] = useState<
    "add" | "validate" | "remove" | null
  >(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [providerNotice, setProviderNotice] = useState<ProviderNotice | null>(
    null,
  );

  async function refresh() {
    const response = await fetch("/api/settings/llm/bentorouter", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("BentoRouter settings are unavailable.");
    }
    const next = (await response.json()) as BentoRouterAdminState;
    setState(next);
    setSelectedTaskId((current) =>
      current && next.tasks.some((task) => task.id === current)
        ? current
        : next.tasks[0]?.id,
    );
  }

  useEffect(() => {
    void refresh().catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Load failed.");
    });
  }, []);

  const modelsByProvider = useMemo(() => {
    const grouped = new Map<string, SlothingModelOption[]>();
    for (const model of state?.models ?? []) {
      const provider = getModelProvider(model);
      const current = grouped.get(provider) ?? [];
      current.push(model);
      grouped.set(provider, current);
    }
    return grouped;
  }, [state?.models]);

  const providerOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const provider of state?.providers ?? []) ids.add(provider.type);
    for (const provider of modelsByProvider.keys()) ids.add(provider);
    return [...ids].sort((left, right) =>
      providerLabel(left).localeCompare(providerLabel(right)),
    );
  }, [modelsByProvider, state?.providers]);

  const selectedTask = useMemo(
    () => state?.tasks.find((task) => task.id === selectedTaskId),
    [selectedTaskId, state?.tasks],
  );

  const selectedPolicy = selectedTask ? getTaskPolicy(selectedTask) : undefined;
  const selectedModel = state?.models.find(
    (model) => model.id === selectedPolicy?.primaryModel,
  );
  const selectedProvider = selectedPolicy?.primaryModel
    ? getModelProviderFromId(selectedPolicy.primaryModel, selectedModel)
    : "";
  const modelsForDraftProvider = modelsByProvider.get(draftProvider) ?? [];
  const hasUnsavedPolicy =
    Boolean(selectedTask) &&
    (draftModelId !== (selectedPolicy?.primaryModel ?? "") ||
      draftProvider !== selectedProvider);

  useEffect(() => {
    if (!selectedTask) return;
    const policy = getTaskPolicy(selectedTask);
    const model = state?.models.find(
      (option) => option.id === policy.primaryModel,
    );
    setDraftProvider(
      policy.primaryModel
        ? getModelProviderFromId(policy.primaryModel, model)
        : (providerOptions[0] ?? ""),
    );
    setDraftModelId(policy.primaryModel ?? "");
  }, [providerOptions, selectedTask, state?.models]);

  async function addProvider() {
    setError(null);
    setProviderNotice(null);
    setProviderBusy("add");
    try {
      const response = await fetch("/api/settings/llm/bentorouter/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerFormPayload(providerForm)),
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Failed to add provider."),
        );
      }
      setProviderForm(emptyProviderForm);
      setProviderNotice({
        tone: "success",
        message: "Provider key saved for BentoRouter.",
      });
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to add provider.",
      );
    } finally {
      setProviderBusy(null);
    }
  }

  async function validateProvider() {
    setError(null);
    setProviderNotice(null);
    setProviderBusy("validate");
    try {
      const response = await fetch(
        "/api/settings/llm/bentorouter/providers/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: providerForm.type,
            apiKey: providerForm.apiKey,
            baseUrl: optionalString(providerForm.baseUrl),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Provider validation failed."),
        );
      }
      const result = (await response.json()) as {
        ok?: boolean;
        error?: { message?: string };
      };
      setProviderNotice(
        result.ok
          ? { tone: "success", message: "Provider credentials validated." }
          : {
              tone: "warning",
              message: result.error?.message ?? "Provider validation failed.",
            },
      );
    } catch (caught) {
      setProviderNotice({
        tone: "warning",
        message:
          caught instanceof Error
            ? caught.message
            : "Provider validation failed.",
      });
    } finally {
      setProviderBusy(null);
    }
  }

  async function removeProvider(id: string) {
    setError(null);
    setProviderBusy("remove");
    try {
      const response = await fetch("/api/settings/llm/bentorouter/providers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Failed to remove provider."),
        );
      }
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to remove provider.",
      );
    } finally {
      setProviderBusy(null);
    }
  }

  async function savePolicy() {
    if (!selectedTask || !draftModelId) return;
    setError(null);
    setSavingTaskId(selectedTask.id);
    try {
      await updatePolicy(selectedTask.id, { primaryModel: draftModelId });
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to update policy.",
      );
    } finally {
      setSavingTaskId(null);
    }
  }

  return (
    <PageSection
      title="BentoRouter provider policies"
      description="Manage provider keys and per-task model routing."
      icon={BrainCircuit}
      contentClassName="space-y-6"
    >
      {error ? (
        <StatusMessage
          tone="warning"
          message={error}
          icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
        />
      ) : null}
      {!state && !error ? (
        <p className="text-sm text-muted-foreground">
          Loading BentoRouter policies...
        </p>
      ) : null}
      {state ? (
        <>
          <section
            className="space-y-4"
            aria-labelledby="bentorouter-provider-heading"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3
                  id="bentorouter-provider-heading"
                  className="font-display text-lg font-semibold tracking-tight text-foreground"
                >
                  Providers
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Store keys once, then route each Slothing AI task to the right
                  provider and model.
                </p>
              </div>
              <Badge variant={state.providers.length ? "success" : "warning"}>
                {state.providers.length
                  ? `${state.providers.length} configured`
                  : "No provider keys"}
              </Badge>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="rounded-md border bg-background p-4">
                <div className="mb-4 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Add provider key
                  </h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Provider" htmlFor="bentorouter-provider-type">
                    <select
                      id="bentorouter-provider-type"
                      className={fieldClassName}
                      value={providerForm.type}
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          type: event.target.value as ProviderType,
                        }))
                      }
                    >
                      {providerTypes.map((provider) => (
                        <option key={provider.value} value={provider.value}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Display name"
                    htmlFor="bentorouter-display-name"
                  >
                    <Input
                      id="bentorouter-display-name"
                      value={providerForm.displayName}
                      placeholder="OpenRouter production"
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          displayName: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="API key" htmlFor="bentorouter-api-key">
                    <Input
                      id="bentorouter-api-key"
                      type="password"
                      value={providerForm.apiKey}
                      placeholder="sk-..."
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          apiKey: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label="Base URL"
                    htmlFor="bentorouter-base-url"
                    optional
                  >
                    <Input
                      id="bentorouter-base-url"
                      value={providerForm.baseUrl}
                      placeholder="https://api.openai.com/v1"
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          baseUrl: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label="Default model"
                    htmlFor="bentorouter-default-model"
                    optional
                    className="sm:col-span-2"
                  >
                    <Input
                      id="bentorouter-default-model"
                      value={providerForm.defaultModel}
                      placeholder="openrouter/anthropic/claude-haiku-4.5"
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          defaultModel: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                {providerNotice ? (
                  <StatusMessage
                    tone={providerNotice.tone}
                    message={providerNotice.message}
                    className="mt-4"
                    icon={
                      providerNotice.tone === "success" ? (
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                      ) : (
                        <AlertTriangle className="h-4 w-4" aria-hidden />
                      )
                    }
                  />
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void validateProvider()}
                    disabled={!providerForm.apiKey || providerBusy !== null}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                    {providerBusy === "validate" ? "Validating..." : "Validate"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void addProvider()}
                    disabled={
                      !providerForm.displayName ||
                      !providerForm.apiKey ||
                      providerBusy !== null
                    }
                  >
                    <KeyRound className="mr-2 h-4 w-4" aria-hidden />
                    {providerBusy === "add" ? "Saving..." : "Save provider"}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border bg-background p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Configured provider keys
                  </h4>
                </div>
                {state.providers.length ? (
                  <div className="divide-y">
                    {state.providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-foreground">
                              {provider.displayName}
                            </p>
                            <Badge variant="outline">
                              {providerLabel(provider.type)}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {provider.defaultModel
                              ? `Default: ${provider.defaultModel}`
                              : provider.baseUrl || provider.id}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void removeProvider(provider.id)}
                          disabled={providerBusy !== null}
                          aria-label={`Remove ${provider.displayName}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed p-4 text-sm leading-6 text-muted-foreground">
                    Add a provider key before running BentoRouter-backed tasks
                    in production.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            className="space-y-4"
            aria-labelledby="bentorouter-task-heading"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3
                  id="bentorouter-task-heading"
                  className="font-display text-lg font-semibold tracking-tight text-foreground"
                >
                  Task routing
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Pick the provider first, then choose one of its registered
                  models for the selected task.
                </p>
              </div>
              <Badge variant="secondary">{state.tasks.length} tasks</Badge>
            </div>

            <div className="grid min-h-[480px] overflow-hidden rounded-md border bg-background lg:grid-cols-[minmax(240px,0.85fr)_minmax(0,1.4fr)]">
              <div className="border-b lg:border-b-0 lg:border-r">
                <div className="max-h-[520px] overflow-auto p-2">
                  {state.tasks.map((task) => {
                    const policy = getTaskPolicy(task);
                    const taskModel = state.models.find(
                      (model) => model.id === policy.primaryModel,
                    );
                    const provider = policy.primaryModel
                      ? getModelProviderFromId(policy.primaryModel, taskModel)
                      : "";
                    return (
                      <button
                        key={task.id}
                        type="button"
                        className={cn(
                          "mb-1 block w-full rounded-md px-3 py-3 text-left transition-colors",
                          task.id === selectedTaskId
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted",
                        )}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              {task.name}
                            </span>
                            <span
                              className={cn(
                                "mt-1 block line-clamp-2 text-xs leading-5",
                                task.id === selectedTaskId
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              {task.description ?? "No task description set."}
                            </span>
                          </span>
                          {task.category ? (
                            <span
                              className={cn(
                                "shrink-0 rounded-full border px-2 py-0.5 text-[11px]",
                                task.id === selectedTaskId
                                  ? "border-primary-foreground/30"
                                  : "border-border text-muted-foreground",
                              )}
                            >
                              {task.category}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "mt-2 block truncate text-xs",
                            task.id === selectedTaskId
                              ? "text-primary-foreground/75"
                              : "text-muted-foreground",
                          )}
                        >
                          {provider ? providerLabel(provider) : "No provider"} /{" "}
                          {policy.primaryModel
                            ? modelShortName(policy.primaryModel, provider)
                            : "No model"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {selectedTask ? (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Route className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-display text-xl font-semibold tracking-tight text-foreground">
                            {selectedTask.name}
                          </h4>
                          {selectedTask.category ? (
                            <Badge variant="outline">
                              {selectedTask.category}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                          {selectedTask.description ??
                            "No task description set."}
                        </p>
                      </div>
                      {hasUnsavedPolicy ? (
                        <Badge variant="warning">Unsaved</Badge>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Task provider"
                        htmlFor="bentorouter-task-provider"
                      >
                        <select
                          id="bentorouter-task-provider"
                          aria-label="Task provider"
                          className={fieldClassName}
                          value={draftProvider}
                          onChange={(event) => {
                            const nextProvider = event.target.value;
                            const nextModels =
                              modelsByProvider.get(nextProvider) ?? [];
                            setDraftProvider(nextProvider);
                            setDraftModelId(nextModels[0]?.id ?? "");
                          }}
                        >
                          {providerOptions.map((provider) => (
                            <option key={provider} value={provider}>
                              {providerLabel(provider)}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field
                        label="Task model"
                        htmlFor="bentorouter-task-model"
                      >
                        <select
                          id="bentorouter-task-model"
                          aria-label="Task model"
                          className={fieldClassName}
                          value={draftModelId}
                          onChange={(event) =>
                            setDraftModelId(event.target.value)
                          }
                          disabled={!modelsForDraftProvider.length}
                        >
                          {modelsForDraftProvider.length ? (
                            modelsForDraftProvider.map((model) => (
                              <option key={model.id} value={model.id}>
                                {model.displayName ?? model.id}
                              </option>
                            ))
                          ) : (
                            <option value="">No registered models</option>
                          )}
                        </select>
                      </Field>
                    </div>

                    <ModelDetails
                      model={state.models.find(
                        (model) => model.id === draftModelId,
                      )}
                      modelId={draftModelId}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => void savePolicy()}
                        disabled={
                          !selectedTask ||
                          !draftModelId ||
                          !hasUnsavedPolicy ||
                          savingTaskId !== null
                        }
                      >
                        <Save className="mr-2 h-4 w-4" aria-hidden />
                        {savingTaskId === selectedTask.id
                          ? "Saving..."
                          : "Save policy"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setDraftProvider(selectedProvider);
                          setDraftModelId(selectedPolicy?.primaryModel ?? "");
                        }}
                        disabled={!hasUnsavedPolicy || savingTaskId !== null}
                      >
                        Reset
                      </Button>
                    </div>

                    <PolicyDetails policy={selectedPolicy} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a task to edit its routing policy.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </PageSection>
  );
}

function Field({
  label,
  htmlFor,
  children,
  optional,
  className,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"
      >
        {label}
        {optional ? (
          <span className="font-normal normal-case text-muted-foreground/70">
            Optional
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

function StatusMessage({
  tone,
  message,
  icon,
  className,
}: {
  tone: "success" | "warning";
  message: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border p-3 text-sm leading-6",
        tone === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-warning/30 bg-warning/10 text-warning",
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{message}</span>
    </p>
  );
}

function ModelDetails({
  model,
  modelId,
}: {
  model?: SlothingModelOption;
  modelId: string;
}) {
  if (!modelId) {
    return (
      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Select a provider with registered models before saving this task policy.
      </p>
    );
  }

  return (
    <dl className="grid gap-3 rounded-md border bg-muted/20 p-4 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-xs font-semibold uppercase text-muted-foreground">
          Provider
        </dt>
        <dd className="mt-1 truncate text-foreground">
          {providerLabel(getModelProviderFromId(modelId, model))}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase text-muted-foreground">
          Quality
        </dt>
        <dd className="mt-1 truncate text-foreground">
          {model?.qualityTier ?? "Unknown"}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase text-muted-foreground">
          Context
        </dt>
        <dd className="mt-1 truncate text-foreground">
          {model?.maxContextTokens
            ? `${formatCompactNumber(model.maxContextTokens)} tokens`
            : "Unknown"}
        </dd>
      </div>
    </dl>
  );
}

function PolicyDetails({ policy }: { policy?: SlothingTaskPolicy }) {
  const fallbacks = policy?.fallbacks ?? [];
  const guardrails = policy?.guardrails;

  return (
    <div className="grid gap-4 border-t pt-5 xl:grid-cols-2">
      <div>
        <h5 className="text-sm font-semibold text-foreground">Fallbacks</h5>
        {fallbacks.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {fallbacks.map((fallback) => (
              <Badge key={fallback} variant="paper">
                {fallback}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No fallback models configured.
          </p>
        )}
      </div>
      <div>
        <h5 className="text-sm font-semibold text-foreground">Guardrails</h5>
        <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span>
            Cost:{" "}
            {guardrails?.maxRequestCostUsd !== undefined
              ? `$${guardrails.maxRequestCostUsd.toFixed(3)}`
              : "not set"}
          </span>
          <span>
            Timeout:{" "}
            {guardrails?.timeoutMs
              ? `${guardrails.timeoutMs / 1000}s`
              : "not set"}
          </span>
          <span>
            Retries:{" "}
            {guardrails?.maxRetries !== undefined
              ? guardrails.maxRetries
              : "not set"}
          </span>
          <span>
            Output:{" "}
            {guardrails?.maxOutputTokens
              ? `${formatCompactNumber(guardrails.maxOutputTokens)} tokens`
              : "not set"}
          </span>
        </div>
      </div>
    </div>
  );
}

function getTaskPolicy(task: SlothingTaskAdminSummary): SlothingTaskPolicy {
  return task.effectivePolicy ?? task.defaultPolicy ?? {};
}

function getModelProvider(model: SlothingModelOption): string {
  return model.provider ?? getModelProviderFromId(model.id);
}

function getModelProviderFromId(
  modelId: string,
  model?: SlothingModelOption,
): string {
  return model?.provider ?? modelId.split("/")[0] ?? modelId;
}

function modelShortName(modelId: string, provider: string): string {
  return modelId.startsWith(`${provider}/`)
    ? modelId.slice(provider.length + 1)
    : modelId;
}

function providerLabel(provider: string): string {
  const known = providerTypes.find((option) => option.value === provider);
  if (known) return known.label;
  return provider
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function optionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function providerFormPayload(form: ProviderFormState) {
  return {
    type: form.type,
    displayName: form.displayName.trim(),
    apiKey: form.apiKey,
    baseUrl: optionalString(form.baseUrl),
    defaultModel: optionalString(form.defaultModel),
  };
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
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
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Failed to update BentoRouter policy."),
    );
  }
}
