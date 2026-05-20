"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Columns3, GripVertical, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/opportunities/status-pill";
import { Button } from "@/components/ui/button";
import { VirtualList } from "@/components/ui/virtual-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ESTIMATED_CARD_HEIGHT_KANBAN } from "@/lib/constants/virtualization";
import {
  CLOSED_SUB_STATUSES,
  CLOSED_SUB_STATUS_BADGE_VARIANTS,
  CLOSED_SUB_STATUS_LABELS,
  DEFAULT_KANBAN_VISIBLE_LANES,
  KANBAN_LANE_GROUPS,
  KANBAN_LANE_IDS,
  KANBAN_LANE_LABELS,
  formatOpportunityDate,
  formatOpportunityLocation,
  groupOpportunitiesByLane,
  inferLaneFromStatus,
  isClosedSubStatus,
  normalizeKanbanVisibleLanes,
  type ClosedSubStatus,
  type KanbanLaneId,
  type Opportunity,
  type OpportunityStatus,
} from "../utils";
import { Link } from "@/i18n/navigation";

interface KanbanBoardProps {
  opportunities: Opportunity[];
  visibleLanes: readonly KanbanLaneId[];
  onStatusChange: (opportunityId: string, status: OpportunityStatus) => void;
  onVisibleLanesChange: (lanes: readonly KanbanLaneId[]) => void;
}

interface ClosedMove {
  opportunityId: string;
  title: string;
}

