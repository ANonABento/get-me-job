#!/usr/bin/env tsx

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

interface SuiteCase {
  name: string;
  source: string;
  reference?: string;
  fixtureClass?: string;
  expectedSections?: string[];
  expectedStyleTraits?: string[];
}

interface FixtureManifest {
  version: 1;
  cases: SuiteCase[];
}

const defaultCases: SuiteCase[] = [
  {
    name: "kevin-resume-pdf",
    source: "/home/anonabento/Downloads/KevinJiang_Resume.pdf",
  },
  {
    name: "kevin-software-pdf",
    source: "/home/anonabento/Downloads/KevinJiang_Software.pdf",
  },
  {
    name: "master-resume-docx",
    source: "/home/anonabento/Downloads/Master Resume.docx",
    reference: "/home/anonabento/Downloads/Master Resume.pdf",
  },
  {
    name: "master-resume-pdf",
    source: "/home/anonabento/Downloads/Master Resume.pdf",
  },
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(args.outDir, { recursive: true });
  const cases: SuiteCase[] = args.sources.length
    ? args.sources.map((source) => ({
        name: sanitizeBasename(path.basename(source)),
        source,
      }))
    : loadManifestCases(args.manifest).filter((item) =>
        existsSync(item.source),
      );

  const summaries = [];
  for (const item of cases) {
    const caseOutDir = path.join(args.outDir, item.name);
    const command = [
      "dogfood:template",
      "--",
      "--source",
      item.source,
      "--out",
      caseOutDir,
    ];
    const reference = args.referenceBySource.get(item.source) ?? item.reference;
    if (reference) command.push("--reference", reference);
    if (args.strict) command.push("--strict");
    if (args.strictVisual) command.push("--strict-visual");
    execFileSync("pnpm", command, {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    const summary = JSON.parse(
      readFileSync(path.join(caseOutDir, "summary.json"), "utf8"),
    ) as Record<string, unknown>;
    const scorecard = scoreCase(summary, item);
    summary.fixture = {
      name: item.name,
      class: item.fixtureClass ?? "ad-hoc",
      expectedSections: item.expectedSections ?? [],
      expectedStyleTraits: item.expectedStyleTraits ?? [],
    };
    summary.scorecard = scorecard;
    writeFileSync(
      path.join(caseOutDir, "scorecard.json"),
      `${JSON.stringify(scorecard, null, 2)}\n`,
    );
    writeFileSync(
      path.join(caseOutDir, "summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    summaries.push(summary);
  }

  const suiteSummary = {
    createdAt: new Date().toISOString(),
    outDir: args.outDir,
    caseCount: summaries.length,
    aggregate: aggregateScorecards(summaries),
    cases: summaries,
  };
  writeFileSync(
    path.join(args.outDir, "suite-summary.json"),
    `${JSON.stringify(suiteSummary, null, 2)}\n`,
  );
  writeFileSync(
    path.join(args.outDir, "lab.html"),
    renderLabHtml(suiteSummary, args.outDir),
  );
  console.log(
    `[visual-template-suite] wrote ${path.join(args.outDir, "suite-summary.json")}`,
  );
  console.log(
    `[visual-template-suite] lab ${path.join(args.outDir, "lab.html")}`,
  );
}

function parseArgs(argv: string[]) {
  const sources: string[] = [];
  const referenceBySource = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--source" && argv[index + 1]) {
      sources.push(path.resolve(argv[index + 1]));
      index += 1;
      continue;
    }
    if (
      argv[index] === "--reference" &&
      sources[sources.length - 1] &&
      argv[index + 1]
    ) {
      referenceBySource.set(
        sources[sources.length - 1],
        path.resolve(argv[index + 1]),
      );
      index += 1;
    }
  }
  const outIndex = argv.findIndex((arg) => arg === "--out");
  const manifestIndex = argv.findIndex((arg) => arg === "--manifest");
  const defaultOut = path.join(
    process.cwd(),
    ".dogfood",
    "visual-template-suite",
    new Date().toISOString().replace(/[:.]/g, "-"),
  );
  return {
    sources,
    referenceBySource,
    outDir: path.resolve(outIndex >= 0 ? argv[outIndex + 1] : defaultOut),
    manifest:
      manifestIndex >= 0
        ? path.resolve(argv[manifestIndex + 1])
        : path.join(
            process.cwd(),
            "tests",
            "fixtures",
            "visual-template-import",
            "manifest.json",
          ),
    strict: argv.includes("--strict"),
    strictVisual: argv.includes("--strict-visual"),
  };
}

function loadManifestCases(manifestPath: string): SuiteCase[] {
  if (!existsSync(manifestPath)) return defaultCases;
  const manifest = JSON.parse(
    readFileSync(manifestPath, "utf8"),
  ) as FixtureManifest;
  return manifest.cases.map((item) => ({
    ...item,
    source: path.resolve(process.cwd(), item.source),
    reference: item.reference
      ? path.resolve(process.cwd(), item.reference)
      : undefined,
  }));
}

function scoreCase(summary: Record<string, unknown>, item: SuiteCase) {
  const universalAnalysis = objectAt(summary, "universalAnalysis");
  const scores = objectAt(universalAnalysis, "scores");
  const semanticResume = objectAt(summary, "semanticResume");
  const sections = Array.isArray(semanticResume.sections)
    ? semanticResume.sections
    : [];
  const detectedSections = sections
    .map((section) => (isRecord(section) ? String(section.type ?? "") : ""))
    .filter(Boolean);
  const expectedSections = item.expectedSections ?? [];
  const matchedSections = expectedSections.filter((section) =>
    detectedSections.includes(section),
  );
  const reusableTemplate = objectAt(summary, "reusableTemplate");
  const reusableSectionCount = Array.isArray(reusableTemplate.sectionOrder)
    ? reusableTemplate.sectionOrder.length
    : 0;
  const reports = Array.isArray(summary.reports) ? summary.reports : [];
  const stressReport = reports.find(
    (report) => isRecord(report) && report.mode === "stress",
  );
  const sourceReport = reports.find(
    (report) => isRecord(report) && report.mode === "source",
  );
  const semanticCoverage = numberAt(scores, "semanticCoverage");
  const styleCoverage = numberAt(scores, "styleCoverage");
  const layoutResilience =
    1 -
    Math.min(
      1,
      numberAt(stressReport, "overflowElements") * 0.3 +
        numberAt(stressReport, "repeatedLineCount") * 0.15,
    );
  const referenceResemblance =
    1 -
    Math.min(
      1,
      numberAt(objectAt(sourceReport, "imageComparison"), "changedPixelRatio"),
    );
  const sectionCoverage = expectedSections.length
    ? matchedSections.length / expectedSections.length
    : 1;
  const pass =
    sectionCoverage >= 0.75 &&
    semanticCoverage >= 0.55 &&
    styleCoverage >= 0.45 &&
    layoutResilience >= 0.7 &&
    reusableSectionCount > 0;

  return {
    fixtureClass: item.fixtureClass ?? "ad-hoc",
    pass,
    scores: {
      sectionCoverage,
      semanticCoverage,
      styleCoverage,
      layoutResilience,
      referenceResemblance,
    },
    expectedSections,
    detectedSections,
    matchedSections,
    reusableSectionCount,
    notes: [
      ...(sectionCoverage < 0.75 ? ["Expected sections were missed."] : []),
      ...(semanticCoverage < 0.55 ? ["Semantic coverage below gate."] : []),
      ...(styleCoverage < 0.45 ? ["Style coverage below gate."] : []),
      ...(layoutResilience < 0.7
        ? ["Stress render resilience below gate."]
        : []),
      ...(reusableSectionCount === 0
        ? ["No reusable sections generated."]
        : []),
    ],
  };
}

function aggregateScorecards(summaries: Array<Record<string, unknown>>) {
  const scorecards = summaries
    .map((summary) => summary.scorecard)
    .filter(isRecord);
  const count = scorecards.length;
  const passed = scorecards.filter((scorecard) => scorecard.pass).length;
  return {
    passed,
    failed: count - passed,
    passRate: count ? passed / count : 0,
    averageScores: {
      sectionCoverage: averageScore(scorecards, "sectionCoverage"),
      semanticCoverage: averageScore(scorecards, "semanticCoverage"),
      styleCoverage: averageScore(scorecards, "styleCoverage"),
      layoutResilience: averageScore(scorecards, "layoutResilience"),
      referenceResemblance: averageScore(scorecards, "referenceResemblance"),
    },
  };
}

function averageScore(
  scorecards: Record<string, unknown>[],
  key: string,
): number {
  if (!scorecards.length) return 0;
  return (
    scorecards.reduce(
      (total, scorecard) =>
        total + numberAt(objectAt(scorecard, "scores"), key),
      0,
    ) / scorecards.length
  );
}

function objectAt(source: unknown, key: string): Record<string, unknown> {
  if (!isRecord(source)) return {};
  const value = source[key];
  return isRecord(value) ? value : {};
}

function numberAt(source: unknown, key: string): number {
  if (!isRecord(source)) return 0;
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeBasename(value: string): string {
  return value.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-|-$/g, "");
}

function renderLabHtml(
  suiteSummary: {
    createdAt: string;
    outDir: string;
    caseCount: number;
    cases: Array<Record<string, unknown>>;
  },
  outDir: string,
): string {
  const data = JSON.stringify(makeBrowserSummary(suiteSummary, outDir));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Visual Template Lab</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4f1ea;
      --panel: #fffdf8;
      --ink: #171514;
      --muted: #6d6256;
      --line: #d8cfc1;
      --accent: #9b5c2f;
      --bad: #a33b2f;
      --warn: #9a6a16;
      --good: #27694e;
      --mono: "SFMono-Regular", "Roboto Mono", "Cascadia Mono", monospace;
      --sans: Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: var(--sans);
      min-width: 1180px;
    }
    button, select, input { font: inherit; }
    .shell {
      display: grid;
      grid-template-columns: 300px minmax(760px, 1fr) 340px;
      min-height: 100dvh;
    }
    .rail, .inspector {
      background: #ece5d8;
      border-right: 1px solid var(--line);
      padding: 18px;
    }
    .inspector {
      border-right: 0;
      border-left: 1px solid var(--line);
    }
    .brand {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--line);
    }
    h1 {
      margin: 0;
      font-size: 18px;
      line-height: 1.1;
      letter-spacing: 0;
    }
    .stamp, .label, .metric-label {
      font-family: var(--mono);
      color: var(--muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .case-list {
      display: grid;
      gap: 8px;
      margin-top: 18px;
    }
    .case-button {
      width: 100%;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--ink);
      text-align: left;
      padding: 10px;
      display: grid;
      gap: 7px;
      cursor: pointer;
    }
    .case-button[aria-selected="true"] {
      background: var(--panel);
      border-color: var(--accent);
    }
    .case-title {
      font-weight: 700;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .case-meta {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .chip {
      border: 1px solid var(--line);
      padding: 2px 6px;
      font: 10px var(--mono);
      color: var(--muted);
      background: rgba(255,255,255,.36);
    }
    .chip.bad { color: var(--bad); border-color: rgba(163,59,47,.4); }
    .chip.warn { color: var(--warn); border-color: rgba(154,106,22,.42); }
    .chip.good { color: var(--good); border-color: rgba(39,105,78,.38); }
    main {
      padding: 18px;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 14px;
      min-width: 0;
    }
    .toolbar {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: end;
      border-bottom: 1px solid var(--line);
      padding-bottom: 14px;
    }
    .toolbar h2 {
      margin: 0 0 6px;
      font-size: 24px;
      letter-spacing: 0;
      line-height: 1.05;
    }
    .path {
      color: var(--muted);
      font: 11px/1.35 var(--mono);
      overflow-wrap: anywhere;
    }
    .controls {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .seg {
      display: inline-flex;
      border: 1px solid var(--line);
      background: var(--panel);
    }
    .seg button {
      border: 0;
      border-right: 1px solid var(--line);
      background: transparent;
      padding: 8px 10px;
      cursor: pointer;
      font-size: 12px;
    }
    .seg button:last-child { border-right: 0; }
    .seg button[aria-pressed="true"] {
      background: var(--ink);
      color: var(--panel);
    }
    .viewer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      min-height: 0;
    }
    .pane {
      background: var(--panel);
      border: 1px solid var(--line);
      min-height: 0;
      display: grid;
      grid-template-rows: auto 1fr;
    }
    .pane-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 42px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--line);
      font-weight: 700;
      font-size: 13px;
    }
    .pane-body {
      min-height: 0;
      overflow: auto;
      padding: 14px;
      background: #d9d0c1;
    }
    .frame-wrap {
      display: grid;
      place-items: start center;
      min-width: 100%;
    }
    img.preview {
      max-width: 100%;
      background: white;
      border: 1px solid rgba(23,21,20,.16);
      box-shadow: 0 20px 40px rgba(52,43,33,.12);
    }
    iframe.preview {
      width: 816px;
      height: 1056px;
      border: 1px solid rgba(23,21,20,.16);
      background: white;
      transform-origin: top center;
    }
    .overlay-stage {
      position: relative;
      width: 816px;
      height: 1056px;
      background: white;
      border: 1px solid rgba(23,21,20,.16);
      box-shadow: 0 20px 40px rgba(52,43,33,.12);
    }
    .overlay-stage img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .overlay-stage img.top {
      opacity: var(--overlay-opacity, .5);
      mix-blend-mode: multiply;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 14px;
    }
    .metric {
      border-top: 1px solid var(--line);
      padding-top: 8px;
    }
    .metric-value {
      font: 18px/1.1 var(--mono);
      margin-top: 4px;
    }
    .finding-list, .links {
      display: grid;
      gap: 8px;
      margin-top: 14px;
    }
    .finding {
      border: 1px solid var(--line);
      background: rgba(255,255,255,.38);
      padding: 8px;
      display: grid;
      gap: 4px;
    }
    .finding.error { border-color: rgba(163,59,47,.55); }
    .finding.warning { border-color: rgba(154,106,22,.55); }
    a {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid rgba(155,92,47,.4);
    }
    .json {
      margin-top: 14px;
      max-height: 320px;
      overflow: auto;
      background: #171514;
      color: #f8f2e9;
      padding: 12px;
      font: 11px/1.45 var(--mono);
      white-space: pre-wrap;
    }
    .pane-body .json {
      margin-top: 0;
      max-height: none;
      width: 100%;
      min-height: 100%;
      border: 1px solid rgba(23,21,20,.16);
    }
    .range {
      display: inline-grid;
      grid-template-columns: auto 120px;
      gap: 8px;
      align-items: center;
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="rail">
      <div class="brand">
        <h1>Visual Template Lab</h1>
        <div class="stamp" id="createdAt"></div>
      </div>
      <div class="case-list" id="caseList"></div>
    </aside>
    <main>
      <section class="toolbar">
        <div>
          <div class="label">Selected fixture</div>
          <h2 id="title"></h2>
          <div class="path" id="sourcePath"></div>
        </div>
        <div class="controls">
          <div class="seg" id="leftMode"></div>
          <div class="seg" id="rightMode"></div>
          <label class="range"><span>Overlay</span><input id="overlayOpacity" type="range" min="0" max="100" value="50"></label>
        </div>
      </section>
      <section class="viewer">
        <div class="pane">
          <div class="pane-head"><span id="leftLabel"></span><a id="leftOpen" href="#" target="_blank">Open</a></div>
          <div class="pane-body"><div class="frame-wrap" id="leftPane"></div></div>
        </div>
        <div class="pane">
          <div class="pane-head"><span id="rightLabel"></span><a id="rightOpen" href="#" target="_blank">Open</a></div>
          <div class="pane-body"><div class="frame-wrap" id="rightPane"></div></div>
        </div>
      </section>
    </main>
    <aside class="inspector">
      <div class="label">Metrics</div>
      <div class="metric-grid" id="metrics"></div>
      <div class="label" style="margin-top:18px">Findings</div>
      <div class="finding-list" id="findings"></div>
      <div class="label" style="margin-top:18px">Artifacts</div>
      <div class="links" id="links"></div>
      <pre class="json" id="json"></pre>
    </aside>
  </div>
  <script>
    const suite = ${data};
    const state = { caseIndex: 0, left: "reference", right: "reusable", overlay: 50 };
    const modes = [
      ["reference", "Reference"],
      ["render", "Source render"],
      ["reusable", "Reusable render"],
      ["semantic", "Semantic tree"],
      ["style", "Style tokens"],
      ["reusableIr", "Reusable IR"],
      ["diff", "Diff"],
      ["stress", "Stress render"],
      ["html", "Rendered HTML"],
      ["overlay", "Overlay"]
    ];
    const $ = (id) => document.getElementById(id);
    function pct(value) { return Math.round((value || 0) * 100) + "%"; }
    function num(value, digits = 1) { return Number(value || 0).toFixed(digits); }
    function rel(file) { return file || ""; }
    function activeCase() { return suite.cases[state.caseIndex]; }
    function report(item, mode) { return item.reports.find((entry) => entry.mode === mode); }
    function severity(item) {
      const findings = item.reports.flatMap((entry) => entry.findings || []);
      if (findings.some((finding) => finding.severity === "error")) return "bad";
      if (findings.some((finding) => finding.severity === "warning")) return "warn";
      return "good";
    }
    function renderCases() {
      $("createdAt").textContent = suite.createdAt.slice(5, 16).replace("T", " ");
      $("caseList").innerHTML = suite.cases.map((item, index) => {
        const src = report(item, "source");
        const stress = report(item, "stress");
        return '<button class="case-button" aria-selected="' + (index === state.caseIndex) + '" data-index="' + index + '">' +
          '<span class="case-title">' + item.templateName + '</span>' +
          '<span class="case-meta">' +
          '<span class="chip">' + ((item.fixture && item.fixture.class) || "fixture") + '</span>' +
          '<span class="chip">' + item.sourceType + '</span>' +
          '<span class="chip ' + severity(item) + '">' + severity(item).toUpperCase() + '</span>' +
          '<span class="chip ' + (item.scorecard && item.scorecard.pass ? "good" : "warn") + '">SCORE ' + (item.scorecard && item.scorecard.pass ? "PASS" : "REVIEW") + '</span>' +
          '<span class="chip">SRC ' + (src ? src.overflowElements : "-") + ' overflow</span>' +
          '<span class="chip">STR ' + (stress ? stress.repeatedLineCount : "-") + ' repeat</span>' +
          '</span></button>';
      }).join("");
      document.querySelectorAll(".case-button").forEach((button) => {
        button.addEventListener("click", () => {
          state.caseIndex = Number(button.dataset.index);
          render();
        });
      });
    }
    function modeButtons(id, side) {
      $(id).innerHTML = modes.map(([key, label]) =>
        '<button aria-pressed="' + (state[side] === key) + '" data-mode="' + key + '">' + label + '</button>'
      ).join("");
      $(id).querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          state[side] = button.dataset.mode;
          render();
        });
      });
    }
    function artifact(item, mode) {
      const src = report(item, "source");
      const stress = report(item, "stress");
      const comparison = src && src.imageComparison;
      if (mode === "reference") return { label: "Reference", type: "image", path: item.referenceImagePath };
      if (mode === "render") return { label: "Source render", type: "image", path: src && src.screenshotPath };
      if (mode === "reusable") return { label: "Reusable render", type: "frame", path: item.reusableHtmlPath };
      if (mode === "semantic") return { label: "Semantic tree", type: "json", value: item.semanticResume };
      if (mode === "style") return { label: "Style tokens", type: "json", value: item.styleTokens };
      if (mode === "reusableIr") return { label: "Reusable IR", type: "json", value: item.reusableTemplate };
      if (mode === "diff") return { label: "Diff", type: "image", path: comparison && comparison.diffPath };
      if (mode === "stress") return { label: "Stress render", type: "image", path: stress && stress.screenshotPath };
      if (mode === "html") return { label: "Rendered HTML", type: "frame", path: src && src.htmlPath };
      if (mode === "overlay") return { label: "Overlay", type: "overlay", reference: item.referenceImagePath, render: src && src.screenshotPath };
      return { label: "Missing", type: "missing" };
    }
    function paintPane(side) {
      const item = activeCase();
      const data = artifact(item, state[side]);
      $(side + "Label").textContent = data.label;
      const link = $(side + "Open");
      const pane = $(side + "Pane");
      const path = data.path || data.render || data.reference || "";
      link.href = path;
      link.style.visibility = path ? "visible" : "hidden";
      if (data.type === "image" && data.path) {
        pane.innerHTML = '<img class="preview" src="' + data.path + '" alt="' + data.label + '">';
      } else if (data.type === "frame" && data.path) {
        pane.innerHTML = '<iframe class="preview" src="' + data.path + '"></iframe>';
      } else if (data.type === "json" && data.value) {
        pane.innerHTML = '<pre class="json"></pre>';
        pane.querySelector("pre").textContent = JSON.stringify(data.value, null, 2);
      } else if (data.type === "overlay" && data.reference && data.render) {
        pane.innerHTML = '<div class="overlay-stage" style="--overlay-opacity:' + (state.overlay / 100) + '"><img src="' + data.reference + '" alt="Reference"><img class="top" src="' + data.render + '" alt="Render"></div>';
      } else {
        pane.innerHTML = '<div class="path">No artifact for this mode.</div>';
      }
    }
    function metric(label, value, tone) {
      return '<div class="metric"><div class="metric-label">' + label + '</div><div class="metric-value" style="color:var(--' + (tone || "ink") + ')">' + value + '</div></div>';
    }
    function renderInspector() {
      const item = activeCase();
      const src = report(item, "source");
      const stress = report(item, "stress");
      const comparison = src && src.imageComparison;
      $("metrics").innerHTML = [
        metric("Source overflow", src ? src.overflowElements : "-", src && src.overflowElements ? "bad" : "good"),
        metric("Stress repeats", stress ? stress.repeatedLineCount : "-", stress && stress.repeatedLineCount ? "warn" : "good"),
        metric("Source coverage", src ? pct(src.sourceLineCoverage) : "-", src && src.sourceLineCoverage < .55 ? "warn" : "good"),
        metric("Stress coverage", stress ? pct(stress.sourceLineCoverage) : "-", stress && stress.sourceLineCoverage < .55 ? "warn" : "good"),
        metric("Semantic", item.universalAnalysis ? pct(item.universalAnalysis.scores.semanticCoverage) : "-", item.universalAnalysis && item.universalAnalysis.scores.semanticCoverage < .55 ? "warn" : "good"),
        metric("Style", item.universalAnalysis ? pct(item.universalAnalysis.scores.styleCoverage) : "-", item.universalAnalysis && item.universalAnalysis.scores.styleCoverage < .55 ? "warn" : "good"),
        metric("Section score", item.scorecard ? pct(item.scorecard.scores.sectionCoverage) : "-", item.scorecard && item.scorecard.scores.sectionCoverage < .75 ? "warn" : "good"),
        metric("Suite gate", item.scorecard ? (item.scorecard.pass ? "PASS" : "REVIEW") : "-", item.scorecard && item.scorecard.pass ? "good" : "warn"),
        metric("Reusable sections", item.reusableTemplate ? item.reusableTemplate.sectionOrder.length : "-", item.reusableTemplate && !item.reusableTemplate.sectionOrder.length ? "warn" : "good"),
        metric("Reusable components", item.reusableTemplate ? item.reusableTemplate.components.length : "-", item.reusableTemplate && item.reusableTemplate.components.length < 2 ? "warn" : "good"),
        metric("Image diff", comparison ? num(comparison.meanAbsoluteDiff) : "-", comparison && comparison.meanAbsoluteDiff > 32 ? "bad" : "good"),
        metric("Changed pixels", comparison ? pct(comparison.changedPixelRatio) : "-", comparison && comparison.changedPixelRatio > .42 ? "bad" : "good"),
      ].join("");
      const findings = item.reports.flatMap((entry) => (entry.findings || []).map((finding) => ({...finding, mode: entry.mode})));
      $("findings").innerHTML = findings.map((finding) =>
        '<div class="finding ' + finding.severity + '"><div class="stamp">' + finding.mode + ' / ' + finding.severity + ' / ' + finding.code + '</div><div>' + finding.message + '</div></div>'
      ).join("");
      const base = item.caseDir;
      $("links").innerHTML = [
        ["summary.json", base + "/summary.json"],
        ["template-v3.json", base + "/template-v3.json"],
        ["source-ir.json", base + "/source-ir.json"],
        ["universal-template-analysis.json", base + "/universal-template-analysis.json"],
        ["semantic-resume-ir.json", base + "/semantic-resume-ir.json"],
        ["style-tokens.json", base + "/style-tokens.json"],
        ["reusable-template-ir.json", base + "/reusable-template-ir.json"],
        ["reusable.html", base + "/reusable.html"],
        ["source-report.json", base + "/source-report.json"],
        ["stress-report.json", base + "/stress-report.json"],
        ["source.html", src && src.htmlPath],
        ["stress.html", stress && stress.htmlPath],
      ].filter(([, href]) => href).map(([label, href]) => '<a target="_blank" href="' + href + '">' + label + '</a>').join("");
      $("json").textContent = JSON.stringify(item, null, 2);
    }
    function render() {
      const item = activeCase();
      $("title").textContent = item.templateName + " / " + item.sourceType;
      $("sourcePath").textContent = item.source;
      renderCases();
      modeButtons("leftMode", "left");
      modeButtons("rightMode", "right");
      paintPane("left");
      paintPane("right");
      renderInspector();
      $("overlayOpacity").value = state.overlay;
    }
    $("overlayOpacity").addEventListener("input", (event) => {
      state.overlay = Number(event.target.value);
      document.querySelectorAll(".overlay-stage").forEach((node) => {
        node.style.setProperty("--overlay-opacity", state.overlay / 100);
      });
    });
    render();
  </script>
