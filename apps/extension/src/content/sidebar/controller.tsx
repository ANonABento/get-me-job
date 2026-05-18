import React from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
  ExtensionProfile,
  ExtensionResumeSummary,
  ExtensionSettings,
  SidebarLayout,
  SimilarAnswer,
  ScrapedJob,
} from "@/shared/types";
import { JobPageSidebar } from "./job-page-sidebar";
import type { ChatIntent } from "./chat-panel";
import { computeJobMatchScore } from "./scoring";
import {
  DEFAULT_SIDEBAR_LAYOUT,
  dismissSidebarForDomain,
  getSidebarLayoutForDomain,
  isSidebarDismissedForDomain,
  normalizeSidebarDomain,
  restoreSidebarForDomain,
  setSidebarLayoutForDomain,
} from "./storage";
import { SIDEBAR_STYLES } from "./styles";

const HOST_ID = "slothing-job-page-sidebar-host";
const DESKTOP_MIN_WIDTH = 1024;

export interface SidebarControllerUpdate {
  scrapedJob: ScrapedJob | null;
  detectedFieldCount: number;
  detectedUploadCount: number;
  latestResume: ExtensionResumeSummary | null;
  profile: ExtensionProfile | null;
  settings?: ExtensionSettings | null;
  onTailor: () => Promise<void>;
  onCoverLetter: () => Promise<void>;
  onSave: () => Promise<void>;
  onAutoFill: (options?: { overwriteExisting?: boolean }) => Promise<unknown>;
  onOpenLatestResume: () => Promise<void>;
  onSearchAnswers: (query: string) => Promise<SimilarAnswer[]>;
  onApplyAnswer: (answer: SimilarAnswer) => Promise<void> | void;
  /**
   * P4/#40 — Streaming AI assistant. The content-script wires this to a
   * chrome.runtime.connect port toward the background.
   */
  onChatStream: (params: {
    prompt: string;
    intent: ChatIntent;
    onToken: (token: string) => void;
    signal: AbortSignal;
  }) => Promise<void>;
  /** P4/#40 — Deep-link `/studio?mode=cover_letter&jobId=...&seed=...`. */
  onUseInCoverLetter: (seedText: string) => void;
}

export class JobPageSidebarController {
  private host: HTMLElement | null = null;
  private root: Root | null = null;
  private state: SidebarControllerUpdate | null = null;
  private layout: SidebarLayout = DEFAULT_SIDEBAR_LAYOUT;
  private dismissedDomain: string | null = null;
  private readonly handleResize = () => this.render();

  constructor() {
    window.addEventListener("resize", this.handleResize);
  }

  async update(next: SidebarControllerUpdate) {
    this.state = next;
    this.dismissedDomain = (await isSidebarDismissedForDomain())
      ? normalizeSidebarDomain(window.location.hostname)
      : null;
    this.layout = await getSidebarLayoutForDomain();
    this.render();
  }

  showCollapsed() {
    void this.updateLayout({ collapsed: true });
    this.render();
  }

  async dismissDomain() {
    await dismissSidebarForDomain();
    this.dismissedDomain = normalizeSidebarDomain(window.location.hostname);
    this.unmount();
  }

  async restoreDomain() {
    await restoreSidebarForDomain();
    this.dismissedDomain = null;
    await this.updateLayout({ collapsed: false });
    this.render();
  }

  getStatus() {
    return {
      visible: !!this.root && !!this.state?.scrapedJob && !this.dismissedDomain,
      dismissed:
        this.dismissedDomain ===
        normalizeSidebarDomain(window.location.hostname),
      layout: this.layout,
    };
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.unmount();
    this.state = null;
  }

  private render() {
    if (
      !this.state?.scrapedJob ||
      window.innerWidth < DESKTOP_MIN_WIDTH ||
      this.dismissedDomain === normalizeSidebarDomain(window.location.hostname)
    ) {
      this.unmount();
      return;
    }

    const root = this.ensureRoot();
    const score = computeJobMatchScore(
      this.state.profile,
      this.state.scrapedJob,
    );

    root.render(
      <JobPageSidebar
        scrapedJob={this.state.scrapedJob}
        detectedFieldCount={this.state.detectedFieldCount}
        detectedUploadCount={this.state.detectedUploadCount}
        latestResume={this.state.latestResume}
        score={score}
        layout={this.layout}
        onLayoutChange={(updates) => {
          void this.updateLayout(updates);
        }}
        onDismiss={() => this.dismissDomain()}
        onTailor={this.state.onTailor}
        onCoverLetter={this.state.onCoverLetter}
        onSave={this.state.onSave}
        onAutoFill={this.state.onAutoFill}
        onOpenLatestResume={this.state.onOpenLatestResume}
        onSearchAnswers={this.state.onSearchAnswers}
        onApplyAnswer={this.state.onApplyAnswer}
        onChatStream={this.state.onChatStream}
        onUseInCoverLetter={this.state.onUseInCoverLetter}
      />,
    );
  }

  private async updateLayout(updates: Partial<SidebarLayout>) {
    this.layout = { ...this.layout, ...updates };
    if (this.layout.dock !== "floating") {
      this.layout.position = null;
    }
    this.render();
    this.layout = await setSidebarLayoutForDomain(this.layout);
    this.render();
  }

  private ensureRoot(): Root {
    if (this.root) return this.root;

    const existing = document.getElementById(HOST_ID);
    this.host = existing || document.createElement("div");
    this.host.id = HOST_ID;

    if (!existing) {
      document.documentElement.appendChild(this.host);
    }

    const shadowRoot =
      this.host.shadowRoot || this.host.attachShadow({ mode: "open" });
    if (!shadowRoot.querySelector("style")) {
      const style = document.createElement("style");
      style.textContent = SIDEBAR_STYLES;
      shadowRoot.appendChild(style);
    }

    let mount = shadowRoot.querySelector<HTMLElement>("[data-sidebar-root]");
    if (!mount) {
      mount = document.createElement("div");
      mount.dataset.sidebarRoot = "true";
      shadowRoot.appendChild(mount);
    }

    this.root = createRoot(mount);
    return this.root;
  }

  private unmount() {
    this.root?.unmount();
    this.root = null;
    this.host?.remove();
    this.host = null;
  }
}
