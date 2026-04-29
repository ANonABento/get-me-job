"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  BookOpen,
  CheckSquare,
  Square,
  Target,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { InterviewPrepGuide, PrepChecklistItem, PrepQuestion } from "@/lib/interview/prep-guide";

interface PrepGuideCardProps {
  jobId: string;
}

function ChecklistSection({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: PrepChecklistItem[];
  onToggle: (id: string) => void;
}) {
  const completed = items.filter((i) => i.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs text-muted-foreground">
          {completed}/{items.length}
        </span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={cn(
              "w-full flex items-start gap-2 p-2 rounded-lg text-left transition-colors",
              item.completed
                ? "bg-success/5"
                : "hover:bg-muted/50"
            )}
          >
            {item.completed ? (
              <CheckSquare className="h-4 w-4 text-success shrink-0 mt-0.5" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm", item.completed && "line-through text-muted-foreground")}>
                {item.task}
              </p>
              {item.description && !item.completed && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ question, index }: { question: PrepQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const categoryColors = {
    behavioral: "bg-info/10 text-info",
    technical: "bg-primary/10 text-primary",
    situational: "bg-warning/10 text-warning",
    company: "bg-success/10 text-success",
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{question.question}</p>
          <span className={cn("inline-block mt-1 px-2 py-0.5 text-xs rounded capitalize", categoryColors[question.category])}>
            {question.category}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t">
          <div className="pl-9 pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Tips
            </p>
            <ul className="space-y-1">
              {question.tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function PrepGuideCard({ jobId }: PrepGuideCardProps) {
  const [guide, setGuide] = useState<InterviewPrepGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "checklist" | "questions">("overview");
  const [downloading, setDownloading] = useState(false);
  const showErrorToast = useErrorToast();

  useEffect(() => {
    async function fetchGuide() {
      try {
        setLoading(true);
        const res = await fetch(`/api/interview/prep-guide?jobId=${jobId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch guide");
        }

        setGuide(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load guide");
      } finally {
        setLoading(false);
      }
    }

    fetchGuide();
  }, [jobId]);

  const handleToggleChecklistItem = (id: string) => {
    if (!guide) return;
    setGuide({
      ...guide,
      checklist: guide.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/interview/prep-guide?jobId=${jobId}&format=markdown`);
      if (!res.ok) {
        throw new Error("Failed to download guide");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-prep-${guide?.company.replace(/\s+/g, "-")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not download prep guide",
        fallbackDescription: "Please try downloading the guide again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Generating your prep guide...</p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-destructive">{error || "Failed to load guide"}</p>
      </div>
    );
  }

  const checklistProgress = guide.checklist.filter((i) => i.completed).length / guide.checklist.length;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Interview Prep Guide</h3>
              <p className="text-sm text-muted-foreground">
                {guide.jobTitle} at {guide.company}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Preparation Progress</span>
            <span>{Math.round(checklistProgress * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${checklistProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: "overview", label: "Overview", icon: Target },
          { id: "checklist", label: "Checklist", icon: CheckCircle2 },
          { id: "questions", label: "Questions", icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <p className="text-sm leading-relaxed">{guide.summary}</p>

            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                Key Topics to Prepare
              </h4>
              <div className="flex flex-wrap gap-2">
                {guide.keyTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-lg bg-muted"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-success" />
                  Your Strengths
                </h4>
                <ul className="space-y-1">
                  {guide.yourStrengths.map((strength, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Potential Gaps
                </h4>
                <ul className="space-y-1">
                  {guide.potentialGaps.map((gap, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Key Talking Points
              </h4>
              <ol className="space-y-2">
                {guide.talkingPoints.map((point, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-6">
            <ChecklistSection
              title="Before the Interview"
              items={guide.checklist.filter((i) => i.category === "before")}
              onToggle={handleToggleChecklistItem}
            />
            <ChecklistSection
              title="During the Interview"
              items={guide.checklist.filter((i) => i.category === "during")}
              onToggle={handleToggleChecklistItem}
            />
            <ChecklistSection
              title="After the Interview"
              items={guide.checklist.filter((i) => i.category === "after")}
              onToggle={handleToggleChecklistItem}
            />
          </div>
        )}

        {activeTab === "questions" && (
          <div className="space-y-2">
            {guide.questions.map((question, i) => (
              <QuestionCard key={i} question={question} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
