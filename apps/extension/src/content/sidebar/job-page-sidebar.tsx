import React, {
  FormEvent,
  PointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  SidebarLayout,
  SidebarPosition,
  ExtensionResumeSummary,
  SimilarAnswer,
  ScrapedJob,
} from "@/shared/types";
import type { ResumeScore } from "@slothing/shared/scoring";
import { ChatPanel, type ChatIntent } from "./chat-panel";

export type SidebarAction = "tailor" | "coverLetter" | "save" | "autoFill";

export interface JobPageSidebarProps {
  scrapedJob: ScrapedJob;
  detectedFieldCount: number;
  detectedUploadCount: number;
  latestResume: ExtensionResumeSummary | null;
  score: ResumeScore | null;
  layout: SidebarLayout;
  onLayoutChange: (updates: Partial<SidebarLayout>) => void;
  onDismiss: () => Promise<void> | void;
  onTailor: () => Promise<void>;
  onCoverLetter: () => Promise<void>;
  onSave: () => Promise<void>;
  onAutoFill: (options?: { overwriteExisting?: boolean }) => Promise<unknown>;
  onOpenLatestResume: () => Promise<void>;
  onSearchAnswers: (query: string) => Promise<SimilarAnswer[]>;
  onApplyAnswer: (answer: SimilarAnswer) => Promise<void> | void;
  /**
   * P4/#40 — Streaming AI assistant. Parent opens a chrome.runtime.connect
   * port, posts CHAT_STREAM_START, and forwards tokens via `onToken`.
   * Resolves on stream end; rejects with a user-friendly Error on failure.
   */
  onChatStream: (params: {
    prompt: string;
    intent: ChatIntent;
    onToken: (token: string) => void;
    signal: AbortSignal;
  }) => Promise<void>;
  /**
   * P4/#40 — Deep-link the user into /studio?mode=cover_letter with the
   * streamed cover-letter opener seeded as a query param.
   */
  onUseInCoverLetter: (seedText: string) => void;
}

type Notice = { kind: "success" | "error"; message: string } | null;
type ActionFeedback = { action: SidebarAction; label: string } | null;
type AutoFillActionResult = {
  filled?: number;
  skipped?: number;
  errors?: number;
  conflicts?: number;
  alreadyFilled?: number;
};
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  width: number;
  height: number;
};

const ACTION_LABELS: Record<SidebarAction, string> = {
  tailor: "Tailor",
  coverLetter: "Cover Letter",
  save: "Save",
  autoFill: "Auto-fill",
};

