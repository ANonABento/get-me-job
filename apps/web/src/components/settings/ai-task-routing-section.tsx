"use client";

import { BrainCircuit, CircleAlert, Route, ShieldCheck } from "lucide-react";
import { PageSection } from "@/components/ui/page-layout";
import {
  getAiTasksBySurface,
  type SlothingAiTask,
  type TaskExecutionMode,
} from "@/lib/llm/tasks";
import { cn } from "@/lib/utils";

interface AiTaskRoutingSectionProps {
  hasProvider: boolean;
}

const MODE_LABELS: Record<TaskExecutionMode, string> = {
  heuristic: "Heuristic",
  optional_llm: "Optional LLM",
  needs_llm: "Needs LLM",
};

const MODE_STYLES: Record<TaskExecutionMode, string> = {
  heuristic: "border-success/30 bg-success/10 text-success",
  optional_llm: "border-warning/30 bg-warning/10 text-warning",
  needs_llm: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function AiTaskRoutingSection({
  hasProvider,
}: AiTaskRoutingSectionProps) {
  const groups = getAiTasksBySurface();

  return (
    <PageSection
      title="AI task routing"
      description="See which tasks run locally, which can use a model, and which require provider setup."
      icon={Route}
      contentClassName="space-y-5"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          icon={ShieldCheck}
          label="Available without a provider"
          value="Heuristic"
        />
        <SummaryTile
          icon={BrainCircuit}
          label={
            hasProvider
              ? "Provider or managed credits when helpful"
              : "Fallback ready"
          }
          value="Optional LLM"
        />
        <SummaryTile
          icon={CircleAlert}
          label={
            hasProvider
              ? "Provider or managed credits configured"
              : "Provider or managed credits required"
          }
          value="Needs LLM"
        />
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.surface} className="space-y-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {group.surface}
            </h3>
            <div className="divide-y rounded-lg border bg-background">
              {group.tasks.map((task) => (
                <TaskRow key={task.id} task={task} hasProvider={hasProvider} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageSection>
  );
}

function TaskRow({
  task,
  hasProvider,
}: {
  task: SlothingAiTask;
  hasProvider: boolean;
}) {
  const availability = getAvailability(task, hasProvider);

  return (
    <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{task.label}</p>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-semibold",
              MODE_STYLES[task.mode],
            )}
          >
            {MODE_LABELS[task.mode]}
          </span>
        </div>
        {task.route ? (
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {task.route}
          </p>
        ) : null}
        {task.bentoTaskId ? (
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Bento policy seed: {task.bentoTaskId}
          </p>
        ) : null}
        {task.fallbackDescription ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {task.fallbackDescription}
          </p>
        ) : null}
      </div>
      <div className="sm:w-44 sm:text-right">
        <p className="text-xs font-medium text-foreground">
          {availability.label}
        </p>
        {availability.href ? (
          <a
            href={availability.href}
            className="mt-1 inline-flex text-xs font-medium text-primary hover:underline"
          >
            Set up provider
          </a>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            {availability.detail}
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getAvailability(task: SlothingAiTask, hasProvider: boolean) {
  if (task.mode === "heuristic") {
    return { label: "Available", detail: "No provider used." };
  }
  if (task.mode === "optional_llm") {
    return hasProvider
      ? {
          label: "Provider, credits, or fallback",
          detail: "Credits only when a model runs.",
        }
      : {
          label: "Fallback available",
          detail: "No provider credits consumed.",
        };
  }
  return hasProvider
    ? { label: "Available", detail: "Uses configured provider." }
    : { label: "Blocked", detail: "", href: "#ai-keys" };
}
