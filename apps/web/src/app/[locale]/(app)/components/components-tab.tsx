"use client";

import { nowIso, toEpoch } from "@/lib/format/time";
import { TimeAgo } from "@/components/format/time-ago";

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
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  SearchBar,
  CATEGORY_LABELS,
  type SortOption,
} from "@/components/bank/search-bar";
import { ChunkCard } from "@/components/bank/chunk-card";
import {
  CATEGORY_FIELDS,
  cleanContent,
  FieldEditor,
  type FieldDef,
} from "@/components/bank/chunk-card";
import { BulkActionBar } from "@/components/bank/bulk-action-bar";
import { UploadOverlay } from "@/components/bank/upload-overlay";
import { ErrorState, getErrorMessage } from "@/components/ui/error-state";
import { BANK_CATEGORIES, type BankCategory, type BankEntry } from "@/types";
import {
  AlertTriangle,
  ChevronRight,
  Database,
  Edit3,
  FileText,
  HardDrive,
  LayoutGrid,
  Loader2,
  Plus,
  Rows3,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { SourceDocument } from "@/lib/db/profile-bank";
import { Badge } from "@/components/ui/badge";
import { useRegisterShortcuts } from "@/components/keyboard-shortcuts";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  AppPage,
  PageContent,
  PageHeader,
  StandardEmptyState,
} from "@/components/ui/page-layout";
import {
  OnboardingEmptyState,
  ZeroResultEmptyState,
} from "@/components/ui/empty-states";
import { pluralize } from "@/lib/text/pluralize";
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
  compareReviewSourceOrder,
  getReviewPreviewBboxes,
  getReviewSourceState,
} from "./upload-review-source-metadata";
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
import { getUploadReviewPreviewStatus } from "./upload-review-preview-status";
import { cn } from "@/lib/utils";
import {
  getBankEntryParentId,
  getBulletReviewReason,
  isBulletNeedsReview,
} from "@/lib/bank/bullet-review";
import {
  deriveCategoryCounts,
  deriveSourceDocumentCounts,
  deriveVisibleEntryCount,
  isChildEntry,
} from "@/lib/bank/count-derivation";
import { ComponentDetailDrawer } from "@/components/bank/component-detail-drawer";
import { ChunkPeek } from "@/components/bank/chunk-peek";
import { PdfPreview } from "@/components/bank/preview/pdf-preview";
import type { HighlightInput } from "@/components/bank/preview/highlight-layer";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

const DriveFilePicker = dynamic(
  () => import("@/components/google").then((m) => m.DriveFilePicker),
  {
    loading: () => (
      <Button variant="outline" size="sm" disabled>
        <HardDrive className="mr-2 h-4 w-4" />
        From Drive
      </Button>
    ),
    ssr: false,
  },
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
    mimeType?: string;
    size: number;
    extractedText?: string;
  };
}

interface UploadReviewState {
  documentId: string;
  filename: string;
  docType: string;
  mimeType?: string;
  entries: BankEntry[];
}

type DisplayMode = "category" | "source";
type LayoutMode = "grid" | "table";

function getParentId(entry: BankEntry): string | null {
  return getBankEntryParentId(entry);
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
  const institution = entry.content.institution
    ? String(entry.content.institution)
    : "";
  const degree = entry.content.degree ? String(entry.content.degree) : "";
  const issuer = entry.content.issuer ? String(entry.content.issuer) : "";

  if (title || company) return [title, company].filter(Boolean).join(" — ");
  if (entry.category === "education") {
    return [degree, institution].filter(Boolean).join(" — ") || "Education";
  }
  if (entry.category === "certification") {
    return [name, issuer].filter(Boolean).join(" — ") || "Certification";
  }
  return name || "Component";
}

