"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, FlaskConical, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PromptVariant, PromptVariantStats } from "@/lib/db/prompt-variants";

interface VariantWithStats extends PromptVariant {
  resultCount: number;
  avgMatchScore: number | null;
}

export function PromptVariantsSection() {
  const [variants, setVariants] = useState<VariantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");

  const loadVariants = useCallback(async () => {
    try {
      const [variantsRes, statsRes] = await Promise.all([
        fetch("/api/prompts"),
        fetch("/api/prompts/results"),
      ]);
      const variantsData = (await variantsRes.json()) as { variants: PromptVariant[] };
      const statsData = (await statsRes.json()) as { stats: PromptVariantStats[] };

      const statsMap = new Map(statsData.stats.map((s) => [s.variantId, s]));
      const merged: VariantWithStats[] = variantsData.variants.map((v) => {
        const stat = statsMap.get(v.id);
        return {
          ...v,
          resultCount: stat?.resultCount ?? 0,
          avgMatchScore: stat?.avgMatchScore ?? null,
        };
      });
      setVariants(merged);
    } catch {
      // silently fail — variants section is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVariants();
  }, [loadVariants]);

  const handleActivate = async (id: string) => {
    setActivating(id);
    try {
      await fetch(`/api/prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      await loadVariants();
    } finally {
      setActivating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      await loadVariants();
    } finally {
      setDeleting(null);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), content: newContent.trim() }),
      });
      setNewName("");
      setNewContent("");
      setShowForm(false);
      await loadVariants();
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Prompt A/B Testing</h2>
            <p className="text-sm text-muted-foreground">
              Manage tailoring prompt versions. The active version is used for all resume
              generations.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Variant
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border bg-muted/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold">New Prompt Variant</h3>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="variant-name">
              Name
            </label>
            <input
              id="variant-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Concise v2"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="variant-content">
              Instructions
            </label>
            <textarea
              id="variant-content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={6}
              placeholder="Write the tailoring instructions for this prompt variant..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={creating || !newName.trim() || !newContent.trim()}
              onClick={() => void handleCreate()}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading variants...
        </div>
      ) : variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No prompt variants yet.</p>
      ) : (
        <div className="space-y-3">
          {variants.map((v) => (
            <VariantCard
              key={v.id}
              variant={v}
              activating={activating === v.id}
              deleting={deleting === v.id}
              onActivate={() => void handleActivate(v.id)}
              onDelete={() => void handleDelete(v.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface VariantCardProps {
  variant: VariantWithStats;
  activating: boolean;
  deleting: boolean;
  onActivate: () => void;
  onDelete: () => void;
}

function VariantCard({ variant, activating, deleting, onActivate, onDelete }: VariantCardProps) {
  const avgScore =
    variant.avgMatchScore !== null ? Math.round(variant.avgMatchScore) : null;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        variant.active ? "border-primary bg-primary/5" : "bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{variant.name}</span>
            <span className="text-xs text-muted-foreground">v{variant.version}</span>
            {variant.active && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{variant.resultCount} generation{variant.resultCount !== 1 ? "s" : ""}</span>
            {avgScore !== null && <span>avg match score: {avgScore}%</span>}
          </div>
          <pre className="mt-3 rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap font-mono line-clamp-4 overflow-hidden">
            {variant.content}
          </pre>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!variant.active && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={activating}
              onClick={onActivate}
            >
              {activating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Activate
            </Button>
          )}
          {!variant.active && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={deleting}
              onClick={onDelete}
              aria-label={`Delete ${variant.name}`}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