export function JobPageSidebar(props: JobPageSidebarProps) {
  const [activeAction, setActiveAction] = useState<SidebarAction | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [autoFillConflicts, setAutoFillConflicts] = useState(0);
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState<SimilarAnswer[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dragState = useRef<DragState | null>(null);

  const scoreValue = props.score?.overall ?? null;
  const jobMeta = useMemo(
    () =>
      [props.scrapedJob.company, props.scrapedJob.location]
        .filter(Boolean)
        .join(" / "),
    [props.scrapedJob.company, props.scrapedJob.location],
  );
  const sidebarClassName = `slothing-sidebar dock-${props.layout.dock}`;

  function sidebarStyle(): React.CSSProperties | undefined {
    if (props.layout.dock === "left") {
      return { left: 0, right: "auto" };
    }
    if (props.layout.dock === "floating" && props.layout.position) {
      return {
        left: `${props.layout.position.x}px`,
        right: "auto",
        top: `${props.layout.position.y}px`,
      };
    }
    return undefined;
  }

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, input, textarea, select, a")) return;

    const sidebar = event.currentTarget.closest(".slothing-sidebar");
    if (!sidebar) return;
    const rect = sidebar.getBoundingClientRect();
    const nextPosition = clampSidebarPosition(
      rect.left,
      rect.top,
      rect.width,
      rect.height,
    );
    props.onLayoutChange({ dock: "floating", position: nextPosition });
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: nextPosition.x,
      originY: nextPosition.y,
      width: rect.width,
      height: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const x = drag.originX + event.clientX - drag.startX;
    const y = drag.originY + event.clientY - drag.startY;
    props.onLayoutChange({
      dock: "floating",
      position: clampSidebarPosition(x, y, drag.width, drag.height),
    });
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragState.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // The browser may release capture first if the pointer is canceled.
    }
  }

  function floatAtCurrentPosition(event: React.MouseEvent<HTMLButtonElement>) {
    const sidebar = event.currentTarget.closest(".slothing-sidebar");
    if (!sidebar) return;
    const rect = sidebar.getBoundingClientRect();
    props.onLayoutChange({
      dock: "floating",
      position: clampSidebarPosition(
        rect.left,
        rect.top,
        rect.width,
        rect.height,
      ),
    });
  }

  async function runAction(
    action: SidebarAction,
    callback: () => Promise<unknown>,
  ) {
    setActiveAction(action);
    setActionFeedback(null);
    setNotice(null);

    try {
      const result = await callback();
      const fillResult = isAutoFillResult(result) ? result : null;
      if (action === "autoFill" && fillResult) {
        const conflicts = fillResult.conflicts ?? 0;
        setAutoFillConflicts(conflicts);
        const conflictCopy =
          conflicts > 0
            ? `. Skipped ${conflicts} field${conflicts === 1 ? "" : "s"} with existing values.`
            : "";
        setActionFeedback({
          action,
          label: `Filled ${fillResult.filled ?? 0}${conflictCopy}`,
        });
        return;
      }
      setActionFeedback({
        action,
        label: action === "autoFill" ? "Fields updated" : "Done",
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message: (error as Error).message || `${ACTION_LABELS[action]} failed.`,
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchError(null);
    try {
      setAnswers(await props.onSearchAnswers(trimmed));
    } catch (error) {
      setSearchError((error as Error).message || "Answer search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function copyAnswer(answer: SimilarAnswer) {
    await navigator.clipboard.writeText(answer.answer);
    setNotice({ kind: "success", message: "Answer copied." });
  }

  if (props.layout.collapsed) {
    return (
      <aside
        className={sidebarClassName}
        style={sidebarStyle()}
        aria-label="Slothing job sidebar"
      >
        <button
          className="rail"
          type="button"
          onClick={() => props.onLayoutChange({ collapsed: false })}
          aria-label="Open Slothing sidebar"
          title="Open Slothing sidebar"
        >
          <span className="rail-score">{scoreValue ?? "--"}</span>
          <span className="rail-label">Slothing</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={sidebarClassName}
      style={sidebarStyle()}
      aria-label="Slothing job sidebar"
    >
      <div className="panel">
        <header
          className="header"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          title="Drag to move"
        >
          <div>
            <div className="workspace-brand-row">
              <img
                className="workspace-mark"
                src={chrome.runtime.getURL("brand/slothing-mark.png")}
                alt=""
              />
              <span>Slothing</span>
            </div>
            <h2 className="title">{props.scrapedJob.title}</h2>
            <p className="company">{jobMeta || props.scrapedJob.company}</p>
          </div>
          <div className="icon-row">
            <button
              className="icon-button"
              type="button"
              onClick={() => props.onLayoutChange({ dock: "left" })}
              aria-label="Dock Slothing sidebar on the left"
              title="Dock left"
            >
              &lsaquo;
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => props.onLayoutChange({ dock: "right" })}
              aria-label="Dock Slothing sidebar on the right"
              title="Dock right"
            >
              &rsaquo;
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={floatAtCurrentPosition}
              aria-label="Float Slothing sidebar"
              title="Float"
            >
              &#9633;
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => props.onLayoutChange({ collapsed: true })}
              aria-label="Collapse Slothing sidebar"
              title="Collapse"
            >
              -
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => void props.onDismiss()}
              aria-label="Dismiss Slothing sidebar for this domain"
              title="Dismiss for this domain"
            >
              &times;
            </button>
          </div>
        </header>

        <div className="body">
          <section className="score-card" aria-label="Match score">
            <div>
              <p className="score-label">
                {scoreValue === null ? "Profile needed" : "Match score"}
              </p>
              <p className="score-note">
                {scoreValue === null
                  ? "Connect your profile to score this job."
                  : "Based on your profile and this job description."}
              </p>
            </div>
            <div className="score-pill" aria-label="Match score value">
              <span>{scoreValue ?? "--"}</span>
              {scoreValue !== null && <small>/100</small>}
            </div>
          </section>

          <section className="actions" aria-label="Job actions">
            <ActionButton
              label="Tailor resume"
              activeLabel="Tailoring..."
              active={activeAction === "tailor"}
              feedback={
                actionFeedback?.action === "tailor"
                  ? actionFeedback.label
                  : undefined
              }
              disabled={activeAction !== null}
              primary
              onClick={() => runAction("tailor", props.onTailor)}
            />
            <ActionButton
              label="Cover letter"
              activeLabel="Generating..."
              active={activeAction === "coverLetter"}
              feedback={
                actionFeedback?.action === "coverLetter"
                  ? actionFeedback.label
                  : undefined
              }
              disabled={activeAction !== null}
              onClick={() => runAction("coverLetter", props.onCoverLetter)}
            />
            <ActionButton
              label="Save job"
              activeLabel="Saving..."
              active={activeAction === "save"}
              feedback={actionFeedback?.action === "save" ? "Saved" : undefined}
              disabled={activeAction !== null}
              onClick={() => runAction("save", props.onSave)}
            />
            <ActionButton
              label={
                props.detectedFieldCount > 0
                  ? `Auto-fill ${props.detectedFieldCount} fields`
                  : "Auto-fill"
              }
              activeLabel="Filling..."
              active={activeAction === "autoFill"}
              feedback={
                actionFeedback?.action === "autoFill"
                  ? actionFeedback.label
                  : undefined
              }
              disabled={activeAction !== null || props.detectedFieldCount === 0}
              onClick={() =>
                runAction("autoFill", () =>
                  props.onAutoFill({ overwriteExisting: false }),
                )
              }
            />
            {autoFillConflicts > 0 && (
              <ActionButton
                label={`Overwrite ${autoFillConflicts} skipped field${autoFillConflicts === 1 ? "" : "s"}`}
                activeLabel="Overwriting..."
                active={activeAction === "autoFill"}
                disabled={activeAction !== null}
                onClick={() =>
                  runAction("autoFill", () =>
                    props.onAutoFill({ overwriteExisting: true }),
                  )
                }
              />
            )}
          </section>

          {props.detectedUploadCount > 0 && (
            <section
              className="status-card"
              aria-label="Document upload handoff"
            >
              <strong>Resume upload detected</strong>
              <span>
                Slothing cannot attach files for you. Download your latest
                document, then upload it manually on this application.
              </span>
              {props.latestResume && (
                <span className="muted">{props.latestResume.name}</span>
              )}
              <button
                className="small-button"
                type="button"
                onClick={() => void props.onOpenLatestResume()}
              >
                {props.latestResume ? "Open latest resume" : "Open Studio"}
              </button>
            </section>
          )}

          {notice?.kind === "error" && (
            <div className={`status-card ${notice.kind}`} role="status">
              {notice.message}
            </div>
          )}

          <details className="utility-section">
            <summary>AI assistant</summary>
            <ChatPanel
              onStream={props.onChatStream}
              onUseInCoverLetter={props.onUseInCoverLetter}
            />
          </details>

          <details className="utility-section">
            <summary>Answer bank</summary>
            <section className="answer-bank" aria-label="Answer bank search">
              <form className="search-row" onSubmit={handleSearch}>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search saved answers"
                  aria-label="Search saved answers"
                />
                <button type="submit" disabled={searching || !query.trim()}>
                  {searching ? "..." : "Search"}
                </button>
              </form>
              {searchError && (
                <p className="status-card error">{searchError}</p>
              )}
              <div className="results">
                {answers.map((answer) => (
                  <article className="result" key={answer.id}>
                    <p className="result-question">{answer.question}</p>
                    <p className="result-answer">{answer.answer}</p>
                    <p className="result-meta">
                      {Math.round(answer.similarity * 100)}% match / used{" "}
                      {answer.timesUsed} times
                    </p>
                    <div className="result-actions">
                      <button
                        className="small-button secondary"
                        type="button"
                        onClick={() => copyAnswer(answer)}
                      >
                        Copy
                      </button>
                      <button
                        className="small-button"
                        type="button"
                        onClick={() => void props.onApplyAnswer(answer)}
                      >
                        Apply
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </details>
        </div>
      </div>
    </aside>
  );
}

function isAutoFillResult(value: unknown): value is AutoFillActionResult {
  return Boolean(
    value &&
    typeof value === "object" &&
    ("filled" in value || "conflicts" in value || "skipped" in value),
  );
}

function clampSidebarPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): SidebarPosition {
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(Math.max(x, margin), maxX),
    y: Math.min(Math.max(y, margin), maxY),
  };
}

function ActionButton({
  label,
  activeLabel,
  active,
  feedback,
  disabled,
  primary,
  onClick,
}: {
  label: string;
  activeLabel: string;
  active: boolean;
  feedback?: string;
  disabled: boolean;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`action-button${primary ? " primary" : ""}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <span>{active ? activeLabel : feedback || label}</span>
      {(active || feedback) && (
        <span className="action-status" aria-hidden="true">
          {feedback ? "Done" : "Working"}
        </span>
      )}
    </button>
  );
}
