"use client";

import { formatDateOnly, nowIso, toEpoch } from "@/lib/format/time";

import {
  useCallback,
  useEffect,
  Fragment,
  useMemo,
  useRef,
  Suspense,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SearchBar,
  CATEGORY_LABELS,
  type SortOption,
} from "@/components/bank/search-bar";
import { ChunkCard } from "@/components/bank/chunk-card";
import { BulkActionBar } from "@/components/bank/bulk-action-bar";
import { UploadOverlay } from "@/components/bank/upload-overlay";
import { ErrorState, getErrorMessage } from "@/components/ui/error-state";
import { BANK_CATEGORIES, type BankCategory, type BankEntry } from "@/types";
import {
  CheckCircle2,
  Database,
  FileText,
  LayoutGrid,
  Loader2,
  Rows3,
  AlertTriangle,
  ChevronRight,
  Upload,
  HardDrive,
} from "lucide-react";
import type { SourceDocument } from "@/lib/db/profile-bank";
import { Badge } from "@/components/ui/badge";
import { useRegisterShortcuts } from "@/components/keyboard-shortcuts";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { StandardEmptyState } from "@/components/ui/page-layout";
import {
  SkeletonCard,
  SkeletonButton,
  SkeletonChunkCard,
} from "@/components/ui/skeleton";
import { VirtualGrid } from "@/components/ui/virtual-list";
import { AddEntryDialog } from "@/components/bank/add-entry-dialog";
import { useToast } from "@/components/ui/toast";
import { useErrorToast } from "@/hooks/use-error-toast";
import { uploadSuccessMessage } from "./utils";
import {
  BANK_GRID_GAP_PX,
  ESTIMATED_CARD_HEIGHT_BANK,
  MIN_BANK_COLUMN_WIDTH_PX,
} from "@/lib/constants/virtualization";
import {
  formatExistingUploadDate,
  getExistingUploadTimestamp,
  type UploadConflictExisting,
} from "@/lib/upload-conflict";
import { cn } from "@/lib/utils";
import {
  getBankEntryParentId,
  getBulletReviewReason,
  isBulletNeedsReview,
} from "@/lib/bank/bullet-review";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

const DriveFilePicker = dynamic(
  () => import("@/components/google").then((m) => m.DriveFilePicker),
  { loading: () => <SkeletonButton className="w-40" />, ssr: false },
);

const SourceDocuments = dynamic(
  () =>
    import("@/components/bank/source-documents").then((m) => m.SourceDocuments),
  { loading: () => <SkeletonCard className="min-h-32" />, ssr: false },
);

interface UploadConflict {
  file: File;
  existing: UploadConflictExisting;
}

interface BankUploadResponse {
  success: boolean;
  error?: string;
  entriesCreated?: number;
  document?: {
    id: string;
    filename: string;
    type: string;
    size: number;
  };
}

interface UploadReviewState {
  documentId: string;
  filename: string;
  entries: BankEntry[];
}

type DisplayMode = "category" | "source";
type LayoutMode = "grid" | "table";

function getParentId(entry: BankEntry): string | null {
  return getBankEntryParentId(entry);
}

function isChildEntry(entry: BankEntry): boolean {
  return (
    (entry.category === "bullet" || entry.category === "achievement") &&
    getParentId(entry) !== null
  );
}

function getChildEntriesFor(
  parent: BankEntry,
  entries: BankEntry[],
): BankEntry[] {
  return entries
    .filter((entry) => getParentId(entry) === parent.id)
    .sort((a, b) => {
      const aOrder = Number(a.content.order ?? 0);
      const bOrder = Number(b.content.order ?? 0);
      return aOrder - bOrder;
    });
}

function isReviewRootEntry(entry: BankEntry): boolean {
  return !isChildEntry(entry);
}

function getEntryLabel(entry: BankEntry): string {
  const title = entry.content.title ? String(entry.content.title) : "";
  const company = entry.content.company ? String(entry.content.company) : "";
  const name = entry.content.name ? String(entry.content.name) : "";

  if (title || company) return [title, company].filter(Boolean).join(" at ");
  return name || "Component";
}

function getParentKey(entry: BankEntry): string {
  const title = entry.content.title ? String(entry.content.title) : "";
  const company = entry.content.company ? String(entry.content.company) : "";
  const startDate = entry.content.startDate
    ? String(entry.content.startDate)
    : "";
  const name = entry.content.name ? String(entry.content.name) : "";

  return [company, title, startDate, name]
    .filter(Boolean)
    .map((part) => part.trim().toLowerCase())
    .join("|");
}

function withChildCount(
  entry: BankEntry,
  childCount: number,
): Record<string, unknown> {
  return { ...entry.content, childCount };
}

function normalizeReviewText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function reviewDuplicateKey(entry: BankEntry): string {
  switch (entry.category) {
    case "experience":
      return [
        entry.category,
        entry.content.company,
        entry.content.title,
        entry.content.startDate,
      ]
        .map(normalizeReviewText)
        .join("|");
    case "project":
    case "education":
    case "certification":
    case "skill":
      return [entry.category, entry.content.name ?? entry.content.institution]
        .map(normalizeReviewText)
        .join("|");
    case "bullet":
    case "achievement":
      return [entry.category, entry.content.description]
        .map(normalizeReviewText)
        .join("|");
    default:
      return [entry.category, JSON.stringify(entry.content)]
        .map(normalizeReviewText)
        .join("|");
  }
}

function getReviewWarnings(
  entry: BankEntry,
  children: BankEntry[],
  duplicateEntries: BankEntry[],
): string[] {
  const warnings: string[] = [];
  if (entry.confidenceScore < 0.9) warnings.push("Review confidence");
  if (duplicateEntries.length > 0) warnings.push("Possible duplicate");
  if (
    (entry.category === "experience" || entry.category === "project") &&
    children.length === 0
  ) {
    warnings.push("No bullets");
  }
  if (entry.category === "experience") {
    if (!entry.content.title || !entry.content.company) {
      warnings.push("Missing role details");
    }
  }
  return warnings;
}

function buildChildContentForParent(
  parent: BankEntry,
  description: string,
  order: number,
): Record<string, unknown> {
  const parentType = parent.category === "project" ? "project" : "experience";
  const content: Record<string, unknown> = {
    description,
    context: getEntryLabel(parent),
    parentType,
    parentId: parent.id,
    parentKey: getParentKey(parent),
    parentLabel: getEntryLabel(parent),
    order,
    sourceSection: parent.content.sourceSection ?? parent.category,
  };

  if (parent.category === "project") {
    content.project = parent.content.name;
    content.technologies = parent.content.technologies;
  } else {
    content.company = parent.content.company;
    content.role = parent.content.title;
  }

  return content;
}

interface BankComponentsTabProps {
  onCategoryCountsChange?: (
    counts: Partial<Record<BankCategory | "all", number>>,
  ) => void;
  onActiveCategoryChange?: (category: BankCategory | "all") => void;
  externalActiveCategory?: BankCategory | "all" | null;
}

