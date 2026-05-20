"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  Check,
  FileText,
  Globe2,
  Layers3,
  Loader2,
  Search,
  ShieldQuestion,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useErrorToast } from "@/hooks/use-error-toast";
import type {
  InterviewContextMode,
  InterviewContextPack,
  InterviewContextSourceRef,
} from "@/types/interview";

type SourceOption = InterviewContextSourceRef & {
  detail?: string;
  disabled?: boolean;
  disabledReason?: string;
};

interface SourcesResponse {
  sources?: {
    opportunities?: SourceOption[];
    profile?: {
      experiences?: SourceOption[];
      projects?: SourceOption[];
      skills?: SourceOption[];
    };
    bank?: SourceOption[];
    documents?: SourceOption[];
  };
  recentContextPacks?: InterviewContextPack[];
}

interface InterviewSourceBuilderProps {
  generating: boolean;
  defaultQuestionCount: number;
  defaultTimerEnabled: boolean;
  onStartContextPractice: (options: {
    contextPackId: string;
    contextPackTitle: string;
    contextPackMode: InterviewContextMode;
    contextPackPromotable: boolean;
    questionCount: number;
    timerEnabled: boolean;
  }) => void;
}

const MODE_CARDS: Array<{
  mode: InterviewContextMode;
  title: string;
  description: string;
  icon: typeof Briefcase;
}> = [
  {
    mode: "mixed-context",
    title: "Mixed context",
    description: "Blend a role, resume material, projects, and custom notes.",
    icon: Layers3,
  },
  {
    mode: "project-defense",
    title: "Project defense",
    description: "Get pushed on architecture, hard bugs, and trade-offs.",
    icon: Boxes,
  },
  {
    mode: "skill-grill",
    title: "Skill grill",
    description: "Drill fundamentals, pitfalls, debugging, and examples.",
    icon: Wrench,
  },
  {
    mode: "resume-claim",
    title: "Resume claim",
    description: "Stress-test claims for evidence, metrics, and ownership.",
    icon: ShieldQuestion,
  },
];

function sourceKey(source: InterviewContextSourceRef) {
  return `${source.type}:${source.id || source.url || source.label || ""}`;
}

function sectionSources(response: SourcesResponse["sources"]) {
  return [
    {
      title: "Opportunities",
      icon: Briefcase,
      sources: response?.opportunities ?? [],
    },
    {
      title: "Profile",
      icon: Brain,
      sources: [
        ...(response?.profile?.experiences ?? []),
        ...(response?.profile?.projects ?? []),
        ...(response?.profile?.skills ?? []),
      ],
    },
    {
      title: "Documents",
      icon: FileText,
      sources: response?.documents ?? [],
    },
    {
      title: "Bank",
      icon: BookOpen,
      sources: response?.bank ?? [],
    },
  ];
}

