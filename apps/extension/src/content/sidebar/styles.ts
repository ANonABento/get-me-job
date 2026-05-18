export const SIDEBAR_STYLES = `
:host {
  all: initial;
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --slothing-bg: #f5efe2;
  --slothing-bg-2: #e9dec8;
  --slothing-paper: #fffaef;
  --slothing-ink: #1a1530;
  --slothing-ink-2: #3a2f24;
  --slothing-ink-3: #6a5e4a;
  --slothing-rule: rgba(26, 20, 16, 0.12);
  --slothing-rule-strong: rgba(26, 20, 16, 0.4);
  --slothing-rule-strong-bg: rgba(26, 20, 16, 0.07);
  --slothing-brand: #b8704a;
  --slothing-brand-dark: #8e5132;
  --slothing-brand-soft: #f0d9c1;
  --slothing-success: #2f6b4f;
  --slothing-success-soft: #dcebdc;
  --slothing-danger: #991b1b;
  --slothing-danger-soft: #f3d6d1;
  --slothing-shadow: 0 16px 42px rgba(26, 21, 48, 0.18);
}

*, *::before, *::after {
  box-sizing: border-box;
}

.slothing-sidebar {
  position: fixed;
  top: clamp(72px, 10vh, 96px);
  right: 0;
  z-index: 2147483000;
  color: var(--slothing-ink);
  font-family: inherit;
}

.slothing-sidebar.dock-left {
  left: 0;
  right: auto;
}

.slothing-sidebar[hidden] {
  display: none;
}

.rail,
.panel {
  border: 1px solid var(--slothing-rule);
  box-shadow: var(--slothing-shadow);
}

.rail {
  display: grid;
  grid-template-rows: auto auto;
  justify-items: center;
  align-items: center;
  gap: 8px;
  width: 52px;
  min-height: 116px;
  padding: 10px 7px;
  border-right: 0;
  border-radius: 8px 0 0 8px;
  background: var(--slothing-paper);
  cursor: pointer;
}

.dock-left .rail {
  border-right: 1px solid var(--slothing-rule);
  border-left: 0;
  border-radius: 0 8px 8px 0;
}

.rail-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  min-height: 30px;
  border-radius: 999px;
  background: var(--slothing-brand-soft);
  color: var(--slothing-brand-dark);
  font-size: 12px;
  font-weight: 800;
  writing-mode: horizontal-tb;
}

.rail-label {
  max-width: 44px;
  color: var(--slothing-ink);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.1;
  text-align: center;
  writing-mode: horizontal-tb;
}

.panel {
  width: min(330px, calc(100vw - 28px));
  max-height: min(720px, calc(100vh - 96px));
  overflow: auto;
  border-right: 0;
  border-radius: 8px 0 0 8px;
  background: var(--slothing-bg);
}

.dock-left .panel {
  border-right: 1px solid var(--slothing-rule);
  border-left: 0;
  border-radius: 0 8px 8px 0;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--slothing-rule);
  background: var(--slothing-paper);
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.header:active {
  cursor: grabbing;
}

.brand {
  margin: 0 0 8px;
  color: var(--slothing-brand-dark);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.workspace-brand-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 7px;
  color: var(--slothing-brand-dark);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.workspace-mark {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  object-fit: cover;
}

.title {
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.company {
  margin: 3px 0 0;
  color: #536068;
  font-size: 13px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.icon-row {
  display: flex;
  gap: 4px;
}

button {
  border: 0;
  font: inherit;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--slothing-brand);
  outline-offset: 2px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--slothing-rule);
  background: var(--slothing-bg);
  color: var(--slothing-ink);
  cursor: pointer;
}

.icon-button:hover {
  background: var(--slothing-rule-strong-bg);
}

.body {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.score-card,
.actions,
.status-card {
  border: 1px solid var(--slothing-rule);
  border-radius: 8px;
  background: var(--slothing-paper);
}

.score-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
}

.score-pill {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: 58px;
  justify-content: flex-end;
  padding: 5px 8px;
  border: 1px solid rgba(184, 112, 74, 0.3);
  border-radius: 999px;
  background: var(--slothing-brand-soft);
  color: var(--slothing-ink);
}

.score-pill span {
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
}

.score-pill small {
  color: var(--slothing-brand-dark);
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.score-label {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
}

.score-note,
.muted,
.result-meta {
  color: var(--slothing-ink-3);
  font-size: 11px;
  line-height: 1.4;
}

.actions {
  display: grid;
  gap: 6px;
  padding: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 36px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--slothing-rule);
  background: var(--slothing-paper);
  color: var(--slothing-ink);
  font-weight: 750;
  cursor: pointer;
}

.action-status {
  color: var(--slothing-success);
  font-size: 10px;
  font-weight: 850;
  text-transform: uppercase;
}

.action-button.primary {
  background: var(--slothing-ink);
  color: var(--slothing-paper);
}

.action-button:hover:not(:disabled) {
  filter: brightness(0.96);
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.status-card {
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
}

.status-card.success {
  border-color: rgba(47, 107, 79, 0.3);
  color: var(--slothing-success);
  background: var(--slothing-success-soft);
}

.status-card.error {
  border-color: rgba(153, 27, 27, 0.26);
  color: var(--slothing-danger);
  background: var(--slothing-danger-soft);
}

.utility-section {
  border: 1px solid var(--slothing-rule);
  border-radius: 8px;
  background: var(--slothing-paper);
}

.utility-section summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 0 10px;
  color: var(--slothing-ink);
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
  list-style: none;
}

.utility-section summary::-webkit-details-marker {
  display: none;
}

.utility-section summary::after {
  content: "+";
  color: var(--slothing-ink-3);
  font-weight: 900;
}

.utility-section[open] summary {
  border-bottom: 1px solid var(--slothing-rule);
}

.utility-section[open] summary::after {
  content: "-";
}

.answer-bank {
  padding: 10px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 850;
}

.search-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.search-row input {
  width: 100%;
  min-width: 0;
  height: 34px;
  border: 1px solid var(--slothing-rule);
  border-radius: 6px;
  padding: 0 10px;
  color: var(--slothing-ink);
  font: inherit;
  font-size: 13px;
}

.search-row button,
.small-button {
  min-height: 34px;
  border-radius: 6px;
  padding: 0 10px;
  border: 1px solid var(--slothing-ink);
  background: var(--slothing-ink);
  color: var(--slothing-paper);
  cursor: pointer;
}

.results {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.result {
  border-top: 1px solid var(--slothing-rule);
  padding-top: 8px;
}

.result-question,
.result-answer {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

.result-question {
  font-weight: 800;
}

.result-answer {
  margin-top: 4px;
  color: var(--slothing-ink-2);
}

.result-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.small-button {
  min-height: 28px;
  padding: 0 8px;
  font-size: 12px;
}

.small-button.secondary {
  border-color: var(--slothing-rule);
  background: var(--slothing-paper);
  color: var(--slothing-ink);
}

/* P4/#40 — Inline AI assistant chat panel */
.chat-panel {
  border: 0;
  border-radius: 0;
  padding: 10px;
}

.chat-panel .section-title {
  display: none;
}

.chat-seed-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
}

.chat-seed-row .small-button {
  width: 100%;
  min-height: 32px;
  padding: 0 8px;
  font-size: 12px;
  white-space: normal;
  line-height: 1.2;
}

.chat-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  align-items: end;
}

.chat-input-row textarea {
  width: 100%;
  min-width: 0;
  resize: vertical;
  min-height: 36px;
  max-height: 120px;
  border: 1px solid var(--slothing-rule);
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--slothing-ink);
  font: inherit;
  font-size: 13px;
  line-height: 1.35;
  background: var(--slothing-paper);
}

.chat-input-row textarea:disabled {
  background: var(--slothing-bg-2);
  color: var(--slothing-ink-3);
}

.chat-result {
  margin-top: 10px;
  min-height: 16px;
}

.chat-spinner {
  margin: 0;
  color: var(--slothing-ink-3);
  font-size: 12px;
  font-style: italic;
}

.chat-output {
  margin: 0;
  color: var(--slothing-ink);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chat-error {
  margin-top: 8px;
}

.chat-use-cta {
  margin-top: 10px;
  width: 100%;
}

@media (max-width: 1023px) {
  .slothing-sidebar {
    display: none;
  }
}
`;