export function BankComponentsTab({
  onCategoryCountsChange,
  onActiveCategoryChange,
  externalActiveCategory,
}: BankComponentsTabProps = {}) {
  const locale = useLocale();
  const a11yT = useA11yTranslations();
  const dialogsT = useTranslations("dialogs.bank.page");
  const uploadT = useTranslations("dialogs.upload");
  const commonT = useTranslations("common");
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreEntries, setHasMoreEntries] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search & filter state
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<BankCategory | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("category");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(
    new Set(),
  );

  // Source document filtering
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>([]);
  const [sourceRefreshKey, setSourceRefreshKey] = useState(0);

  // Upload via button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const entriesListRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [driveImporting, setDriveImporting] = useState(false);
  const [uploadConflict, setUploadConflict] = useState<UploadConflict | null>(
    null,
  );
  const [uploadReview, setUploadReview] = useState<UploadReviewState | null>(
    null,
  );
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [moveBulletsOpen, setMoveBulletsOpen] = useState(false);
  const [moveTargetParentId, setMoveTargetParentId] = useState("");
  const { addToast } = useToast();
  const showErrorToast = useErrorToast();

  // Register page-specific keyboard shortcuts
  useRegisterShortcuts(
    "bank",
    useMemo(
      () => [
        {
          key: "/",
          description: "Focus search",
          category: "actions" as const,
          action: () => searchInputRef.current?.focus(),
        },
        {
          key: "Escape",
          description: "Clear search",
          category: "actions" as const,
          action: () => {
            setQuery("");
            searchInputRef.current?.blur();
          },
        },
        {
          key: "u",
          ctrl: true,
          description: "Upload file",
          category: "actions" as const,
          action: () => fileInputRef.current?.click(),
        },
      ],
      [],
    ),
  );

  const fetchEntries = useCallback(
    async (options?: { silent?: boolean; cursor?: string | null }) => {
      if (options?.cursor) setLoadingMore(true);
      else if (!options?.silent) setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (activeCategory === "hackathon") params.set("type", "hackathon");
        else if (activeCategory !== "all")
          params.set("category", activeCategory);
        if (options?.cursor) params.set("cursor", options.cursor);
        const res = await fetch(`/api/bank?${params}`);
        if (!res.ok) throw new Error("Failed to fetch entries");
        const data = await res.json();
        setEntries((current) =>
          options?.cursor
            ? [...current, ...(data.entries || [])]
            : data.entries || [],
        );
        setNextCursor(data.nextCursor ?? null);
        setHasMoreEntries(Boolean(data.hasMore));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (options?.cursor) setLoadingMore(false);
        else if (!options?.silent) setLoading(false);
      }
    },
    [query, activeCategory],
  );

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const fetchSourceDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/bank/documents");
      if (!res.ok) throw new Error("Failed to fetch source documents");
      const data = await res.json();
      setSourceDocuments(data.documents || []);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not load source files",
        fallbackDescription: "Please refresh the page and try again.",
      });
    }
  }, [showErrorToast]);

  useEffect(() => {
    fetchSourceDocuments();
  }, [fetchSourceDocuments, sourceRefreshKey]);

  // Compute category counts from all entries (not filtered)
  const [allEntries, setAllEntries] = useState<BankEntry[]>([]);

  const refreshAllEntries = useCallback(() => {
    fetch("/api/bank?limit=200")
      .then((r) => r.json())
      .then((data) => setAllEntries(data.entries || []))
      .catch(() => {});
  }, []);

  // Fetch all entries for counts on mount
  useEffect(() => {
    refreshAllEntries();
  }, [refreshAllEntries]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of BANK_CATEGORIES) {
      counts[cat] = allEntries.filter(
        (e) => e.category === cat && (cat === "bullet" || !isChildEntry(e)),
      ).length;
    }
    return counts;
  }, [allEntries]);

  const needsReviewCount = useMemo(
    () =>
      allEntries.filter((entry) => isBulletNeedsReview(entry, allEntries))
        .length,
    [allEntries],
  );

  // Sort & filter entries
  const sortedEntries = useMemo(() => {
    let filtered = [...entries];
    if (activeDocumentId) {
      filtered = filtered.filter(
        (e) => e.sourceDocumentId === activeDocumentId,
      );
    }
    if (reviewOnly) {
      filtered = filtered.filter((entry) =>
        isBulletNeedsReview(entry, allEntries),
      );
    } else if (activeCategory === "all") {
      filtered = filtered.filter((entry) => !isChildEntry(entry));
    }
    if (sortBy === "confidence") {
      filtered.sort((a, b) => b.confidenceScore - a.confidenceScore);
    } else {
      filtered.sort((a, b) => toEpoch(b.createdAt) - toEpoch(a.createdAt));
    }
    return filtered;
  }, [
    entries,
    sortBy,
    activeDocumentId,
    activeCategory,
    reviewOnly,
    allEntries,
  ]);

  const visibleEntryIds = useMemo(
    () => new Set(sortedEntries.map((entry) => entry.id)),
    [sortedEntries],
  );

  useEffect(() => {
    setSelectedEntryIds((prev) => {
      const next = new Set([...prev].filter((id) => visibleEntryIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleEntryIds]);

  // Group by category for display
  const groupedEntries = useMemo(() => {
    if (activeCategory !== "all") {
      return [{ category: activeCategory, entries: sortedEntries }];
    }
    const groups: { category: BankCategory; entries: BankEntry[] }[] = [];
    for (const cat of BANK_CATEGORIES) {
      const catEntries = sortedEntries.filter((e) => e.category === cat);
      if (catEntries.length > 0) {
        groups.push({ category: cat, entries: catEntries });
      }
    }
    return groups;
  }, [sortedEntries, activeCategory]);

  const sourceGroupedEntries = useMemo(() => {
    const groups: {
      key: string;
      document: SourceDocument | null;
      entries: BankEntry[];
    }[] = [];
    const groupedBySource = new Map<string, BankEntry[]>();

    for (const entry of sortedEntries) {
      const key = entry.sourceDocumentId ?? "manual";
      const nextEntries = groupedBySource.get(key) ?? [];
      nextEntries.push(entry);
      groupedBySource.set(key, nextEntries);
    }

    for (const doc of sourceDocuments) {
      const entriesForDoc = groupedBySource.get(doc.id);
      if (entriesForDoc?.length) {
        groups.push({ key: doc.id, document: doc, entries: entriesForDoc });
        groupedBySource.delete(doc.id);
      }
    }

    const manualEntries = groupedBySource.get("manual");
    if (manualEntries?.length) {
      groups.push({ key: "manual", document: null, entries: manualEntries });
      groupedBySource.delete("manual");
    }

    for (const [key, entriesForSource] of groupedBySource) {
      groups.push({ key, document: null, entries: entriesForSource });
    }

    return groups;
  }, [sortedEntries, sourceDocuments]);

  const showLibraryTools =
    loading ||
    allEntries.length > 0 ||
    query.length > 0 ||
    activeCategory !== "all" ||
    activeDocumentId !== null ||
    reviewOnly;

  const selectedVisibleCount = selectedEntryIds.size;

  function toggleEntrySelection(id: string) {
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisibleEntries() {
    setSelectedEntryIds(new Set(sortedEntries.map((entry) => entry.id)));
  }

  function selectEntries(ids: string[]) {
    setSelectedEntryIds((prev) => new Set([...prev, ...ids]));
  }

  function deselectEntries(ids: string[]) {
    const idsToRemove = new Set(ids);
    setSelectedEntryIds(
      (prev) => new Set([...prev].filter((id) => !idsToRemove.has(id))),
    );
  }

  function clearEntrySelection() {
    setSelectedEntryIds(new Set());
  }

  function getSelectedEntries(): BankEntry[] {
    const byId = new Map(allEntries.map((entry) => [entry.id, entry]));
    return [...selectedEntryIds]
      .map((id) => byId.get(id))
      .filter((entry): entry is BankEntry => Boolean(entry));
  }

  function getSelectedBulletEntries(): BankEntry[] {
    return getSelectedEntries().filter((entry) => entry.category === "bullet");
  }

  const parentCandidates = allEntries.filter(
    (entry) => entry.category === "experience" || entry.category === "project",
  );
  const selectedBulletCount = getSelectedBulletEntries().length;

  function openMoveBulletsDialog() {
    const firstParentId = parentCandidates[0]?.id ?? "";
    setMoveTargetParentId((current) => current || firstParentId);
    setMoveBulletsOpen(true);
  }

  function handleExportSelected() {
    const selectedEntries = getSelectedEntries();
    if (selectedEntries.length === 0) return;
    const blob = new Blob([JSON.stringify(selectedEntries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `profile-bank-${selectedEntries.length}-entries.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleAddSelectedToResume() {
    const ids = [...selectedEntryIds];
    if (ids.length === 0) return;
    localStorage.setItem("slothing:selectedBankEntryIds", JSON.stringify(ids));
    addToast({
      type: "success",
      title: `${ids.length} component${ids.length === 1 ? "" : "s"} staged for tailoring`,
      description:
        "The Studio can use this staged selection when the tailoring flow is wired in.",
    });
  }

  async function handleUpdate(id: string, content: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/bank/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, content } : e)),
      );
      setAllEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, content } : e)),
      );
    } catch (err) {
      showErrorToast(err, {
        title: "Could not update entry",
        fallbackDescription: "Please try saving the entry again.",
      });
    }
  }

  async function handleCreate(
    category: BankCategory,
    content: Record<string, unknown>,
  ) {
    try {
      const res = await fetch("/api/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, content }),
      });
      if (!res.ok) throw new Error("Create failed");
      handleDataRefresh();
    } catch (err) {
      showErrorToast(err, {
        title: "Could not create entry",
        fallbackDescription: "Please try adding the entry again.",
      });
    }
  }

  async function persistParentChildCount(
    parent: BankEntry,
    childCount: number,
  ) {
    const content = withChildCount(parent, childCount);
    await handleUpdate(parent.id, content);
  }

  async function handleCreateChild(parent: BankEntry, description: string) {
    const existingChildren = getChildEntriesFor(parent, entries);
    const content = buildChildContentForParent(
      parent,
      description,
      existingChildren.length,
    );

    try {
      const res = await fetch("/api/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "bullet",
          content,
          sourceDocumentId: parent.sourceDocumentId,
          sourceSection:
            typeof content.sourceSection === "string"
              ? content.sourceSection
              : parent.category,
          confidenceScore: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");

      const created: BankEntry = {
        id: data.id,
        userId: parent.userId,
        category: "bullet",
        content,
        sourceDocumentId: parent.sourceDocumentId,
        confidenceScore: 1,
        createdAt: nowIso(),
      };
      const nextChildCount = existingChildren.length + 1;
      setEntries((prev) =>
        prev
          .map((entry) =>
            entry.id === parent.id
              ? { ...entry, content: withChildCount(entry, nextChildCount) }
              : entry,
          )
          .concat(created),
      );
      setAllEntries((prev) =>
        prev
          .map((entry) =>
            entry.id === parent.id
              ? { ...entry, content: withChildCount(entry, nextChildCount) }
              : entry,
          )
          .concat(created),
      );
      await persistParentChildCount(parent, nextChildCount);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not add bullet",
        fallbackDescription: "Please try adding the bullet again.",
      });
    }
  }

  async function handleReorderChild(
    parent: BankEntry,
    childId: string,
    direction: "up" | "down",
  ) {
    const children = getChildEntriesFor(parent, entries);
    const currentIndex = children.findIndex((child) => child.id === childId);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || swapIndex < 0 || swapIndex >= children.length) {
      return;
    }

    const reordered = [...children];
    const current = reordered[currentIndex];
    const swap = reordered[swapIndex];
    reordered[currentIndex] = swap;
    reordered[swapIndex] = current;

    const contentById = new Map(
      reordered.map((child, index) => [
        child.id,
        { ...child.content, order: index },
      ]),
    );

    const applyReorder = (items: BankEntry[]) =>
      items.map((entry) => {
        const nextContent = contentById.get(entry.id);
        return nextContent ? { ...entry, content: nextContent } : entry;
      });

    setEntries(applyReorder);
    setAllEntries(applyReorder);

    try {
      await Promise.all(
        reordered.map((child, index) =>
          fetch(`/api/bank/${child.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: { ...child.content, order: index },
              confidenceScore: child.confidenceScore,
            }),
          }).then((res) => {
            if (!res.ok) throw new Error("Reorder failed");
          }),
        ),
      );
    } catch (err) {
      await handleDataRefresh({ silent: true });
      showErrorToast(err, {
        title: "Could not reorder bullets",
        fallbackDescription: "Please try moving the bullet again.",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      const deleted = entries.find((entry) => entry.id === id);
      const deletedParentId = deleted ? getParentId(deleted) : null;
      const parent = deletedParentId
        ? entries.find((entry) => entry.id === deletedParentId)
        : null;
      const res = await fetch(`/api/bank/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      const shouldRemove = (entry: BankEntry) =>
        entry.id === id || getParentId(entry) === id;
      setEntries((prev) => prev.filter((entry) => !shouldRemove(entry)));
      setAllEntries((prev) => prev.filter((entry) => !shouldRemove(entry)));

      if (parent) {
        const nextChildCount = Math.max(
          0,
          getChildEntriesFor(parent, entries).length - 1,
        );
        await persistParentChildCount(parent, nextChildCount);
      }
    } catch (err) {
      showErrorToast(err, {
        title: "Could not delete entry",
        fallbackDescription: "Please try deleting the entry again.",
      });
    }
  }

  async function handleBulkDelete() {
    if (selectedEntryIds.size === 0) return;

    const selectedIds = new Set(selectedEntryIds);
    const selectedEntries = allEntries.filter((entry) =>
      selectedIds.has(entry.id),
    );
    const selectedRootIds = new Set(
      selectedEntries
        .filter((entry) => !isChildEntry(entry))
        .map((entry) => entry.id),
    );
    const idsToRemove = new Set(selectedIds);
    for (const entry of allEntries) {
      const parentId = getParentId(entry);
      if (parentId && selectedRootIds.has(parentId)) {
        idsToRemove.add(entry.id);
      }
    }

    const affectedParentIds = new Set<string>();
    for (const entry of selectedEntries) {
      const parentId = getParentId(entry);
      if (parentId && !selectedIds.has(parentId)) {
        affectedParentIds.add(parentId);
      }
    }

    try {
      for (const id of selectedIds) {
        const res = await fetch(`/api/bank/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Bulk delete failed");
      }

      const remainingEntries = allEntries.filter(
        (entry) => !idsToRemove.has(entry.id),
      );
      const parentsToUpdate = remainingEntries.filter((entry) =>
        affectedParentIds.has(entry.id),
      );

      for (const parent of parentsToUpdate) {
        const childCount = remainingEntries.filter(
          (entry) => getParentId(entry) === parent.id,
        ).length;
        const content = withChildCount(parent, childCount);
        const res = await fetch(`/api/bank/${parent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            confidenceScore: parent.confidenceScore,
          }),
        });
        if (!res.ok) throw new Error("Could not update parent bullet count");
      }

      clearEntrySelection();
      await handleDataRefresh({ silent: true });
      addToast({
        type: "success",
        title: `Deleted ${selectedIds.size} selected component${selectedIds.size === 1 ? "" : "s"}`,
      });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not delete selected entries",
        fallbackDescription: "Please try deleting the selected entries again.",
      });
      await handleDataRefresh({ silent: true });
    }
  }

  async function handleMoveSelectedBullets() {
    const targetParent = allEntries.find(
      (entry) => entry.id === moveTargetParentId,
    );
    const selectedBullets = getSelectedBulletEntries();
    if (!targetParent || selectedBullets.length === 0) return;

    const selectedBulletIds = new Set(selectedBullets.map((entry) => entry.id));
    const affectedParentIds = new Set<string>([targetParent.id]);
    for (const bullet of selectedBullets) {
      const oldParentId = getParentId(bullet);
      if (oldParentId) affectedParentIds.add(oldParentId);
    }

    const existingTargetChildren = allEntries.filter(
      (entry) =>
        getParentId(entry) === targetParent.id &&
        !selectedBulletIds.has(entry.id),
    );
    const movedBullets = selectedBullets.map((bullet, index) => {
      const description = String(bullet.content.description ?? "").trim();
      return {
        ...bullet,
        content: buildChildContentForParent(
          targetParent,
          description,
          existingTargetChildren.length + index,
        ),
      };
    });

    const movedById = new Map(
      movedBullets.map((bullet) => [bullet.id, bullet] as const),
    );
    const nextAllEntries = allEntries.map(
      (entry) => movedById.get(entry.id) ?? entry,
    );
    const parentCountById = new Map<string, number>();
    for (const parentId of affectedParentIds) {
      parentCountById.set(
        parentId,
        nextAllEntries.filter((entry) => getParentId(entry) === parentId)
          .length,
      );
    }
    const nextAllEntriesWithCounts = nextAllEntries.map((entry) => {
      const nextCount = parentCountById.get(entry.id);
      return typeof nextCount === "number"
        ? { ...entry, content: withChildCount(entry, nextCount) }
        : entry;
    });

    try {
      for (const bullet of movedBullets) {
        const res = await fetch(`/api/bank/${bullet.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: bullet.content,
            confidenceScore: bullet.confidenceScore,
          }),
        });
        if (!res.ok) throw new Error("Could not move bullet");
      }

      for (const parent of nextAllEntriesWithCounts.filter((entry) =>
        affectedParentIds.has(entry.id),
      )) {
        const res = await fetch(`/api/bank/${parent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: parent.content,
            confidenceScore: parent.confidenceScore,
          }),
        });
        if (!res.ok) throw new Error("Could not update parent count");
      }

      setEntries((prev) =>
        prev.map((entry) => {
          const next = nextAllEntriesWithCounts.find(
            (item) => item.id === entry.id,
          );
          return next ?? entry;
        }),
      );
      setAllEntries(nextAllEntriesWithCounts);
      setMoveBulletsOpen(false);
      clearEntrySelection();
      addToast({
        type: "success",
        title: `Moved ${movedBullets.length} bullet${movedBullets.length === 1 ? "" : "s"}`,
      });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not move bullets",
        fallbackDescription: "Please try moving the selected bullets again.",
      });
      await handleDataRefresh({ silent: true });
    }
  }

  async function uploadFile(
    file: File,
    options?: { force?: boolean },
  ): Promise<BankUploadResponse | null> {
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch(
      `/api/upload${options?.force ? "?force=true" : ""}`,
      {
        method: "POST",
        body: formData,
      },
    );
    const uploadData = await uploadRes.json();

    if (uploadRes.status === 409 && uploadData.existing) {
      setUploadConflict({ file, existing: uploadData.existing });
      return null;
    }

    if (!uploadRes.ok) {
      throw new Error(
        uploadData.error || `Upload failed (${uploadRes.status})`,
      );
    }
    if (!uploadData.success) {
      throw new Error(uploadData.error || "Upload returned unsuccessful");
    }

    return uploadData;
  }

  async function finishSuccessfulUpload(
    file: File,
    uploadData: BankUploadResponse,
  ) {
    await handleDataRefresh({ silent: true });
    const documentId = uploadData.document?.id;

    if (documentId) {
      const reviewRes = await fetch(
        `/api/bank?sourceDocumentId=${encodeURIComponent(documentId)}`,
      );
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        const reviewEntries = (reviewData.entries || []) as BankEntry[];
        setActiveDocumentId(documentId);
        setUploadReview({
          documentId,
          filename: uploadData.document?.filename || file.name,
          entries: reviewEntries,
        });
      }
    }

    const count = uploadData.entriesCreated ?? 0;
    addToast({
      type: "success",
      title: uploadSuccessMessage(count, file.name),
    });

    requestAnimationFrame(() => {
      entriesListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function handleReviewUpdate(
    id: string,
    content: Record<string, unknown>,
  ) {
    await handleUpdate(id, content);
    setUploadReview((prev) =>
      prev
        ? {
            ...prev,
            entries: prev.entries.map((entry) =>
              entry.id === id ? { ...entry, content } : entry,
            ),
          }
        : prev,
    );
  }

  function handleReviewDelete(id: string) {
    void handleDelete(id);
    setUploadReview((prev) =>
      prev
        ? {
            ...prev,
            entries: prev.entries.filter(
              (entry) => entry.id !== id && getParentId(entry) !== id,
            ),
          }
        : prev,
    );
  }

  async function handleReviewMergeChildren(
    parsedEntry: BankEntry,
    existingEntry: BankEntry,
    parsedChildren: BankEntry[],
  ) {
    const existingChildren = getChildEntriesFor(existingEntry, allEntries);
    const descriptions = new Set(
      existingChildren.map((child) =>
        normalizeReviewText(child.content.description),
      ),
    );
    const childrenToCreate = parsedChildren.filter((child) => {
      const description = normalizeReviewText(child.content.description);
      return description && !descriptions.has(description);
    });

    try {
      const createdEntries: BankEntry[] = [];
      for (const child of childrenToCreate) {
        const description = String(child.content.description ?? "").trim();
        const content = buildChildContentForParent(
          existingEntry,
          description,
          existingChildren.length + createdEntries.length,
        );
        const res = await fetch("/api/bank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "bullet",
            content,
            sourceDocumentId: existingEntry.sourceDocumentId,
            sourceSection:
              typeof content.sourceSection === "string"
                ? content.sourceSection
                : existingEntry.category,
            confidenceScore: child.confidenceScore,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Merge failed");
        createdEntries.push({
          id: data.id,
          userId: existingEntry.userId,
          category: "bullet",
          content,
          sourceDocumentId: existingEntry.sourceDocumentId,
          confidenceScore: child.confidenceScore,
          createdAt: nowIso(),
        });
      }

      const nextChildCount = existingChildren.length + createdEntries.length;
      if (createdEntries.length > 0) {
        await persistParentChildCount(existingEntry, nextChildCount);
      }

      const updateExistingParent = (entry: BankEntry) =>
        entry.id === existingEntry.id
          ? { ...entry, content: withChildCount(entry, nextChildCount) }
          : entry;
      setEntries((prev) =>
        prev.map(updateExistingParent).concat(createdEntries),
      );
      setAllEntries((prev) =>
        prev.map(updateExistingParent).concat(createdEntries),
      );
      handleReviewDelete(parsedEntry.id);
      addToast({
        type: "success",
        title:
          createdEntries.length > 0
            ? `Merged ${createdEntries.length} bullet${createdEntries.length === 1 ? "" : "s"}`
            : "Duplicate discarded",
      });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not merge duplicate",
        fallbackDescription: "Please try merging the component again.",
      });
    }
  }

  async function handleReviewAttachBullet(
    bullet: BankEntry,
    parent: BankEntry,
  ) {
    const description = String(bullet.content.description ?? "").trim();
    if (!description) return;

    const oldParentId = getParentId(bullet);
    const existingTargetChildren = allEntries.filter(
      (entry) => getParentId(entry) === parent.id && entry.id !== bullet.id,
    );
    const content = buildChildContentForParent(
      parent,
      description,
      existingTargetChildren.length,
    );

    try {
      const res = await fetch(`/api/bank/${bullet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          confidenceScore: bullet.confidenceScore,
        }),
      });
      if (!res.ok) throw new Error("Attach failed");

      const nextAllEntries = allEntries.map((entry) =>
        entry.id === bullet.id ? { ...entry, content } : entry,
      );
      const parentIdsToUpdate = new Set([parent.id]);
      if (oldParentId) parentIdsToUpdate.add(oldParentId);

      const updatedParents = new Map<string, Record<string, unknown>>();
      for (const parentId of parentIdsToUpdate) {
        const parentEntry = nextAllEntries.find(
          (entry) => entry.id === parentId,
        );
        if (
          !parentEntry ||
          !["experience", "project"].includes(parentEntry.category)
        ) {
          continue;
        }
        const childCount = nextAllEntries.filter(
          (entry) => getParentId(entry) === parentEntry.id,
        ).length;
        const parentContent = withChildCount(parentEntry, childCount);
        updatedParents.set(parentEntry.id, parentContent);
        const parentRes = await fetch(`/api/bank/${parentEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: parentContent,
            confidenceScore: parentEntry.confidenceScore,
          }),
        });
        if (!parentRes.ok) throw new Error("Parent count update failed");
      }

      const applyUpdates = (items: BankEntry[]) =>
        items.map((entry) => {
          if (entry.id === bullet.id) return { ...entry, content };
          const parentContent = updatedParents.get(entry.id);
          return parentContent ? { ...entry, content: parentContent } : entry;
        });

      setEntries(applyUpdates);
      setAllEntries(applyUpdates);
      setUploadReview((prev) =>
        prev ? { ...prev, entries: applyUpdates(prev.entries) } : prev,
      );
      addToast({
        type: "success",
        title: "Bullet attached",
      });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not attach bullet",
        fallbackDescription: "Please try attaching the bullet again.",
      });
      await handleDataRefresh({ silent: true });
    }
  }

  async function handleFileUpload(file: File, options?: { force?: boolean }) {
    setUploading(true);
    setError(null);
    try {
      const uploadData = await uploadFile(file, options);
      if (uploadData) {
        await finishSuccessfulUpload(file, uploadData);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showErrorToast(err, {
        title: "Could not upload document",
        fallbackDescription: "Please check the file and try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function replaceConflictingUpload() {
    if (!uploadConflict) return;
    const file = uploadConflict.file;
    setUploadConflict(null);
    await handleFileUpload(file, { force: true });
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  }

  async function handleDriveSelect(file: {
    id: string;
    name: string;
    mimeType: string;
  }) {
    setDriveImporting(true);
    try {
      const downloadRes = await fetch(
        `/api/google/drive/files/${file.id}/download`,
      );
      if (!downloadRes.ok) throw new Error("Failed to download from Drive");
      const blob = await downloadRes.blob();
      const localFile = new File([blob], file.name, { type: file.mimeType });
      await handleFileUpload(localFile);
    } catch (err) {
      setError(getErrorMessage(err));
      showErrorToast(err, {
        title: "Could not import Drive file",
        fallbackDescription: "Please try selecting the file again.",
      });
    } finally {
      setDriveImporting(false);
    }
  }

  async function handleDataRefresh(options?: { silent?: boolean }) {
    await fetchEntries(options);
    refreshAllEntries();
    setSourceRefreshKey((k) => k + 1);
  }

  // Pass category counts up to the umbrella for the rail counts (sync via callback).
  useEffect(() => {
    if (!onCategoryCountsChange) return;
    const next: Partial<Record<BankCategory | "all", number>> = {
      all: allEntries.filter((entry) => !isChildEntry(entry)).length,
    };
    for (const cat of BANK_CATEGORIES) {
      next[cat] = categoryCounts[cat] ?? 0;
    }
    onCategoryCountsChange(next);
  }, [allEntries, categoryCounts, onCategoryCountsChange]);

  // Allow the umbrella's rail to drive activeCategory.
  useEffect(() => {
    if (externalActiveCategory == null) return;
    setActiveCategory(externalActiveCategory);
    setReviewOnly(false);
  }, [externalActiveCategory]);

  useEffect(() => {
    onActiveCategoryChange?.(activeCategory);
  }, [activeCategory, onActiveCategoryChange]);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Upload overlay for drag-and-drop */}
        <UploadOverlay onComplete={() => handleDataRefresh()} />

        <Dialog
          open={!!uploadConflict}
          onOpenChange={(open) => {
            if (!open) setUploadConflict(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{uploadT("replace.title")}</DialogTitle>
              <DialogDescription>
                {uploadConflict
                  ? `Looks like you uploaded "${uploadConflict.existing.filename}" on ${formatExistingUploadDate(getExistingUploadTimestamp(uploadConflict.existing), locale)}. Replace it, or cancel?`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadConflict(null)}>
                {commonT("cancel")}
              </Button>
              <Button onClick={replaceConflictingUpload} autoFocus>
                {uploadT("actions.replace")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!uploadReview}
          onOpenChange={(open) => {
            if (!open) setUploadReview(null);
          }}
        >
          <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden p-0">
            <DialogHeader className="border-b px-6 py-5">
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                {dialogsT("review.title")}
              </DialogTitle>
              <DialogDescription>
                {uploadReview
                  ? dialogsT("review.description", {
                      filename: uploadReview.filename,
                      count: uploadReview.entries.length,
                    })
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[68vh] overflow-hidden">
              {uploadReview ? (
                <UploadReviewEntries
                  entries={uploadReview.entries}
                  existingEntries={allEntries.filter(
                    (entry) =>
                      entry.sourceDocumentId !== uploadReview.documentId,
                  )}
                  onUpdate={handleReviewUpdate}
                  onDelete={handleReviewDelete}
                  onMergeChildren={handleReviewMergeChildren}
                  onAttachBullet={handleReviewAttachBullet}
                />
              ) : null}
            </div>
            <DialogFooter className="border-t px-6 py-4">
              <Button variant="outline" onClick={() => setUploadReview(null)}>
                {dialogsT("review.keepEditing")}
              </Button>
              <Button onClick={() => setUploadReview(null)}>
                {dialogsT("review.done")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={moveBulletsOpen} onOpenChange={setMoveBulletsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogsT("moveBullets.title")}</DialogTitle>
              <DialogDescription>
                {dialogsT("moveBullets.description", {
                  count: selectedBulletCount,
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label
                htmlFor="move-bullets-target"
                className="text-sm font-medium"
              >
                {dialogsT("moveBullets.parentComponent")}
              </label>
              <select
                id="move-bullets-target"
                value={moveTargetParentId}
                onChange={(event) => setMoveTargetParentId(event.target.value)}
                className="h-11 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm"
              >
                {parentCandidates.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {getEntryLabel(entry)} ({CATEGORY_LABELS[entry.category]})
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMoveBulletsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleMoveSelectedBullets()}
                disabled={!moveTargetParentId || selectedBulletCount === 0}
              >
                Move bullets
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div
          className="flex flex-wrap items-center gap-2"
          data-testid="bank-actions"
        >
          <AddEntryDialog
            onCreate={handleCreate}
            open={addEntryOpen}
            onOpenChange={setAddEntryOpen}
          />
          <DriveFilePicker
            onSelect={handleDriveSelect}
            accept={["application/pdf", "text/plain"]}
            trigger={
              <Button variant="outline" disabled={driveImporting}>
                {driveImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <HardDrive className="h-4 w-4 mr-2" />
                )}
                {driveImporting ? "Importing..." : "From Drive"}
              </Button>
            }
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title={a11yT("uploadFile")}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>

        <div className="space-y-6">
          {showLibraryTools ? (
            <>
              {/* Keep this in flow: <main> is the scrollport, and nested sticky filter bars can trap wheel scrolling. */}
              <Suspense fallback={<BankFiltersSkeleton />}>
                <div
                  className="border-b border-border/50 bg-background/95 py-3"
                  data-testid="bank-search-filters"
                >
                  <SearchBar
                    ref={searchInputRef}
                    query={query}
                    onQueryChange={setQuery}
                    activeCategory={activeCategory}
                    onCategoryChange={(category) => {
                      setActiveCategory(category);
                      setReviewOnly(false);
                    }}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    counts={categoryCounts}
                    controls={
                      <>
                        <div className="flex items-center rounded-[var(--radius)] bg-muted p-1">
                          <DisplayModeButton
                            active={displayMode === "category"}
                            onClick={() => {
                              setDisplayMode("category");
                              setActiveDocumentId(null);
                            }}
                          >
                            Category
                          </DisplayModeButton>
                          <DisplayModeButton
                            active={displayMode === "source"}
                            onClick={() => setDisplayMode("source")}
                          >
                            Source
                          </DisplayModeButton>
                        </div>
                        <div className="flex items-center rounded-[var(--radius)] bg-muted p-1">
                          <IconModeButton
                            active={layoutMode === "grid"}
                            onClick={() => setLayoutMode("grid")}
                            label="Grid view"
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </IconModeButton>
                          <IconModeButton
                            active={layoutMode === "table"}
                            onClick={() => setLayoutMode("table")}
                            label="Table view"
                          >
                            <Rows3 className="h-4 w-4" />
                          </IconModeButton>
                        </div>
                        {needsReviewCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewOnly((current) => !current);
                              setActiveCategory("all");
                            }}
                            className={cn(
                              "inline-flex min-h-10 items-center gap-2 rounded-[var(--radius)] px-3 text-sm font-medium transition-colors",
                              reviewOnly
                                ? "bg-warning/15 text-warning"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                            )}
                          >
                            <AlertTriangle className="h-4 w-4" />
                            Needs review {needsReviewCount}
                          </button>
                        ) : null}
                      </>
                    }
                  />
                </div>
              </Suspense>

              {/* Source Files */}
              {displayMode === "source" ? (
                <Suspense fallback={<SkeletonCard className="min-h-32" />}>
                  <div data-testid="bank-source-documents">
                    <SourceDocuments
                      refreshKey={sourceRefreshKey}
                      onFilterByDocument={setActiveDocumentId}
                      activeDocumentId={activeDocumentId}
                      onDelete={handleDataRefresh}
                      onDocumentsChange={setSourceDocuments}
                    />
                  </div>
                </Suspense>
              ) : null}

              <BulkActionBar
                selectedCount={selectedVisibleCount}
                totalCount={sortedEntries.length}
                onSelectAll={selectAllVisibleEntries}
                onDeselectAll={clearEntrySelection}
                onDelete={() => void handleBulkDelete()}
                onAddToResume={handleAddSelectedToResume}
                onExport={handleExportSelected}
                selectedBulletCount={selectedBulletCount}
                onMoveBullets={openMoveBulletsDialog}
              />
            </>
          ) : null}

          {/* Content */}
          <Suspense fallback={<BankEntriesSkeleton />}>
            {loading ? (
              <BankEntriesSkeleton />
            ) : error ? (
              <ErrorState
                title={a11yT("failedToLoadDocuments")}
                message={error}
                onRetry={fetchEntries}
                variant="card"
              />
            ) : sortedEntries.length === 0 ? (
              <StandardEmptyState
                icon={Database}
                title={
                  query || activeCategory !== "all"
                    ? "No matching entries"
                    : "Start with your resume"
                }
                description={
                  query || activeCategory !== "all"
                    ? "Try adjusting your search or filters."
                    : "Upload a resume or career document and Slothing will turn it into reusable building blocks."
                }
                action={
                  !query && activeCategory === "all" ? (
                    <div className="flex flex-col items-center gap-3">
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        or{" "}
                        <button
                          type="button"
                          className="font-medium text-foreground underline underline-offset-4"
                          onClick={() => setAddEntryOpen(true)}
                        >
                          add an entry manually
                        </button>{" "}
                        &middot;{" "}
                        <DriveFilePicker
                          onSelect={handleDriveSelect}
                          accept={["application/pdf", "text/plain"]}
                          trigger={
                            <button
                              type="button"
                              className="font-medium text-foreground underline underline-offset-4"
                            >
                              pick from Drive
                            </button>
                          }
                        />{" "}
                        &middot; or drop files here
                      </div>
                    </div>
                  ) : null
                }
              />
            ) : (
              <div
                ref={entriesListRef}
                className="space-y-8 animate-in fade-in duration-200"
                data-testid="bank-entries"
              >
                {displayMode === "source"
                  ? sourceGroupedEntries.map((group) => (
                      <div key={group.key}>
                        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                          {group.document?.filename ?? "Manual entries"}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({group.entries.length})
                          </span>
                        </h2>
                        <p className="mb-3 text-sm text-muted-foreground">
                          {group.document
                            ? "Parsed components from this uploaded source."
                            : "Components added directly in the bank."}
                        </p>
                        <EntryCollection
                          layoutMode={layoutMode}
                          displayMode={displayMode}
                          entries={group.entries}
                          allEntries={entries}
                          sourceDocuments={sourceDocuments}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                          onCreateChild={handleCreateChild}
                          onReorderChild={handleReorderChild}
                          selectedIds={selectedEntryIds}
                          onToggleSelect={toggleEntrySelection}
                          onSelectEntries={selectEntries}
                          onDeselectEntries={deselectEntries}
                          reviewEntries={allEntries}
                        />
                      </div>
                    ))
                  : groupedEntries.map((group) => (
                      <div key={group.category}>
                        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                          {CATEGORY_LABELS[group.category]}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({group.entries.length})
                          </span>
                        </h2>
                        <EntryCollection
                          layoutMode={layoutMode}
                          displayMode={displayMode}
                          entries={group.entries}
                          allEntries={entries}
                          sourceDocuments={sourceDocuments}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                          onCreateChild={handleCreateChild}
                          onReorderChild={handleReorderChild}
                          selectedIds={selectedEntryIds}
                          onToggleSelect={toggleEntrySelection}
                          onSelectEntries={selectEntries}
                          onDeselectEntries={deselectEntries}
                          reviewEntries={allEntries}
                        />
                      </div>
                    ))}
                {hasMoreEntries ? (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        void fetchEntries({ silent: true, cursor: nextCursor })
                      }
                      disabled={loadingMore || !nextCursor}
                    >
                      {loadingMore ? "Loading..." : "Load more entries"}
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
}

function DisplayModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-8 rounded-[var(--radius)] px-3 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function IconModeButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[var(--radius)] transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function BankFiltersSkeleton() {
  return (
    <div className="border-b border-border/50 bg-background/95 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <SkeletonButton className="h-10 w-64" />
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonButton key={index} className="h-10 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function BankEntriesSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonChunkCard key={index} />
      ))}
    </div>
  );
}

function EntryCollection({
  layoutMode,
  displayMode,
  entries,
  allEntries,
  sourceDocuments,
  onUpdate,
  onDelete,
  onCreateChild,
  onReorderChild,
  selectedIds,
  onToggleSelect,
  onSelectEntries,
  onDeselectEntries,
  reviewEntries,
}: {
  layoutMode: LayoutMode;
  displayMode: DisplayMode;
  entries: BankEntry[];
  allEntries: BankEntry[];
  sourceDocuments: SourceDocument[];
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onCreateChild: (parent: BankEntry, description: string) => void;
  onReorderChild: (
    parent: BankEntry,
    childId: string,
    direction: "up" | "down",
  ) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectEntries: (ids: string[]) => void;
  onDeselectEntries: (ids: string[]) => void;
  reviewEntries: BankEntry[];
}) {
  if (layoutMode === "table") {
    return (
      <EntryTable
        entries={entries}
        allEntries={allEntries}
        displayMode={displayMode}
        sourceDocuments={sourceDocuments}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onCreateChild={onCreateChild}
        onReorderChild={onReorderChild}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onSelectEntries={onSelectEntries}
        onDeselectEntries={onDeselectEntries}
        reviewEntries={reviewEntries}
      />
    );
  }

  function getEntryKey(entry: BankEntry): string {
    return entry.id;
  }

  function renderEntryCard({ item: entry }: { item: BankEntry }) {
    return (
      <ChunkCard
        entry={entry}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onCreateChild={onCreateChild}
        onReorderChild={onReorderChild}
        childEntries={getChildEntriesFor(entry, allEntries)}
        selected={selectedIds.has(entry.id)}
        onToggleSelect={onToggleSelect}
        anySelected={selectedIds.size > 0}
        highlighted={isBulletNeedsReview(entry, reviewEntries)}
      />
    );
  }

  return (
    <VirtualGrid
      items={entries}
      getKey={getEntryKey}
      estimateSize={ESTIMATED_CARD_HEIGHT_BANK}
      gapPx={BANK_GRID_GAP_PX}
      minColumnWidthPx={MIN_BANK_COLUMN_WIDTH_PX}
      className="max-h-[calc(100vh-22rem)]"
      renderItem={renderEntryCard}
    />
  );
}

function EntryTable({
  entries,
  allEntries,
  displayMode,
  sourceDocuments,
  onUpdate,
  onDelete,
  onCreateChild,
  onReorderChild,
  selectedIds,
  onToggleSelect,
  onSelectEntries,
  onDeselectEntries,
  reviewEntries,
}: {
  entries: BankEntry[];
  allEntries: BankEntry[];
  displayMode: DisplayMode;
  sourceDocuments: SourceDocument[];
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onCreateChild: (parent: BankEntry, description: string) => void;
  onReorderChild: (
    parent: BankEntry,
    childId: string,
    direction: "up" | "down",
  ) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectEntries: (ids: string[]) => void;
  onDeselectEntries: (ids: string[]) => void;
  reviewEntries: BankEntry[];
}) {
  const a11yT = useA11yTranslations();

  // Future work: virtualize table rows separately from the document grid.
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const sourceNames = new Map(
    sourceDocuments.map((document) => [document.id, document.filename]),
  );
  const allSelected =
    entries.length > 0 && entries.every((entry) => selectedIds.has(entry.id));
  const showCategoryColumn = displayMode === "source";
  const columnCount = showCategoryColumn ? 8 : 7;

  function toggleRow(entryId: string) {
    setExpandedRowId((current) => (current === entryId ? null : entryId));
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border bg-card">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full text-left text-sm",
            showCategoryColumn ? "min-w-[860px]" : "min-w-[760px]",
          )}
        >
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th
                className="w-10 px-3 py-3 font-medium"
                aria-label={a11yT("expand")}
              />
              <th className="w-12 px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {
                    const ids = entries.map((entry) => entry.id);
                    if (allSelected) {
                      onDeselectEntries(ids);
                    } else {
                      onSelectEntries(ids);
                    }
                  }}
                  className="h-4 w-4 rounded border-input accent-primary"
                  aria-label={a11yT("selectAllVisibleComponents")}
                />
              </th>
              <th className="px-4 py-3 font-medium">Component</th>
              {showCategoryColumn ? (
                <th className="px-4 py-3 font-medium">Category</th>
              ) : null}
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Bullets</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map((entry) => {
              const children = getChildEntriesFor(entry, allEntries);
              const expanded = expandedRowId === entry.id;
              const bulletCount = Number(
                entry.content.childCount ?? children.length,
              );
              const sourceName = entry.sourceDocumentId
                ? (sourceNames.get(entry.sourceDocumentId) ?? "—")
                : "Manual";
              return (
                <Fragment key={entry.id}>
                  <tr
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    onClick={() => toggleRow(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleRow(entry.id);
                      }
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-muted/30",
                      isBulletNeedsReview(entry, reviewEntries) &&
                        "bg-warning/5",
                    )}
                  >
                    <td className="px-3 py-3 text-muted-foreground">
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expanded && "rotate-90",
                        )}
                        aria-hidden="true"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(entry.id)}
                        onChange={() => onToggleSelect(entry.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="h-4 w-4 rounded border-input accent-primary"
                        aria-label={`Select ${getEntryLabel(entry)}`}
                      />
                    </td>
                    <td className="max-w-[320px] px-4 py-3">
                      <div className="truncate font-medium">
                        {getEntryLabel(entry)}
                      </div>
                      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {String(
                          entry.content.description ??
                            entry.content.location ??
                            entry.content.field ??
                            "",
                        )}
                      </div>
                      {getBulletReviewReason(entry, reviewEntries) ? (
                        <div className="mt-1 text-xs font-medium text-warning">
                          {getBulletReviewReason(entry, reviewEntries)}
                        </div>
                      ) : null}
                    </td>
                    {showCategoryColumn ? (
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[entry.category]}
                        </Badge>
                      </td>
                    ) : null}
                    <td className="max-w-[220px] px-4 py-3">
                      <span
                        className="block truncate text-muted-foreground"
                        title={sourceName}
                      >
                        {sourceName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {bulletCount}
                    </td>
                    <td className="px-4 py-3">
                      <ConfidenceBadge score={entry.confidenceScore ?? 0} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateOnly(entry.createdAt)}
                    </td>
                  </tr>
                  {expanded ? (
                    <tr>
                      <td colSpan={columnCount} className="bg-muted/20 p-4">
                        <ChunkCard
                          entry={entry}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          onCreateChild={onCreateChild}
                          onReorderChild={onReorderChild}
                          childEntries={children}
                          forceExpanded
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  const percent = Math.round(score * 100);

  if (score >= 0.85) {
    return <span className="text-muted-foreground">{percent}%</span>;
  }

  if (score >= 0.7) {
    return <Badge variant="warning">{percent}%</Badge>;
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      {percent}%
    </Badge>
  );
}

function UploadReviewEntries({
  entries,
  existingEntries,
  onUpdate,
  onDelete,
  onMergeChildren,
  onAttachBullet,
}: {
  entries: BankEntry[];
  existingEntries: BankEntry[];
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onMergeChildren: (
    parsedEntry: BankEntry,
    existingEntry: BankEntry,
    parsedChildren: BankEntry[],
  ) => void;
  onAttachBullet: (bullet: BankEntry, parent: BankEntry) => void;
}) {
  const a11yT = useA11yTranslations();

  const roots = useMemo(() => entries.filter(isReviewRootEntry), [entries]);
  const needsReviewBullets = useMemo(
    () => entries.filter((entry) => isBulletNeedsReview(entry, entries)),
    [entries],
  );
  const reviewItems = useMemo(() => {
    const reviewIds = new Set(needsReviewBullets.map((entry) => entry.id));
    return [
      ...needsReviewBullets,
      ...roots.filter((entry) => !reviewIds.has(entry.id)),
    ];
  }, [needsReviewBullets, roots]);
  const parentCandidates = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.category === "experience" || entry.category === "project",
      ),
    [entries],
  );
  const existingKeys = useMemo(() => {
    const keys = new Map<string, BankEntry[]>();
    for (const entry of existingEntries) {
      const key = reviewDuplicateKey(entry);
      const group = keys.get(key) ?? [];
      group.push(entry);
      keys.set(key, group);
    }
    return keys;
  }, [existingEntries]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attachParentId, setAttachParentId] = useState("");

  useEffect(() => {
    if (reviewItems.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !reviewItems.some((entry) => entry.id === selectedId)) {
      setSelectedId(reviewItems[0].id);
    }
  }, [reviewItems, selectedId]);

  const selectedEntry =
    reviewItems.find((entry) => entry.id === selectedId) ??
    reviewItems[0] ??
    null;
  const childEntries = selectedEntry
    ? getChildEntriesFor(selectedEntry, entries)
    : [];
  const selectedReviewReason = selectedEntry
    ? getBulletReviewReason(selectedEntry, entries)
    : null;
  const duplicateEntries = selectedEntry
    ? (existingKeys.get(reviewDuplicateKey(selectedEntry)) ?? [])
    : [];
  const selectedWarnings = selectedEntry
    ? getReviewWarnings(selectedEntry, childEntries, duplicateEntries)
    : [];
  const categoryCounts = reviewItems.reduce<Record<string, number>>(
    (counts, entry) => {
      counts[entry.category] = (counts[entry.category] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const reviewSummary = entries.reduce(
    (summary, entry) => {
      if (entry.category === "bullet") summary.bullets += 1;
      if (isBulletNeedsReview(entry, entries)) summary.needsReview += 1;
      const duplicates =
        isReviewRootEntry(entry) && entry.category !== "bullet"
          ? (existingKeys.get(reviewDuplicateKey(entry)) ?? [])
          : [];
      if (duplicates.length > 0) summary.duplicates += 1;
      return summary;
    },
    { bullets: 0, needsReview: 0, duplicates: 0 },
  );

  if (entries.length === 0) {
    return (
      <StandardEmptyState
        icon={Database}
        title={a11yT("noComponentsDetected")}
        description="The file uploaded, but there were no structured resume components to review."
      />
    );
  }

  return (
    <div className="grid h-[68vh] min-h-0 md:grid-cols-[320px_1fr]">
      <aside className="min-h-0 border-r bg-muted/20">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-display text-sm font-semibold tracking-tight">
              Detected components
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-2xs">
              {roots.length} roots
            </Badge>
            <Badge variant="outline" className="text-2xs">
              {reviewSummary.bullets} bullets
            </Badge>
            {reviewSummary.needsReview > 0 ? (
              <Badge variant="warning" className="text-2xs">
                {reviewSummary.needsReview} review
              </Badge>
            ) : null}
            {reviewSummary.duplicates > 0 ? (
              <Badge variant="warning" className="text-2xs">
                {reviewSummary.duplicates} duplicates
              </Badge>
            ) : null}
            {BANK_CATEGORIES.filter((category) => categoryCounts[category]).map(
              (category) => (
                <Badge key={category} variant="secondary" className="text-2xs">
                  {CATEGORY_LABELS[category]} {categoryCounts[category]}
                </Badge>
              ),
            )}
          </div>
        </div>
        <div className="max-h-full space-y-1 overflow-y-auto p-2">
          {reviewItems.map((entry) => {
            const active = entry.id === selectedEntry?.id;
            const children = getChildEntriesFor(entry, entries);
            const duplicates =
              existingKeys.get(reviewDuplicateKey(entry)) ?? [];
            const warnings = getReviewWarnings(entry, children, duplicates);
            const reviewReason = getBulletReviewReason(entry, entries);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedId(entry.id)}
                className={cn(
                  "w-full rounded-[var(--radius)] border border-transparent px-3 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : reviewReason
                      ? "border-warning/40 bg-warning/5 hover:bg-warning/10"
                      : "hover:border-border hover:bg-background/70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-sm font-medium">
                    {getEntryLabel(entry)}
                  </span>
                  <Badge variant={active ? "default" : "outline"}>
                    {CATEGORY_LABELS[entry.category]}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{children.length} bullets</span>
                  {reviewReason ? (
                    <span className="text-warning">{reviewReason}</span>
                  ) : null}
                  <span>
                    {Math.round((entry.confidenceScore ?? 0) * 100)}% confidence
                  </span>
                  {warnings.length > 0 ? (
                    <span className="text-warning">
                      {warnings.length} warning
                      {warnings.length === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
      <section className="min-h-0 overflow-y-auto p-5">
        {selectedEntry ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Review component
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                  {getEntryLabel(selectedEntry)}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {CATEGORY_LABELS[selectedEntry.category]}
                </Badge>
                <Badge variant="success">
                  {Math.round((selectedEntry.confidenceScore ?? 0) * 100)}%
                  confidence
                </Badge>
                {childEntries.length > 0 ? (
                  <Badge variant="outline">
                    {childEntries.length} bullet components
                  </Badge>
                ) : null}
                {selectedWarnings.map((warning) => (
                  <Badge key={warning} variant="warning">
                    {warning}
                  </Badge>
                ))}
              </div>
            </div>
            {duplicateEntries.length > 0 ? (
              <DuplicateResolutionPanel
                parsedEntry={selectedEntry}
                existingEntry={duplicateEntries[0]}
                parsedChildren={childEntries}
                existingChildren={getChildEntriesFor(
                  duplicateEntries[0],
                  existingEntries,
                )}
                onDiscard={() => onDelete(selectedEntry.id)}
                onMergeChildren={() =>
                  onMergeChildren(
                    selectedEntry,
                    duplicateEntries[0],
                    childEntries,
                  )
                }
              />
            ) : null}
            {selectedReviewReason ? (
              <div className="rounded-[var(--radius)] border border-warning/35 bg-warning/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge variant="warning">{selectedReviewReason}</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Attach this bullet to the experience or project it belongs
                      under.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <select
                    value={attachParentId || parentCandidates[0]?.id || ""}
                    onChange={(event) => setAttachParentId(event.target.value)}
                    className="h-11 flex-1 rounded-[var(--radius)] border border-input bg-background px-3 text-sm"
                  >
                    {parentCandidates.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {getEntryLabel(entry)} (
                        {CATEGORY_LABELS[entry.category]})
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => {
                      const parent = parentCandidates.find(
                        (entry) =>
                          entry.id ===
                          (attachParentId || parentCandidates[0]?.id || ""),
                      );
                      if (parent && selectedEntry) {
                        onAttachBullet(selectedEntry, parent);
                      }
                    }}
                    disabled={parentCandidates.length === 0}
                  >
                    Attach bullet
                  </Button>
                </div>
              </div>
            ) : null}
            {selectedWarnings.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedWarnings.map((warning) => (
                  <div
                    key={warning}
                    className="rounded-[var(--radius)] border border-border/70 bg-background/60 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{warning}</span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {warning === "No bullets"
                        ? "Add bullet components later or reject this component if it is not useful."
                        : warning === "Missing role details"
                          ? "Open Edit and correct the missing parsed fields."
                          : warning === "Possible duplicate"
                            ? "Compare with your existing bank before keeping this copy."
                            : "Open Edit and confirm the parsed fields."}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            <ChunkCard
              key={selectedEntry.id}
              entry={selectedEntry}
              onUpdate={onUpdate}
              onDelete={onDelete}
              childEntries={childEntries}
            />
          </div>
        ) : (
          <StandardEmptyState
            icon={Database}
            title={a11yT("noComponentsLeft")}
            description="All detected components have been removed from this upload review."
          />
        )}
      </section>
    </div>
  );
}

function DuplicateResolutionPanel({
  parsedEntry,
  existingEntry,
  parsedChildren,
  existingChildren,
  onDiscard,
  onMergeChildren,
}: {
  parsedEntry: BankEntry;
  existingEntry: BankEntry;
  parsedChildren: BankEntry[];
  existingChildren: BankEntry[];
  onDiscard: () => void;
  onMergeChildren: () => void;
}) {
  const existingDescriptions = new Set(
    existingChildren.map((child) =>
      normalizeReviewText(child.content.description),
    ),
  );
  const newParsedChildren = parsedChildren.filter((child) => {
    const description = normalizeReviewText(child.content.description);
    return description && !existingDescriptions.has(description);
  });

  return (
    <div className="rounded-[var(--radius)] border border-warning/35 bg-warning/10 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">Possible duplicate</Badge>
            <span className="text-sm font-medium">
              {getEntryLabel(existingEntry)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            A similar component already exists. Merge only the new parsed
            bullets, discard this parsed copy, or keep both for now.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            Discard parsed copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onMergeChildren}
            disabled={parsedChildren.length === 0}
          >
            Merge bullets
          </Button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-border/70 bg-background/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Existing bank component
          </p>
          <p className="mt-1 text-sm font-medium">
            {getEntryLabel(existingEntry)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {existingChildren.length} bullet
            {existingChildren.length === 1 ? "" : "s"} already saved
          </p>
        </div>
        <div className="rounded-[var(--radius)] border border-border/70 bg-background/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Parsed copy
          </p>
          <p className="mt-1 text-sm font-medium">
            {getEntryLabel(parsedEntry)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {newParsedChildren.length} new bullet
            {newParsedChildren.length === 1 ? "" : "s"} to merge from{" "}
            {parsedChildren.length} parsed
          </p>
        </div>
      </div>
    </div>
  );
}