</body>
</html>`;
}

function makeBrowserSummary(
  suiteSummary: {
    createdAt: string;
    outDir: string;
    caseCount: number;
    cases: Array<Record<string, unknown>>;
  },
  outDir: string,
) {
  return {
    ...suiteSummary,
    outDir: ".",
    cases: suiteSummary.cases.map((item) => {
      const summary = item as {
        outDir: string;
        source: string;
        referenceImagePath?: string | null;
        reusableHtmlPath?: string | null;
        reports: Array<Record<string, unknown>>;
      };
      return {
        ...summary,
        caseDir: relativeForHtml(outDir, summary.outDir),
        referenceImagePath: summary.referenceImagePath
          ? relativeForHtml(outDir, summary.referenceImagePath)
          : null,
        reusableHtmlPath: summary.reusableHtmlPath
          ? relativeForHtml(outDir, summary.reusableHtmlPath)
          : null,
        reports: summary.reports.map((report) =>
          rewriteReportPaths(report, outDir),
        ),
      };
    }),
  };
}

function rewriteReportPaths(report: Record<string, unknown>, outDir: string) {
  const copy = { ...report } as Record<string, unknown>;
  for (const key of ["htmlPath", "screenshotPath"]) {
    if (typeof copy[key] === "string") {
      copy[key] = relativeForHtml(outDir, copy[key]);
    }
  }
  if (copy.imageComparison && typeof copy.imageComparison === "object") {
    const comparison = { ...(copy.imageComparison as Record<string, unknown>) };
    if (typeof comparison.diffPath === "string") {
      comparison.diffPath = relativeForHtml(outDir, comparison.diffPath);
    }
    copy.imageComparison = comparison;
  }
  return copy;
}

function relativeForHtml(fromDir: string, filename: string): string {
  return path.relative(fromDir, filename).split(path.sep).join("/");
}

main();