export function KanbanBoard({
  opportunities,
  visibleLanes,
  onStatusChange,
  onVisibleLanesChange,
}: KanbanBoardProps) {
  const locale = useLocale();
  const t = useTranslations("opportunities.kanbanBoard");
  const normalizedVisibleLanes = normalizeKanbanVisibleLanes(visibleLanes);
  const groupedOpportunities = useMemo(
    () => groupOpportunitiesByLane(opportunities),
    [opportunities],
  );
  const [draggedOpportunityId, setDraggedOpportunityId] = useState<
    string | null
  >(null);
  const [closedMove, setClosedMove] = useState<ClosedMove | null>(null);

  const canReset =
    normalizedVisibleLanes.length !== DEFAULT_KANBAN_VISIBLE_LANES.length ||
    normalizedVisibleLanes.some(
      (lane, index) => lane !== DEFAULT_KANBAN_VISIBLE_LANES[index],
    );

  function toggleLane(lane: KanbanLaneId) {
    const isVisible = normalizedVisibleLanes.includes(lane);
    if (isVisible && normalizedVisibleLanes.length === 1) return;

    const nextVisibleLanes = isVisible
      ? normalizedVisibleLanes.filter((visibleLane) => visibleLane !== lane)
      : normalizeKanbanVisibleLanes([...normalizedVisibleLanes, lane]);
    onVisibleLanesChange(nextVisibleLanes);
  }

  function handleDragStart(
    event: DragEvent<HTMLElement>,
    opportunityId: string,
  ) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", opportunityId);
    setDraggedOpportunityId(opportunityId);
  }

  function handleDrop(event: DragEvent<HTMLElement>, lane: KanbanLaneId) {
    event.preventDefault();
    const opportunityId =
      event.dataTransfer.getData("text/plain") || draggedOpportunityId;
    const opportunity = opportunities.find(
      (candidate) => candidate.id === opportunityId,
    );

    setDraggedOpportunityId(null);

    if (!opportunity) return;

    const currentLane = inferLaneFromStatus(opportunity.status);
    if (currentLane === lane) return;

    if (lane === "closed") {
      setClosedMove({
        opportunityId: opportunity.id,
        title: opportunity.title,
      });
      return;
    }

    const [status] = KANBAN_LANE_GROUPS[lane];
    onStatusChange(opportunity.id, status);
  }

  function resolveClosedMove(status: ClosedSubStatus) {
    if (!closedMove) return;

    onStatusChange(closedMove.opportunityId, status);
    setClosedMove(null);
  }

  return (
    <div
      className="space-y-3"
      role="region"
      aria-label={t("region")}
      aria-roledescription={t("roleDescription")}
    >
      <div className="flex flex-col gap-3 rounded-md border border-rule bg-paper px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
            <Columns3 className="h-3.5 w-3.5" aria-hidden />
            Columns
          </span>
          <div className="flex flex-wrap gap-1.5">
            {KANBAN_LANE_IDS.map((lane) => {
              const isVisible = normalizedVisibleLanes.includes(lane);
              const isLastVisible =
                isVisible && normalizedVisibleLanes.length === 1;

              return (
                <Button
                  key={lane}
                  type="button"
                  variant={isVisible ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleLane(lane)}
                  disabled={isLastVisible}
                  aria-pressed={isVisible}
                >
                  {KANBAN_LANE_LABELS[lane]}
                  {groupedOpportunities[lane].length > 0 && (
                    <Badge variant="secondary" className="ml-1.5">
                      {groupedOpportunities[lane].length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onVisibleLanesChange([...DEFAULT_KANBAN_VISIBLE_LANES])
          }
          disabled={!canReset}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="overflow-x-auto pb-4" tabIndex={0}>
        <div
          className="grid min-w-full gap-3"
          style={{
            gridTemplateColumns: `repeat(${normalizedVisibleLanes.length}, minmax(236px, 1fr))`,
          }}
        >
          {normalizedVisibleLanes.map((lane) => {
            const laneOpportunities = groupedOpportunities[lane];

            return (
              <section
                key={lane}
                aria-label={t("laneAria", { lane: KANBAN_LANE_LABELS[lane] })}
                className="flex min-h-[560px] min-w-0 flex-col rounded-md border bg-card/70 p-3"
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => handleDrop(event, lane)}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">
                    {KANBAN_LANE_LABELS[lane]}
                  </h2>
                  {/* audit/10: drop the count badge on empty lanes —
                      "Drop opportunities here" placeholder already
                      signals zero items; the badge would just say "0". */}
                  {laneOpportunities.length > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      {laneOpportunities.length}
                    </Badge>
                  )}
                </div>

                <KanbanLaneCards
                  opportunities={laneOpportunities}
                  locale={locale}
                  draggedOpportunityId={draggedOpportunityId}
                  emptyLabel={t("dropHere")}
                  onDragStart={handleDragStart}
                  onDragEnd={() => setDraggedOpportunityId(null)}
                />
              </section>
            );
          })}
        </div>
      </div>

      <ClosedSubstateDialog
        move={closedMove}
        onResolve={resolveClosedMove}
        onCancel={() => setClosedMove(null)}
      />
    </div>
  );
}

function KanbanLaneCards({
  opportunities,
  locale,
  draggedOpportunityId,
  emptyLabel,
  onDragStart,
  onDragEnd,
}: {
  opportunities: Opportunity[];
  locale: string;
  draggedOpportunityId: string | null;
  emptyLabel: string;
  onDragStart: (event: DragEvent<HTMLElement>, opportunityId: string) => void;
  onDragEnd: () => void;
}) {
  function getOpportunityKey(opportunity: Opportunity): string {
    return opportunity.id;
  }

  function renderKanbanCard({ item: opportunity }: { item: Opportunity }) {
    function handleCardDragStart(event: DragEvent<HTMLElement>) {
      onDragStart(event, opportunity.id);
    }

    return (
      <OpportunityKanbanCard
        opportunity={opportunity}
        locale={locale}
        isDragging={draggedOpportunityId === opportunity.id}
        onDragStart={handleCardDragStart}
        onDragEnd={onDragEnd}
      />
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="grid min-h-28 flex-1 place-items-center rounded-lg border border-dashed bg-background/50 px-3 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <VirtualList
      items={opportunities}
      getKey={getOpportunityKey}
      estimateSize={ESTIMATED_CARD_HEIGHT_KANBAN}
      className="-mr-2 max-h-[60vh] flex-1 pr-2"
      itemClassName="pb-3"
      renderItem={renderKanbanCard}
    />
  );
}

export function ClosedSubstateDialog({
  move,
  onResolve,
  onCancel,
}: {
  move: ClosedMove | null;
  onResolve: (status: ClosedSubStatus) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("opportunities.kanbanBoard");
  const commonT = useTranslations("common");
  const isOpen = Boolean(move);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && move) {
          onResolve("dismissed");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("moveClosedTitle")}</DialogTitle>
          <DialogDescription>
            {t("moveClosedDescription", {
              title: move?.title ?? "this opportunity",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-3">
          {CLOSED_SUB_STATUSES.map((status) => (
            <Button
              key={status}
              type="button"
              variant={status === "rejected" ? "destructive" : "outline"}
              onClick={() => onResolve(status)}
            >
              {CLOSED_SUB_STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {commonT("cancel")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function OpportunityKanbanCard({
  opportunity,
  locale,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  opportunity: Opportunity;
  locale: string;
  isDragging: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}) {
  const location = formatOpportunityLocation(opportunity);
  const deadline = opportunity.deadline
    ? `Due ${formatOpportunityDate(opportunity.deadline, locale)}`
    : undefined;
  // audit/07: the column header already names the lane (Pending /
  // Saved / Applied / Interviewing / Offer). Repeating the same status
  // pill inside every card in that lane is redundant. The only lane
  // that genuinely needs the pill is "Closed", which can hold
  // rejected / expired / dismissed sub-statuses — there, the pill
  // tells the user which sub-state without expanding the card.
  const isClosedSubStatus = (CLOSED_SUB_STATUSES as readonly string[]).includes(
    opportunity.status,
  );

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-md border bg-background p-3 transition hover:border-primary/30 active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="group inline-flex min-h-11 items-center"
          >
            {/* audit/13: line-clamp-2 truncated titles like "Welding
                Engineering Assistant" on the narrow kanban lane
                (≈200px). Bump to 3 lines — most posting titles fit
                without truncation; the rare 4+ line title still
                truncates but the tooltip carries the full string. */}
            <h3
              className="line-clamp-3 text-base font-semibold leading-6 group-hover:text-primary"
              title={opportunity.title}
            >
              {opportunity.title}
            </h3>
          </Link>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {opportunity.company}
          </p>
        </div>
        <GripVertical
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={opportunity.type === "hackathon" ? "warning" : "info"}
            className="capitalize"
          >
            {opportunity.type}
          </Badge>
          <Badge variant="outline" className="max-w-full truncate">
            {location}
          </Badge>
          {isClosedSubStatus && <StatusPill status={opportunity.status} />}
        </div>
        {deadline ? <div className="truncate">{deadline}</div> : null}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[...(opportunity.techStack ?? []), ...opportunity.tags]
            .slice(0, 4)
            .map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="max-w-full truncate text-[11px]"
              >
                {tag}
              </Badge>
            ))}
        </div>
      </div>
    </article>
  );
}

export const ALL_KANBAN_LANES = DEFAULT_KANBAN_VISIBLE_LANES;