export function InterviewSourceBuilder({
  generating,
  defaultQuestionCount,
  defaultTimerEnabled,
  onStartContextPractice,
}: InterviewSourceBuilderProps) {
  const [data, setData] = useState<SourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [mode, setMode] = useState<InterviewContextMode>("mixed-context");
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState<InterviewContextSourceRef[]>([]);
  const [customUrl, setCustomUrl] = useState("");
  const [customText, setCustomText] = useState("");
  const [contextPack, setContextPack] = useState<InterviewContextPack | null>(
    null,
  );
  const showErrorToast = useErrorToast();

  useEffect(() => {
    let active = true;
    async function loadSources() {
      try {
        const response = await fetch("/api/interview/sources");
        if (!response.ok) throw new Error("Failed to load sources");
        const json = (await response.json()) as SourcesResponse;
        if (active) setData(json);
      } catch (error) {
        showErrorToast(error, {
          title: "Could not load interview sources",
          fallbackDescription: "Try refreshing the page.",
        });
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSources();
    return () => {
      active = false;
    };
  }, [showErrorToast]);

  const selectedKeys = useMemo(
    () => new Set(selected.map((source) => sourceKey(source))),
    [selected],
  );
  const selectedCount =
    selected.length + (customUrl.trim() ? 1 : 0) + (customText.trim() ? 1 : 0);
  const hasPublicUrl = Boolean(customUrl.trim());

  const toggleSource = (source: SourceOption) => {
    if (source.disabled) return;
    setContextPack(null);
    setSelected((current) => {
      const key = sourceKey(source);
      if (current.some((item) => sourceKey(item) === key)) {
        return current.filter((item) => sourceKey(item) !== key);
      }
      return [
        ...current,
        {
          type: source.type,
          id: source.id,
          category: source.category,
          label: source.label,
        },
      ];
    });
  };

  const buildContext = async () => {
    setBuilding(true);
    setContextPack(null);
    try {
      const sources: InterviewContextSourceRef[] = [
        ...selected,
        ...(customUrl.trim()
          ? [
              {
                type: "custom-url" as const,
                url: customUrl.trim(),
                label: customUrl.trim(),
              },
            ]
          : []),
        ...(customText.trim()
          ? [
              {
                type: "custom-text" as const,
                label: "Custom interview notes",
                text: customText.trim(),
              },
            ]
          : []),
      ];
      const response = await fetch("/api/interview/context-packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          sources,
          deepDiveEnabled: advanced,
          questionCount: defaultQuestionCount,
        }),
      });
      if (!response.ok) throw new Error("Failed to build context");
      const json = (await response.json()) as {
        contextPack?: InterviewContextPack;
      };
      if (!json.contextPack) throw new Error("No context pack returned");
      setContextPack(json.contextPack);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not build interview context",
        fallbackDescription: "Check the selected sources and try again.",
      });
    } finally {
      setBuilding(false);
    }
  };

  const startContextPractice = () => {
    if (!contextPack) return;
    onStartContextPractice({
      contextPackId: contextPack.id,
      contextPackTitle: contextPack.title,
      contextPackMode: contextPack.mode,
      contextPackPromotable:
        contextPack.promotionState !== "saved_to_bank" &&
        contextPack.sources.some((source) =>
          ["custom-url", "custom-text"].includes(source.type),
        ),
      questionCount: defaultQuestionCount,
      timerEnabled: defaultTimerEnabled,
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted))_100%)]">
      <div className="grid gap-0">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-3 gap-1">
                <Sparkles className="h-3 w-3" />
                Context interviews
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Build an interviewer from your real material
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Use saved jobs, documents, profile components, bank entries, or
                a public link. Custom material stays one-off unless you save it
                to the bank after practice.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdvanced((value) => !value)}
              className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Globe2 className="h-4 w-4" />
              {advanced ? "Advanced repo scan" : "Basic scan"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {MODE_CARDS.map((card) => {
              const Icon = card.icon;
              const active = mode === card.mode;
              return (
                <button
                  key={card.mode}
                  type="button"
                  onClick={() => {
                    setMode(card.mode);
                    setContextPack(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "bg-background/80 hover:border-foreground/20"
                  }`}
                >
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <p className="font-medium">{card.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="col-span-full rounded-2xl border bg-background/80 p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Loading reusable sources...
              </div>
            ) : (
              sectionSources(data?.sources).map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.title}
                    className="rounded-2xl border bg-background/80 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="flex items-center gap-2 font-medium">
                        <Icon className="h-4 w-4 text-primary" />
                        {section.title}
                      </p>
                      <Badge variant="outline">{section.sources.length}</Badge>
                    </div>
                    <div className="max-h-56 space-y-2 overflow-auto pr-1">
                      {section.sources.length ? (
                        section.sources.map((source) => {
                          const active = selectedKeys.has(sourceKey(source));
                          return (
                            <button
                              key={sourceKey(source)}
                              type="button"
                              disabled={source.disabled}
                              onClick={() => toggleSource(source)}
                              className={`w-full rounded-xl border p-3 text-left transition ${
                                active
                                  ? "border-primary bg-primary/10"
                                  : "bg-card hover:border-foreground/20"
                              } ${source.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                            >
                              <span className="flex items-start gap-2">
                                <span
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                    active
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "bg-background"
                                  }`}
                                >
                                  {active ? (
                                    <Check className="h-3 w-3" />
                                  ) : null}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium">
                                    {source.label}
                                  </span>
                                  <span className="line-clamp-2 text-xs text-muted-foreground">
                                    {source.disabledReason || source.detail}
                                  </span>
                                </span>
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                          No sources here yet.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="grid gap-3 rounded-2xl border bg-background/80 p-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Globe2 className="h-4 w-4 text-primary" />
                Public project or portfolio URL
              </span>
              <input
                value={customUrl}
                onChange={(event) => {
                  setCustomUrl(event.target.value);
                  setContextPack(null);
                }}
                placeholder="https://github.com/user/project"
                className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary"
              />
              <span className="text-xs text-muted-foreground">
                Public GitHub repos get README only in Basic, manifests in
                Advanced.
              </span>
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                One-off notes
              </span>
              <textarea
                value={customText}
                onChange={(event) => {
                  setCustomText(event.target.value);
                  setContextPack(null);
                }}
                placeholder="Paste project notes, an experience, or a claim you want grilled on..."
                rows={4}
                className="w-full resize-none rounded-xl border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary"
              />
            </label>
          </div>
        </div>

        <aside className="border-t bg-background/75 p-5">
          <div>
            <p className="text-sm font-semibold">Context preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedCount
                ? `${selectedCount} source${selectedCount === 1 ? "" : "s"} selected`
                : "Select a source, paste notes, or add a public link."}
            </p>

            {contextPack ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border bg-card p-4">
                  <p className="font-medium">{contextPack.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {contextPack.status === "ready"
                      ? "Ready for grounded questions."
                      : "Partial context. Review warnings before starting."}
                  </p>
                </div>
                <PreviewList
                  title="Stack"
                  items={contextPack.summary.detectedStack}
                />
                <PreviewList
                  title="Claims"
                  items={contextPack.summary.claims}
                />
                <PreviewList
                  title="Weak spots"
                  items={contextPack.summary.weakSpots}
                />
                <PreviewList
                  title="Angles"
                  items={contextPack.summary.questionAngles}
                />
                {contextPack.summary.warnings.length ? (
                  <PreviewList
                    title="Warnings"
                    items={contextPack.summary.warnings}
                  />
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
                <Search className="mb-3 h-5 w-5 text-primary" />
                Build a context pack to see extracted skills, claims, weak
                spots, and question angles.
              </div>
            )}

            {hasPublicUrl && (
              <p className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                Public URLs only. Private repositories are not fetched in this
                version.
              </p>
            )}

            <div className="mt-5 grid gap-2">
              <Button
                type="button"
                onClick={buildContext}
                disabled={!selectedCount || building || generating}
                variant={contextPack ? "outline" : "default"}
              >
                {building ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building context...
                  </>
                ) : contextPack ? (
                  "Rebuild context"
                ) : (
                  "Build practice context"
                )}
              </Button>
              <Button
                type="button"
                onClick={startContextPractice}
                disabled={!contextPack || generating || building}
                className="gradient-bg text-primary-foreground hover:opacity-90"
              >
                Start grounded interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 6).map((item) => (
          <span
            key={item}
            className="rounded-full border bg-card px-2 py-1 text-xs text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