function sortByPdfOrder(a: BankEntry, b: BankEntry): number {
  const orderDelta = compareReviewSourceOrder(a, b);
  if (orderDelta !== 0) return orderDelta;
  return a.id.localeCompare(b.id);
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

function scrollComponentsPageToTop(behavior: ScrollBehavior = "auto") {
  document
    .getElementById("main-content")
    ?.scrollTo({ top: 0, left: 0, behavior });
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

  // Drawer state — opened by clicking a card (grid view) or a table row body
  // (table view). The chevron in table view continues to control inline peek
  // and is wired separately inside EntryTable.
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
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
  const [isReviewParsingWithAi, setIsReviewParsingWithAi] = useState(false);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [moveBulletsOpen, setMoveBulletsOpen] = useState(false);
  const [moveTargetParentId, setMoveTargetParentId] = useState("");
  const { addToast } = useToast();
  const showErrorToast = useErrorToast();
  const { confirm: confirmAction, dialog: confirmActionDialog } =
    useConfirmDialog();

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

  const categoryCounts = useMemo(
    () => deriveCategoryCounts(allEntries),
    [allEntries],
  );

  const sourceDocumentCounts = useMemo(
    () => deriveSourceDocumentCounts(allEntries),
    [allEntries],
  );

  const needsReviewCount = useMemo(
    () =>
      allEntries.filter((entry) => isBulletNeedsReview(entry, allEntries))
        .length,
    [allEntries],
  );

  const visibleEntryCount = useMemo(
    () =>
      deriveVisibleEntryCount({
        reviewOnly,
        needsReviewCount,
        activeDocumentId,
        sourceDocumentCounts,
        categoryCounts,
        activeCategory,
      }),
    [
      reviewOnly,
      needsReviewCount,
      activeDocumentId,
      sourceDocumentCounts,
      categoryCounts,
      activeCategory,
    ],
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
      setUploadReview((prev) =>
        prev && prev.entries.some((entry) => entry.id === parent.id)
          ? {
              ...prev,
              entries: prev.entries
                .map((entry) =>
                  entry.id === parent.id
                    ? {
                        ...entry,
                        content: withChildCount(entry, nextChildCount),
                      }
                    : entry,
                )
                .concat(created),
            }
          : prev,
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
    let openedReview = false;

    if (documentId) {
      const reviewRes = await fetch(
        `/api/bank?sourceDocumentId=${encodeURIComponent(documentId)}`,
      );
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        const reviewEntries = (reviewData.entries || []) as BankEntry[];
        if (reviewEntries.length > 0) {
          try {
            window.localStorage.setItem(
              "slothing:dev:last-import",
              JSON.stringify({
                documentId,
                filename: uploadData.document?.filename || file.name,
                mimeType: uploadData.document?.mimeType || file.type,
                entryCount: reviewEntries.length,
                importedAt: nowIso(),
              }),
            );
          } catch {
            // Dev-only convenience; blocked storage should not affect uploads.
          }
          setActiveDocumentId(documentId);
          setUploadReview({
            documentId,
            docType: uploadData.document?.type || "other",
            filename: uploadData.document?.filename || file.name,
            mimeType: uploadData.document?.mimeType || file.type,
            entries: reviewEntries,
          });
          openedReview = true;
        } else {
          setUploadReview(null);
          setActiveDocumentId(null);
        }
      }
    }

    const count = uploadData.entriesCreated ?? 0;
    addToast({
      type: "success",
      title: uploadSuccessMessage(count, file.name),
    });

    if (openedReview) {
      requestAnimationFrame(() => {
        scrollComponentsPageToTop();
      });
    } else {
      requestAnimationFrame(() => {
        entriesListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  function closeUploadReview() {
    setUploadReview(null);
    setIsReviewParsingWithAi(false);
    requestAnimationFrame(() => {
      scrollComponentsPageToTop();
    });
  }

  async function refreshUploadReviewEntries(documentId: string) {
    const reviewRes = await fetch(
      `/api/bank?sourceDocumentId=${encodeURIComponent(documentId)}`,
    );
    if (!reviewRes.ok) return;

    const reviewData = await reviewRes.json();
    const reviewEntries = (reviewData.entries || []) as BankEntry[];
    setUploadReview((prev) =>
      prev && prev.documentId === documentId
        ? {
            ...prev,
            entries: reviewEntries,
          }
        : prev,
    );

    await handleDataRefresh({ silent: true });
  }

  async function handleCheckWithAi() {
    if (!uploadReview) return;

    setIsReviewParsingWithAi(true);
    try {
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: uploadReview.documentId,
          mode: "ai",
        }),
      });
      const parseData = await parseRes.json().catch(() => null);
      if (!parseRes.ok) {
        throw new Error(parseData?.error || "Could not run AI parse");
      }

      const creditsUsed = parseData?.creditsUsed || 0;
      const creditSource = parseData?.creditSource;
      const method = parseData?.parsingMethod;
      const parsingMode = parseData?.parsingMode;

      const creditMessage =
        parsingMode === "ai" && creditsUsed > 0
          ? ` ${creditsUsed} credit${creditsUsed === 1 ? "" : "s"} used.`
          : "";
      const sourceMessage =
        parsingMode === "ai" && creditSource === "none"
          ? " No provider credits were consumed."
          : "";

      addToast({
        type: method === "ai" ? "success" : "info",
        title:
          method === "ai"
            ? "AI review completed"
            : "AI review fell back to deterministic parsing",
        description: `${parseData?.parsingMethod ? `Mode: ${method}` : "Checked parsing with AI."}${creditMessage}${sourceMessage}`,
      });

      await refreshUploadReviewEntries(uploadReview.documentId);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not improve with AI",
        fallbackDescription: "Please retry your request.",
      });
    } finally {
      setIsReviewParsingWithAi(false);
    }
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

  async function handleDiscardImport() {
    if (!uploadReview) return;
    const { filename, entries: importedEntries } = uploadReview;
    const rootCount = importedEntries.filter(
      (entry) => !isChildEntry(entry),
    ).length;

    const confirmed = await confirmAction({
      title: dialogsT("review.discardConfirmTitle", { count: rootCount }),
      description: dialogsT("review.discardConfirmDescription", {
        count: rootCount,
        filename,
      }),
      confirmLabel: dialogsT("review.discardConfirm"),
      confirmVariant: "destructive",
    });
    if (!confirmed) return;

    try {
      await Promise.all(
        importedEntries.map((entry) =>
          fetch(`/api/bank/${entry.id}`, { method: "DELETE" }),
        ),
      );
      const ids = new Set(importedEntries.map((entry) => entry.id));
      setEntries((prev) => prev.filter((entry) => !ids.has(entry.id)));
      setAllEntries((prev) => prev.filter((entry) => !ids.has(entry.id)));
      closeUploadReview();
      addToast({ type: "info", title: `Discarded ${filename}.` });
    } catch (err) {
      showErrorToast(err, {
        title: "Could not discard import",
        fallbackDescription:
          "Some components may still appear in your bank. Try refreshing the page.",
      });
      await handleDataRefresh({ silent: true });
    }
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
      all: categoryCounts.all ?? 0,
    };
    for (const cat of BANK_CATEGORIES) {
      next[cat] = categoryCounts[cat] ?? 0;
    }
    onCategoryCountsChange(next);
  }, [categoryCounts, onCategoryCountsChange]);

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
      <AppPage padding="none">
        <PageHeader
          icon={Database}
          title="Components"
          description="Reusable bullets, stories, and project chunks pulled from your resume — the source material Studio composes into tailored documents."
          variant="compact"
          meta={
            visibleEntryCount > 0 ? (
              <span data-testid="bank-entry-count">
                · {pluralize(visibleEntryCount, "entry", "entries")}
              </span>
            ) : null
          }
          actions={
            <div
              className="flex flex-wrap items-center gap-2"
              data-testid="bank-actions"
            >
              <AddEntryDialog
                onCreate={handleCreate}
                open={addEntryOpen}
                onOpenChange={setAddEntryOpen}
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                }
              />
              <DriveFilePicker
                onSelect={handleDriveSelect}
                accept={[
                  "application/pdf",
                  "text/plain",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ]}
                trigger={
                  <Button variant="outline" size="sm" disabled={driveImporting}>
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
                size="sm"
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
          }
        />
        <PageContent>
          <div>
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
                  <Button
                    variant="outline"
                    onClick={() => setUploadConflict(null)}
                  >
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
                if (!open) {
                  closeUploadReview();
                }
              }}
            >
              <DialogContent className="max-h-[92vh] max-w-[min(98vw,104rem)] overflow-hidden p-0">
                <DialogHeader className="border-b px-6 py-5">
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
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
                  {uploadReview &&
                  getUploadReviewPreviewStatus({
                    filename: uploadReview.filename,
                    mimeType: uploadReview.mimeType,
                  }).kind !== "pdf" ? (
                    <div className="mt-3 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      {
                        getUploadReviewPreviewStatus({
                          filename: uploadReview.filename,
                          mimeType: uploadReview.mimeType,
                        }).message
                      }
                    </div>
                  ) : null}
                </DialogHeader>
                <div className="h-[68vh] overflow-hidden">
                  {uploadReview ? (
                    <UploadReviewEntries
                      entries={uploadReview.entries}
                      existingEntries={allEntries.filter((entry) => {
                        // Cross-document duplicate detection (P1.3): exclude
                        // only the entries from THIS parsed batch so we don't
                        // self-match. Entries from other source documents stay
                        // in the candidate pool so a project the user already
                        // has from another resume gets flagged as a possible
                        // duplicate instead of silently re-added.
                        const parsedIds = new Set(
                          uploadReview.entries.map((e) => e.id),
                        );
                        return !parsedIds.has(entry.id);
                      })}
                      onUpdate={handleReviewUpdate}
                      onDelete={handleReviewDelete}
                      onCreateBullet={handleCreateChild}
                      onMergeChildren={handleReviewMergeChildren}
                      onAttachBullet={handleReviewAttachBullet}
                      documentId={uploadReview.documentId}
                      documentFilename={uploadReview.filename}
                      documentMimeType={uploadReview.mimeType}
                    />
                  ) : null}
                </div>
                <DialogFooter className="flex flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Destructive pinned left; neutral + primary stack right.
                      All four share `size="sm"` so the row reads as one
                      cluster instead of four mismatched chips. */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDiscardImport()}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
                  >
                    {dialogsT("review.discardImport")}
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={closeUploadReview}
                    >
                      {dialogsT("review.keepEditing")}
                    </Button>
                    {uploadReview?.docType === "resume" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCheckWithAi}
                        disabled={isReviewParsingWithAi}
                      >
                        {isReviewParsingWithAi ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                        )}
                        {isReviewParsingWithAi
                          ? "Checking with AI..."
                          : "Check with AI"}
                      </Button>
                    ) : null}
                    <Button size="sm" onClick={closeUploadReview}>
                      {dialogsT("review.done")}
                    </Button>
                  </div>
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
                    onChange={(event) =>
                      setMoveTargetParentId(event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {parentCandidates.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {getEntryLabel(entry)} (
                        {CATEGORY_LABELS[entry.category]})
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

            <div className="space-y-6">
              {showLibraryTools ? (
                <>
                  {/* Keep this in flow: <main> is the scrollport, and nested sticky filter bars can trap wheel scrolling. */}
                  <Suspense fallback={<BankFiltersSkeleton />}>
                    <div data-testid="bank-search-filters">
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
                            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
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
                            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
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
                                  "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
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
                  entries.length === 0 ? (
                    <OnboardingEmptyState
                      illustrationName="components-zero"
                      icon={Database}
                      title="Components are the building blocks of every tailored document."
                      description="Upload a resume or paste career notes; Slothing extracts reusable bullets, stories, and project chunks. Studio recomposes them into tailored docs for each opportunity."
                      steps={[
                        {
                          label: "Upload résumé",
                          description: "PDF, DOCX, or paste plain text.",
                          icon: Upload,
                        },
                        {
                          label: "We extract bullets",
                          description: "Reusable chunks land here, tagged.",
                          icon: Database,
                        },
                        {
                          label: "Studio composes",
                          description: "Pick a role, get a tailored doc.",
                          icon: FileText,
                        },
                      ]}
                      primaryAction={
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {uploading ? "Uploading..." : "Upload résumé"}
                        </Button>
                      }
                      secondaryAction={
                        <Button
                          variant="outline"
                          onClick={() => setAddEntryOpen(true)}
                        >
                          Paste manually
                        </Button>
                      }
                    />
                  ) : (
                    <ZeroResultEmptyState
                      title="No matching entries"
                      description="Adjust your search or filters to see more components."
                      filters={[
                        ...(query
                          ? [
                              {
                                label: `Search: ${query}`,
                                onRemove: () => setQuery(""),
                              },
                            ]
                          : []),
                        ...(activeCategory !== "all"
                          ? [
                              {
                                label: `Category: ${CATEGORY_LABELS[activeCategory] ?? activeCategory}`,
                                onRemove: () => setActiveCategory("all"),
                              },
                            ]
                          : []),
                      ]}
                      action={
                        <Button
                          variant="outline"
                          onClick={() => {
                            setQuery("");
                            setActiveCategory("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      }
                    />
                  )
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
                                (
                                {sourceDocumentCounts[group.key] ??
                                  group.entries.length}
                                )
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
                              onSelectEntry={setSelectedEntryId}
                            />
                          </div>
                        ))
                      : groupedEntries.map((group) => (
                          <div key={group.category}>
                            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                              {CATEGORY_LABELS[group.category]}
                              <span className="text-sm font-normal text-muted-foreground">
                                (
                                {categoryCounts[group.category] ??
                                  group.entries.length}
                                )
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
                              onSelectEntry={setSelectedEntryId}
                            />
                          </div>
                        ))}
                    {hasMoreEntries ? (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() =>
                            void fetchEntries({
                              silent: true,
                              cursor: nextCursor,
                            })
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
        </PageContent>
        {confirmActionDialog}
        <ComponentDetailDrawer
          entry={
            selectedEntryId
              ? (entries.find((e) => e.id === selectedEntryId) ??
                allEntries.find((e) => e.id === selectedEntryId) ??
                null)
              : null
          }
          childEntries={
            selectedEntryId
              ? getChildEntriesFor(
                  entries.find((e) => e.id === selectedEntryId) ??
                    allEntries.find((e) => e.id === selectedEntryId) ??
                    ({
                      id: "__missing__",
                    } as BankEntry),
                  entries,
                )
              : []
          }
          open={selectedEntryId !== null}
          onOpenChange={(next) => {
            if (!next) setSelectedEntryId(null);
          }}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onCreateChild={handleCreateChild}
          onReorderChild={handleReorderChild}
          sourceFilenames={
            new Map(sourceDocuments.map((doc) => [doc.id, doc.filename]))
          }
        />
      </AppPage>
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
      aria-pressed={active}
      className={cn(
        "min-h-9 rounded-md px-3 text-sm font-medium transition-colors",
        active
          ? "bg-ink text-paper shadow-[var(--shadow-button)]"
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
        "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-ink text-paper shadow-[var(--shadow-button)]"
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
  onSelectEntry,
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
  onSelectEntry: (id: string) => void;
}) {
  // Hook calls must precede any conditional return — see rules-of-hooks.
  const sourceFilenames = useMemo(
    () => new Map(sourceDocuments.map((doc) => [doc.id, doc.filename])),
    [sourceDocuments],
  );

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
        onSelectEntry={onSelectEntry}
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
        onSelect={() => onSelectEntry(entry.id)}
        sourceFilenames={sourceFilenames}
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
  onSelectEntry,
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
  onSelectEntry: (id: string) => void;
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
    <div className="overflow-hidden rounded-md border bg-card">
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
                    onClick={() => onSelectEntry(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectEntry(entry.id);
                      }
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-muted/30",
                      isBulletNeedsReview(entry, reviewEntries) &&
                        "bg-warning/5",
                    )}
                  >
                    <td className="px-3 py-3 text-muted-foreground">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleRow(entry.id);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                        aria-label={
                          expanded ? a11yT("collapse") : a11yT("expand")
                        }
                        aria-expanded={expanded}
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expanded && "rotate-90",
                          )}
                          aria-hidden="true"
                        />
                      </button>
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
                      <TimeAgo date={entry.createdAt} />
                    </td>
                  </tr>
                  {expanded ? (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="bg-muted/20 px-6 py-4"
                      >
                        <ChunkPeek childEntries={children} />
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

function compactReviewFieldLabel(label: string): string {
  return label
    .replace(/\s*\(one per line\)/i, "")
    .replace(/^Project Name$/i, "Name")
    .replace(/^Job Title$/i, "Title")
    .replace(/^Skill Name$/i, "Name");
}

function isStackFieldKey(key: string): boolean {
  return key === "technologies" || key === "skills";
}

function getReviewEditField(field: FieldDef): FieldDef {
  if (!isStackFieldKey(field.key)) {
    return {
      ...field,
      label: compactReviewFieldLabel(field.label),
    };
  }

  return {
    ...field,
    label: "Stack",
    placeholder: "TypeScript\nPostgreSQL\nFigma\nCustomer research",
  };
}

function getReviewListValue(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
}

function getReviewStack(content: Record<string, unknown>): string[] {
  const stack = [
    ...getReviewListValue(content.technologies),
    ...getReviewListValue(content.skills),
  ];
  return Array.from(new Set(stack));
}

function getReviewFieldValueLabel(value: unknown): ReactNode {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function isReviewUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\/[^\s]+$/i.test(value.trim());
}

function overviewFieldClass(field: FieldDef): string {
  if (
    field.key === "institution" ||
    field.key === "description" ||
    field.key === "url"
  ) {
    return "sm:col-span-2";
  }
  if (field.type === "textarea") return "sm:col-span-2";
  return "";
}

function CountDot({ count }: { count: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-muted px-1.5 font-mono text-[10px] leading-none text-muted-foreground">
      {count}
    </span>
  );
}

function ReviewSectionHeader({
  title,
  count,
  description,
}: {
  title: string;
  count?: number;
  description?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <div className="min-w-0 shrink-0">
        <div className="flex items-center gap-2">
          <p className="font-display text-sm font-semibold tracking-tight">
            {title}
          </p>
          {typeof count === "number" ? <CountDot count={count} /> : null}
        </div>
      </div>
      {description ? (
        <p className="min-w-0 text-xs leading-relaxed text-muted-foreground sm:text-right">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ReviewPanelBox({
  title,
  count,
  description,
  children,
}: {
  title: string;
  count?: number;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b px-4 py-3">
        <ReviewSectionHeader
          title={title}
          count={count}
          description={description}
        />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function getNewParsedChildren(
  parsedChildren: BankEntry[],
  existingChildren: BankEntry[],
): BankEntry[] {
  const existingDescriptions = new Set(
    existingChildren.map((child) =>
      normalizeReviewText(child.content.description),
    ),
  );
  return parsedChildren.filter((child) => {
    const description = normalizeReviewText(child.content.description);
    return description && !existingDescriptions.has(description);
  });
}

function TextDocumentPreview({
  documentId,
  filename,
}: {
  documentId: string;
  filename: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTextPreview() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/bank/documents/${encodeURIComponent(documentId)}/text`,
        );
        const data = (await response.json().catch(() => null)) as {
          document?: { extractedText?: string };
          error?: string;
        } | null;
        if (!response.ok) {
          throw new Error(data?.error ?? "Text preview not available");
        }
        if (!cancelled) setText(data?.document?.extractedText ?? "");
      } catch (previewError) {
        if (!cancelled) {
          setError(
            previewError instanceof Error
              ? previewError.message
              : "Text preview not available",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTextPreview();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="min-w-0 truncate font-display text-sm font-semibold tracking-tight">
            {filename}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Text preview from stored extraction. Layout and highlights are not
          available for this file type.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading text preview
          </div>
        ) : error ? (
          <ErrorState
            title="Preview unavailable"
            message={error}
            variant="inline"
          />
        ) : (
          <pre className="whitespace-pre-wrap break-words font-body text-sm leading-6 text-foreground">
            {text}
          </pre>
        )}
      </div>
    </div>
  );
}

function UploadReviewEntries({
  entries,
  existingEntries,
  onUpdate,
  onDelete,
  onCreateBullet,
  onMergeChildren,
  onAttachBullet,
  documentId,
  documentFilename,
  documentMimeType,
}: {
  entries: BankEntry[];
  existingEntries: BankEntry[];
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onCreateBullet: (
    parent: BankEntry,
    description: string,
  ) => void | Promise<void>;
  onMergeChildren: (
    parsedEntry: BankEntry,
    existingEntry: BankEntry,
    parsedChildren: BankEntry[],
  ) => void;
  onAttachBullet: (bullet: BankEntry, parent: BankEntry) => void;
  documentId?: string;
  documentFilename?: string;
  documentMimeType?: string;
}) {
  const a11yT = useA11yTranslations();

  const roots = useMemo(() => entries.filter(isReviewRootEntry), [entries]);
  const needsReviewBullets = useMemo(
    () =>
      entries
        .filter((entry) => isBulletNeedsReview(entry, entries))
        .sort(sortByPdfOrder),
    [entries],
  );
  const reviewItems = useMemo(() => {
    const reviewIds = new Set(needsReviewBullets.map((entry) => entry.id));
    return [
      ...needsReviewBullets,
      ...roots.filter((entry) => !reviewIds.has(entry.id)),
    ].sort(sortByPdfOrder);
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
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<Record<string, unknown>>({});
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [bulletEditContent, setBulletEditContent] = useState<
    Record<string, unknown>
  >({});
  const [newBulletText, setNewBulletText] = useState("");
  // Per-session "keep both" decisions. When a user keeps both copies of a
  // duplicate (P1.2), the warning panel is dismissed for that parsed entry
  // until the modal is re-opened.
  const [keepBothIds, setKeepBothIds] = useState<Set<string>>(new Set());
  const previewStatus = getUploadReviewPreviewStatus({
    filename: documentFilename,
    mimeType: documentMimeType,
  });

  // PF.4 — left-panel tabs. Document tab is the default so users start with
  // source context for what was extracted; PDF renders pages and non-PDF
  // imports render stored extracted text.
  const documentTabAvailable = Boolean(documentId);

  // PF.5 — highlight data fed to the PDF preview. Bboxes come from the
  // fuzzy-match step in the upload pipeline; entries with no bbox simply
  // don't render a highlight. Bullets are included even though the right
  // detail panel only shows roots — clicking a bullet's highlight applies
  // the selected ring to it AND leaves the right panel on its parent
  // (which contains the bullet), which is the right mental model.
  const previewHighlights = useMemo<HighlightInput[]>(
    () =>
      entries
        .map((entry) => {
          const bboxes = getReviewPreviewBboxes(
            entry,
            isReviewRootEntry(entry),
          );
          return bboxes
            ? {
                entryId: entry.id,
                category: entry.category,
                bboxes,
              }
            : null;
        })
        .filter((highlight): highlight is HighlightInput => highlight !== null),
    [entries],
  );

  // PF.6 — imperative jump-to-page for "View in document" link.
  const pdfNavigatorRef = useRef<((entryId: string) => void) | null>(null);
  const registerPdfNavigator = useCallback(
    (navigator: (entryId: string) => void) => {
      pdfNavigatorRef.current = navigator;
      return () => {
        if (pdfNavigatorRef.current === navigator) {
          pdfNavigatorRef.current = null;
        }
      };
    },
    [],
  );
  const handleViewInDocument = useCallback((entryId: string) => {
    // 3-pane layout: the document preview is always visible alongside the
    // components list and review pane on lg+, and stacked beneath them on
    // <lg. The "View in document" CTA only needs to jump the PDF viewer to
    // the right page; no panel-toggle required anymore.
    pdfNavigatorRef.current?.(entryId);
  }, []);

  useEffect(() => {
    if (reviewItems.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !reviewItems.some((entry) => entry.id === selectedId)) {
      setSelectedId(reviewItems[0].id);
    }
  }, [reviewItems, selectedId]);

  useEffect(() => {
    setEditingEntryId(null);
    setEditContent({});
    setEditingBulletId(null);
    setBulletEditContent({});
    setNewBulletText("");
  }, [selectedId]);

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
  const duplicateExistingChildren = duplicateEntries[0]
    ? getChildEntriesFor(duplicateEntries[0], existingEntries)
    : [];
  const newParsedChildren = duplicateEntries[0]
    ? getNewParsedChildren(childEntries, duplicateExistingChildren)
    : childEntries;
  const selectedWarnings = selectedEntry
    ? getReviewWarnings(selectedEntry, childEntries, duplicateEntries).filter(
        // P2.6: drop the standalone "Possible duplicate" warning when the
        // duplicate-resolution panel below already surfaces the same flag —
        // otherwise the chrome restates itself twice with different visuals.
        (warning) =>
          !(warning === "Possible duplicate" && duplicateEntries.length > 0),
      )
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
  const selectedFields = selectedEntry
    ? CATEGORY_FIELDS[selectedEntry.category]
    : [];
  const selectedStack = selectedEntry
    ? getReviewStack(selectedEntry.content)
    : [];
  const selectedHighlights = selectedEntry
    ? getReviewListValue(selectedEntry.content.highlights)
    : [];
  const selectedOverviewFields = selectedEntry
    ? selectedFields.filter((field) => {
        if (isStackFieldKey(field.key) || field.key === "highlights") {
          return false;
        }
        const value = selectedEntry.content[field.key];
        if (value === undefined || value === null || value === "") {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      })
    : [];
  const isEditingSelected = Boolean(
    selectedEntry && editingEntryId === selectedEntry.id,
  );
  const canHaveBullets = Boolean(
    selectedEntry &&
    (selectedEntry.category === "experience" ||
      selectedEntry.category === "project"),
  );
  const showBulletSection = canHaveBullets || childEntries.length > 0;
  const selectedAttentionReason = selectedReviewReason
    ? selectedReviewReason
    : duplicateEntries.length > 0 && !keepBothIds.has(selectedEntry?.id ?? "")
      ? newParsedChildren.length === 0
        ? "Duplicate found: no new bullets"
        : `Duplicate found: ${pluralize(newParsedChildren.length, "new bullet")}`
      : (selectedWarnings[0] ?? null);

  function beginEditSelected() {
    if (!selectedEntry) return;
    setEditingEntryId(selectedEntry.id);
    setEditContent({ ...selectedEntry.content });
  }

  function saveSelectedEdit() {
    if (!selectedEntry) return;
    onUpdate(selectedEntry.id, cleanContent(editContent, selectedFields));
    setEditingEntryId(null);
    setEditContent({});
  }

  function cancelSelectedEdit() {
    setEditingEntryId(null);
    setEditContent({});
  }

  function beginBulletEdit(child: BankEntry) {
    setEditingBulletId(child.id);
    setBulletEditContent({ ...child.content });
  }

  function saveBulletEdit(child: BankEntry) {
    onUpdate(child.id, cleanContent(bulletEditContent, CATEGORY_FIELDS.bullet));
    setEditingBulletId(null);
    setBulletEditContent({});
  }

  function cancelBulletEdit() {
    setEditingBulletId(null);
    setBulletEditContent({});
  }

  async function createReviewBullet() {
    if (!selectedEntry) return;
    const description = newBulletText.trim();
    if (!description) return;
    await onCreateBullet(selectedEntry, description);
    setNewBulletText("");
  }

  if (entries.length === 0) {
    return (
      <StandardEmptyState
        icon={Database}
        title={a11yT("noComponentsDetected")}
        description="The file uploaded, but there were no structured resume components to review."
      />
    );
  }

  const componentsListPane = (
    <>
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-display text-sm font-semibold tracking-tight">
            Detected
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {reviewItems.length}
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
              {reviewSummary.needsReview} needs review
            </Badge>
          ) : null}
          {reviewSummary.duplicates > 0 ? (
            <Badge variant="warning" className="text-2xs">
              {reviewSummary.duplicates} duplicates
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {reviewItems.map((entry) => {
          const active = entry.id === selectedEntry?.id;
          const children = getChildEntriesFor(entry, entries);
          const duplicates = existingKeys.get(reviewDuplicateKey(entry)) ?? [];
          const warnings = getReviewWarnings(entry, children, duplicates);
          const reviewReason = getBulletReviewReason(entry, entries);
          const sourceState = getReviewSourceState(
            entry,
            isReviewRootEntry(entry),
          );
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedId(entry.id)}
              className={cn(
                "w-full rounded-md border px-2.5 py-2 text-left shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-colors",
                active
                  ? "border-primary bg-primary/10 shadow-none"
                  : reviewReason
                    ? "border-warning/40 bg-warning/5 hover:bg-warning/10"
                    : "border-border/70 bg-background/65 hover:border-primary/35 hover:bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="line-clamp-2 text-[12.5px] font-medium leading-snug">
                  {getEntryLabel(entry)}
                </span>
                <Badge
                  variant={active ? "default" : "outline"}
                  className="text-2xs shrink-0"
                >
                  {CATEGORY_LABELS[entry.category]}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
                <span>{children.length} bullets</span>
                {reviewReason ? (
                  <span className="text-warning">{reviewReason}</span>
                ) : null}
                <span>{sourceState}</span>
                <span>{Math.round((entry.confidenceScore ?? 0) * 100)}%</span>
                {warnings.length > 0 ? (
                  <span className="text-warning">
                    {pluralize(warnings.length, "issue")}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "grid h-full min-h-0 grid-cols-1",
        // lg+ — 3-pane (or 2-pane when no source preview). Components | Document | Review.
        // On <lg the same DOM tree stacks vertically — components and document
        // get capped vertical bands so the review pane below stays usable.
        documentTabAvailable
          ? "lg:grid-cols-[260px_minmax(520px,1fr)_minmax(460px,0.78fr)]"
          : "lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.78fr)]",
      )}
    >
      {/* Components list — left column on lg+, stacked top band on <lg. */}
      <aside className="flex min-h-0 flex-col border-r bg-muted/20 max-lg:max-h-[28vh] max-lg:border-b">
        {componentsListPane}
      </aside>

      {/* Middle column — document preview. On lg+ this is the wide middle
          pane. On <lg the same single mount stacks beneath the components
          list, capped to 40vh so the review pane below stays visible. */}
      {documentTabAvailable && documentId ? (
        <div className="flex min-h-0 flex-col border-r bg-background max-lg:max-h-[40vh] max-lg:border-b">
          {previewStatus.kind === "pdf" ? (
            <PdfPreview
              documentId={documentId}
              filename={documentFilename ?? "document.pdf"}
              highlights={previewHighlights}
              selectedEntryId={selectedId}
              onSelectEntry={setSelectedId}
              onRegisterNavigator={registerPdfNavigator}
            />
          ) : (
            <TextDocumentPreview
              documentId={documentId}
              filename={documentFilename ?? "source document"}
            />
          )}
        </div>
      ) : null}
      <section className="min-h-0 overflow-y-auto bg-background px-5 py-4">
        {selectedEntry ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Review component
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                  {getEntryLabel(selectedEntry)}
                </h3>
                {previewStatus.kind === "pdf" &&
                getReviewPreviewBboxes(
                  selectedEntry,
                  isReviewRootEntry(selectedEntry),
                ) ? (
                  <button
                    type="button"
                    onClick={() => handleViewInDocument(selectedEntry.id)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Jump to highlight ↗
                  </button>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                {isEditingSelected ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelSelectedEdit}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={saveSelectedEdit}>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={beginEditSelected}
                    >
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(selectedEntry.id)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
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
                  {pluralize(childEntries.length, "bullet")}
                </Badge>
              ) : null}
              {selectedWarnings.map((warning) => (
                <Badge key={warning} variant="warning">
                  {warning}
                </Badge>
              ))}
            </div>
            {selectedAttentionReason ? (
              <div className="rounded-md border border-warning/35 bg-warning/10 px-3 py-2 text-sm">
                <span className="font-medium text-warning">
                  Needs attention:
                </span>{" "}
                <span className="text-muted-foreground">
                  {selectedAttentionReason}
                </span>
              </div>
            ) : null}
            {duplicateEntries.length > 0 &&
            !keepBothIds.has(selectedEntry.id) ? (
              <DuplicateResolutionPanel
                parsedEntry={selectedEntry}
                existingEntry={duplicateEntries[0]}
                parsedChildren={childEntries}
                existingChildren={duplicateExistingChildren}
                onDiscard={() => onDelete(selectedEntry.id)}
                onMergeChildren={() =>
                  onMergeChildren(
                    selectedEntry,
                    duplicateEntries[0],
                    childEntries,
                  )
                }
                onKeepBoth={() =>
                  setKeepBothIds((prev) => {
                    const next = new Set(prev);
                    next.add(selectedEntry.id);
                    return next;
                  })
                }
              />
            ) : null}
            {selectedReviewReason ? (
              <div className="rounded-md border border-warning/35 bg-warning/10 p-3">
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
                    className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm"
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
                    className="rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm"
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
            {isEditingSelected ? (
              <div className="space-y-3">
                {selectedFields.map((field) => {
                  const reviewField = getReviewEditField(field);
                  return (
                    <ReviewPanelBox key={field.key} title={reviewField.label}>
                      <FieldEditor
                        field={reviewField}
                        value={editContent[field.key]}
                        hideLabel
                        onChange={(key, value) =>
                          setEditContent((current) => ({
                            ...current,
                            [key]: value,
                          }))
                        }
                      />
                      {isStackFieldKey(field.key) ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          One per line. Include languages, frameworks, tools,
                          hardware, protocols, methods, or domain skills.
                        </p>
                      ) : field.type === "list" ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          One item per line.
                        </p>
                      ) : null}
                    </ReviewPanelBox>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedOverviewFields.length > 0 ? (
                  <ReviewPanelBox title="Overview">
                    <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                      {selectedOverviewFields.map((field) => {
                        const value = selectedEntry.content[field.key];
                        const label = compactReviewFieldLabel(field.label);
                        return (
                          <div
                            key={field.key}
                            className={cn("min-w-0", overviewFieldClass(field))}
                          >
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                              {label}
                            </p>
                            {isReviewUrl(value) ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 block break-words text-sm font-medium text-primary underline-offset-4 hover:underline"
                              >
                                {value}
                              </a>
                            ) : (
                              <p className="mt-1 break-words text-sm leading-relaxed">
                                {getReviewFieldValueLabel(value)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ReviewPanelBox>
                ) : null}

                {selectedStack.length > 0 ? (
                  <ReviewPanelBox
                    title="Stack"
                    count={selectedStack.length}
                    description="Technologies, tools, and skills parsed for this component."
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStack.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </ReviewPanelBox>
                ) : null}

                {selectedHighlights.length > 0 ? (
                  <ReviewPanelBox
                    title="Highlights"
                    count={selectedHighlights.length}
                  >
                    <ul className="space-y-2">
                      {selectedHighlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="text-sm leading-relaxed text-foreground"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </ReviewPanelBox>
                ) : null}
              </div>
            )}

            {showBulletSection ? (
              <div className="rounded-md border border-border bg-card">
                <div className="border-b px-4 py-3">
                  <ReviewSectionHeader
                    title="Bullet points"
                    count={childEntries.length}
                    description={pluralize(
                      childEntries.length,
                      "parsed bullet",
                    )}
                  />
                </div>
                {isEditingSelected && canHaveBullets ? (
                  <div className="border-b bg-muted/20 p-4">
                    <label
                      htmlFor="review-new-bullet"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Add bullet
                    </label>
                    <textarea
                      id="review-new-bullet"
                      value={newBulletText}
                      onChange={(event) => setNewBulletText(event.target.value)}
                      placeholder="Add one bullet point..."
                      className="mt-1 min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void createReviewBullet()}
                        disabled={!newBulletText.trim()}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add bullet
                      </Button>
                    </div>
                  </div>
                ) : null}
                {childEntries.length > 0 ? (
                  <div className="divide-y divide-border">
                    {childEntries.map((child, index) => {
                      const isEditingBullet = editingBulletId === child.id;
                      return (
                        <div key={child.id} className="px-4 py-3">
                          {isEditingBullet ? (
                            <div className="space-y-3">
                              <FieldEditor
                                field={CATEGORY_FIELDS.bullet[0]}
                                value={bulletEditContent.description}
                                onChange={(key, value) =>
                                  setBulletEditContent((current) => ({
                                    ...current,
                                    [key]: value,
                                  }))
                                }
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelBulletEdit}
                                >
                                  <X className="mr-1.5 h-3.5 w-3.5" />
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => saveBulletEdit(child)}
                                >
                                  <Save className="mr-1.5 h-3.5 w-3.5" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                                {index + 1}
                              </span>
                              <p className="min-w-0 flex-1 text-sm leading-relaxed">
                                {String(child.content.description ?? "")}
                              </p>
                              <div className="flex shrink-0 items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => beginBulletEdit(child)}
                                  aria-label="Edit bullet"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => onDelete(child.id)}
                                  aria-label="Delete bullet"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    No bullet points were parsed for this component.
                  </div>
                )}
              </div>
            ) : null}
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
  onKeepBoth,
}: {
  parsedEntry: BankEntry;
  existingEntry: BankEntry;
  parsedChildren: BankEntry[];
  existingChildren: BankEntry[];
  onDiscard: () => void;
  onMergeChildren: () => void;
  onKeepBoth: () => void;
}) {
  const newParsedChildren = getNewParsedChildren(
    parsedChildren,
    existingChildren,
  );
  // Auto-resolve trivial duplicates (P1.1): when the parsed copy adds zero
  // new bullets, merging is a no-op. Promote `Discard parsed copy` to the
  // default action and disable `Merge bullets` with an explanatory hover.
  const nothingNewToMerge = newParsedChildren.length === 0;

  return (
    <div className="rounded-md border border-warning/35 bg-warning/10 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">Possible duplicate</Badge>
            <span className="text-sm font-medium">
              {getEntryLabel(existingEntry)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {nothingNewToMerge
              ? "This import adds no new bullets for an item you already saved. Use the existing component, or keep this as a duplicate."
              : "A similar component already exists. Merge only the new bullets, use the existing component, or keep this duplicate."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={nothingNewToMerge ? "outline" : "ghost"}
            size="sm"
            onClick={onDiscard}
          >
            Use existing
          </Button>
          {!nothingNewToMerge ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onMergeChildren}
              disabled={parsedChildren.length === 0}
              title={
                parsedChildren.length === 0 ? "No bullets to merge" : undefined
              }
            >
              Merge new bullets
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onKeepBoth}>
            Keep duplicate
          </Button>
        </div>
      </div>
      {nothingNewToMerge ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Merge is hidden because there are no new bullets to add.
        </p>
      ) : null}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-border/70 bg-background/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Existing component
          </p>
          <p className="mt-1 text-sm font-medium">
            {getEntryLabel(existingEntry)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {existingChildren.length} bullet
            {existingChildren.length === 1 ? "" : "s"} already saved
          </p>
        </div>
        <div className="rounded-md border border-border/70 bg-background/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            This import
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
