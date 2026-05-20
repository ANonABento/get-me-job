# Universal Resume Template Import Spec

## Summary

Resume template import should produce a reusable semantic template that inherits
the uploaded resume's visual language. The app does not need pixel-perfect
replication as an end state. Pixel/visual extraction is evidence used to infer
structure, style, spacing, and confidence.

This spec supersedes the product framing in
`docs/specs/visual-template-layout-import-v3.md` when the two conflict. V3's
table/grid preservation remains useful evidence, but the saved app template must
be reusable and content-safe.

```text
Upload source
-> extract source evidence
-> infer semantic resume structure
-> infer style tokens and layout patterns
-> generate reusable template components
-> review mappings/styles/confidence
-> save semantic template
```

## Product Goal

Users can upload an existing resume in PDF, DOCX, or LaTeX and get a reusable
Slothing template that:

- preserves the resume's visual family: typography, color, spacing, rules,
  header treatment, bullet treatment, and section rhythm.
- supports normal editing: add/remove/reorder entries, replace bullets, hide
  sections, and export without duplicated or fixed-position content.
- exposes confidence and review controls when the importer is unsure.
- works across arbitrary resumes rather than only known fixtures.

## Non-Goals

- Pixel-perfect rendering as the saved template model.
- Hardcoded handling for a specific person's resume.
- Treating uploaded resume content as canonical profile/bank data without user
  confirmation.
- OCR-first support for scanned PDFs in the initial implementation.
- Full support for every Word drawing primitive, PDF graphic operator, or LaTeX
  package before the semantic pipeline is stable.

## Stage 1: Source Evidence Extraction

Normalize every source into an evidence IR. Existing `SourceDocumentIR` is the
current implementation target; the long-term normalized model should contain:

```ts
interface DocumentEvidenceIR {
  sourceType: "pdf" | "docx" | "tex";
  filename: string;
  pages: PageEvidence[];
  textBlocks: TextBlockEvidence[];
  lines: LineEvidence[];
  tables: TableEvidence[];
  shapes: ShapeEvidence[];
  links: LinkEvidence[];
  diagnostics: string[];
}
```

PDF evidence should capture:

- page size and margins when inferable.
- text positions, line grouping, and reading order.
- font size, family/weight when available, and approximate emphasis.
- sampled or operator-derived colors for text, bullets, links, and rules.
- horizontal rules and divider lines.
- bullet markers, indentation, and list rhythm.
- right-aligned date/meta columns and multi-column regions.

DOCX evidence should capture:

- paragraphs, headings, list numbering, hyperlinks, and style ids.
- table rows/cells, grid columns, spans, borders, padding, fills, and row
  metadata.
- run-level font family, size, weight, color, and italic.
- page size, margins, section settings, and column settings.

LaTeX evidence should capture:

- sections, list environments, tabular structures, links, and commands.
- common resume macros and simple custom macro expansion.
- style declarations: fonts, colors, rules, spacing, page geometry.
- repeated component intent from macros such as resume item, project, education,
  and subheading commands.

Acceptance gate:

- The lab can show the source evidence tree and diagnostics for any supported
  source.
- Extraction does not silently collapse table/list content into opaque strings
  when paragraph-level evidence exists.

## Stage 2: Semantic Resume Inference

Infer reusable resume structure from evidence. This layer should not assume
specific job titles, companies, schools, or project names.

```ts
interface ResumeSemanticIR {
  contact: SemanticContact;
  sections: SemanticSection[];
  warnings: SemanticWarning[];
}

interface SemanticSection {
  id: string;
  type:
    | "summary"
    | "experience"
    | "education"
    | "projects"
    | "skills"
    | "certifications"
    | "awards"
    | "publications"
    | "custom";
  title: string;
  items: SemanticResumeItem[];
  confidence: number;
  evidenceRefs: string[];
}

interface SemanticResumeItem {
  primary: string;
  secondary?: string;
  location?: string;
  dateRange?: string;
  meta: string[];
  url?: string;
  bullets: string[];
  confidence: number;
  evidenceRefs: string[];
}
```

Inference signals:

- section heading typography and aliases.
- repeated spacing rhythm.
- bold/strong leading text.
- right-aligned date-like text.
- bullet indentation and marker style.
- table row roles and cell alignment.
- LaTeX macro names and environments.
- link locations and contact-like patterns.

Required behavior:

- Section aliases are extensible and source-independent.
- Date detection is pattern-based and location-aware, not tied to one format.
- Project, experience, and education grouping uses repeated structure, not just
  the words "engineer" or "project".
- Continuation lines attach to the previous semantic item when visual/list
  evidence supports that grouping.
- Every inferred section and item has confidence and evidence refs.

Acceptance gate:

- The lab can show semantic coverage separately from style coverage.
- Stress data can be rendered without duplicate bullets or fixed source line
  artifacts.

## Stage 3: Style Token Inference

Extract reusable design tokens from the evidence layer.

```ts
interface ImportedTemplateStyleTokens {
  page: {
    size: string;
    widthPt: number;
    heightPt: number;
    margins: BoxEdges;
    background?: string;
  };
  typography: {
    name?: TypographyToken;
    sectionHeading?: TypographyToken;
    entryTitle?: TypographyToken;
    body?: TypographyToken;
    metadata?: TypographyToken;
    bullet?: TypographyToken;
  };
  color: {
    accent?: string;
    body?: string;
    muted?: string;
    rule?: string;
    bullet?: string;
    link?: string;
  };
  spacing: {
    sectionGapPt?: number;
    itemGapPt?: number;
    bulletGapPt?: number;
    lineHeight?: string;
  };
  rules: {
    sectionDivider?: RuleToken;
    headerDivider?: RuleToken;
  };
  layout: {
    headerMode?: "single-line" | "split" | "stacked" | "sidebar";
    dateAlignment?: "right-column" | "inline" | "below" | "unknown";
    sectionTitlePlacement?: "above" | "left-rail" | "inline";
    columns?: number;
  };
}
```

Style inference should use clusters:

- largest distinctive text near the top -> likely name typography.
- repeated uppercase or emphasized labels -> section heading typography.
- dominant paragraph text -> body typography.
- date/meta cells or right-aligned small text -> metadata typography.
- marker glyph/color/indent -> bullet style.
- horizontal lines near section headings -> section divider token.

Acceptance gate:

- The lab can show extracted tokens with evidence refs and confidence.
- A token can be user-overridden before save.

## Stage 4: Reusable Template Component IR

The saved template should render semantic data through reusable components.

```ts
interface UniversalTemplateIR {
  schemaVersion: 4;
  id: string;
  name: string;
  source: TemplateSourceRef;
  page: PageStyle;
  tokens: ImportedTemplateStyleTokens;
  components: TemplateComponent[];
  sectionOrder: string[];
  repeatRules: RepeatRule[];
  diagnostics: TemplateDiagnostic[];
}
```

Required components:

- `HeaderBlock`
- `ContactLine`
- `SectionHeading`
- `EntryHeader`
- `MetaLine`
- `BulletList`
- `SkillList`
- `EducationRow`
- `Rule`
- `Spacer`
- `CustomSection`

The renderer must consume semantic resume data and component styles. It must not
depend on absolute source text boxes in reusable mode.

Acceptance gate:

- Adding, deleting, or replacing bullets does not duplicate source content.
- Adding an item in a repeatable section uses the same component pattern.
- Empty sections can hide without preserving stale source whitespace.

## Stage 5: Review And Correction UX

The review UI should expose what the importer thinks, not hide it behind a
single preview.

Required panes:

- `Reference`: source preview or source render.
- `Reusable Render`: generated semantic template render.
- `Semantic Tree`: contact, sections, items, bullets, warnings.
- `Style Tokens`: typography, colors, rules, spacing, layout.
- `Mismatch Report`: low-confidence mappings and style gaps.
- `Stress Render`: longer/shorter generated content.

Editable review controls:

- assign/rename section type.
- split/merge semantic items.
- move bullets between items.
- choose style token source when multiple candidates exist.
- override accent color, body font, section divider, margins, and spacing.
- mark source content as decorative/non-template evidence.

Acceptance gate:

- A user can fix an incorrect section/item mapping without editing JSON.
- The app blocks or warns on low-confidence saves with actionable reasons.

## Stage 6: Verification And Fixtures

Verification must be broad and source-independent.

Fixture classes:

- one-page engineering resume.
- two-page resume.
- dense project-heavy resume.
- academic CV.
- business/marketing resume.
- two-column resume.
- table-heavy DOCX.
- LaTeX Jake-style resume.
- modern colored resume.
- plain ATS resume.
- resume with custom sections.
- resume with links/icons.
- resume with no bullets.
- resume with long bullets.
- resume with non-US date formats.

Scores:

- semantic coverage: did we recover the right sections/items/bullets?
- style coverage: did we extract reusable visual language?
- layout resilience: does stress data reflow safely?
- reference resemblance: does the render belong to the same visual family?

Reference resemblance is a diagnostic score, not the main pass/fail gate.

Fixture coverage rules:

- A fixture class is the unit of coverage. A specific resume file is only one
  example within a class.
- User-provided resumes may be used to reproduce bugs, but fixes must graduate
  into anonymized or generated fixtures that capture the source pattern:
  table-heavy DOCX, dense PDF, macro-heavy LaTeX, no-bullet resume, and so on.
- A fixture is not allowed to pass only because its source content matches the
  stress resume. Stress renders must replace names, employers, schools,
  projects, bullets, and dates with unrelated data.
- The harness must report both per-fixture results and missing fixture classes.
  A green per-fixture run is not sufficient if the matrix is missing required
  classes.
- Importer code must not branch on fixture filename, person name, school,
  employer, project name, or resume-specific wording.

Reusable-template gates:

- `semanticCoverage`: expected sections, item headers, dates, metadata, and
  bullets were recovered with evidence refs.
- `styleCoverage`: page geometry, body type, section-heading type, accent/rule
  color, spacing rhythm, and bullet treatment were inferred or explicitly
  marked unavailable.
- `layoutResilience`: source-content render and stress render avoid severe
  overflow, duplicate content, clipped text, and fixed source-only boxes.
- `sourceCoverage`: normalized source lines are either represented in semantic
  data, marked decorative/non-template, or reported as unresolved evidence.
- `reviewability`: every failed or weak gate produces a visible review action in
  both the standalone lab and app mismatch report.

Diagnostic-only gates:

- `visualFamilyResemblance`: screenshot/image comparison should flag when the
  render no longer belongs to the source's visual family. It should not force
  absolute-position replication into V4 reusable templates.
- `pixelDiff`: exact pixel difference is useful for debugging extraction and
  regression drift, but it must not be used as the saved-template success
  definition.

## Phased Implementation Plan

### Phase 1: Analysis Boundary

- Add a universal import analysis report around the existing `SourceDocumentIR`.
- Compute source signals, section signals, style signals, repeatable section
  signals, and readiness scores.
- Add the report to dogfood/lab artifacts.
- Keep existing V3 rendering unchanged except for bug fixes.

### Phase 2: Semantic IR

- Introduce `ResumeSemanticIR` with confidence and evidence refs.
- Replace direct `SourceDocumentIR -> TailoredResume` heuristics with
  `SourceDocumentIR -> ResumeSemanticIR -> TailoredResume`.
- Add split/merge-safe grouping for entries, project blocks, and bullets.

### Phase 3: Style Token IR

- Extract named style tokens from source evidence.
- Add PDF font-family/weight and color support where feasible.
- Add rule/shape extraction for section dividers.
- Surface style token confidence in the lab.

### Phase 4: Component Template Renderer

- Introduce reusable component IR.
- Render semantic data through components and style tokens.
- Keep V3 visual/table renderer as source-evidence/debug mode until replaced.

### Phase 5: Lab And Review UI

- Upgrade standalone lab to show reference, reusable render, semantic tree,
  style tokens, stress render, and mismatch report.
- Bring the same review model back into the app import flow.
- Persist reusable semantic artifacts on migration drafts so the app and lab
  inspect the same payload.
- Let the import review switch between visual evidence render and reusable
  semantic render.
- Treat the source render as debugger evidence, not the template that will be
  saved.

### Phase 6: Legacy Cleanup

- Remove or hide legacy generic template paths that conflict with semantic
  templates.
- Ensure the template dropdown only surfaces built-in templates and saved
  `schemaVersion: 4` reusable custom templates.
- Apply the same V4-first listing rule to every normal template-selection
  surface, including Studio and opportunity generation actions.
- Keep legacy `schemaVersion: 3` visual templates out of normal selection
  lists by default.
- Allow explicit legacy listing only for management/debug views that need to
  delete, rename, or inspect existing V3 templates.
- Keep migration compatibility for existing saved templates.
- Keep direct render/export compatibility for already-selected V3 template ids
  so old documents do not break.
- Commit `schemaVersion: 4` reusable templates as the preferred saved template
  type once the review UI can edit sections and style tokens.

### Phase 7: Broad Verification Harness

- Build a fixture manifest with source files, expected semantic sections, and
  expected style traits.
- Track required fixture classes separately from individual examples so the
  suite can report which universal resume categories are covered or missing.
- Render each fixture in three modes: reference/source preview, reusable render,
  and stress render.
- Capture screenshots and JSON summaries for every fixture.
- Produce scorecards for semantic coverage, style token coverage, layout
  resilience, and visual-family resemblance.
- Run the same harness on user-provided examples without special-case code.
- Keep fixture-class coverage as a separate gate from per-fixture pass/fail:
  current examples may pass while the matrix still shows missing categories
  such as academic CVs or resumes with no bullets.

### Phase 8: Import Quality Hardening

- Promote every dogfood failure into one of five buckets:
  extraction, semantic inference, style token inference, reusable rendering, or
  app wiring.
- For extraction failures, add evidence IR assertions before touching renderer
  code.
- For semantic failures, add expected-section/item/bullet assertions using
  anonymized fixture data.
- For style failures, add token candidate assertions with evidence refs.
- For renderer failures, add source-content and stress-content screenshots plus
  overflow/duplication metrics.
- For app-wiring failures, add review UI tests that prove the mismatch report
  exposes the same issue seen in the lab.
- Keep a short "known broad failure modes" list in this spec so work does not
  drift into hand-tuned fixes for the latest uploaded resume.

### Phase 9: User-Facing Template Editing

- Replace the confusing review-template workflow with a clearer import
  workbench:
  source evidence, inferred template, stress preview, corrections, and save
  readiness.
- Add direct controls for the reusable template concepts users actually edit:
  header layout, section ordering, divider style, type scale, spacing, bullet
  treatment, entry metadata placement, and section inclusion.
- Keep low-level source/block controls available behind an evidence/debug pane.
- Show "saved template output" separately from "source/debug render" so users do
  not confuse pixel evidence with the reusable template.
- Persist all corrections as semantic/style/token operations, not as ad hoc DOM
  edits.

### Phase 10: Legacy Removal And Guardrails

- Delete or quarantine legacy pathways once V4 import, review, render, export,
  and template selection are covered by tests.
- Keep read-only compatibility for existing V3 ids until a migration path has
  been verified.
- Add regression tests that fail if a normal route prefers a legacy V3 visual
  template over a saved V4 reusable template.
- Add data migration notes before removing any database columns or old draft
  fields.

## App Contract

`TemplateMigrationDraft` is the handoff between import, review, and commit.
New drafts should include both legacy visual artifacts and reusable semantic
artifacts:

```ts
interface TemplateMigrationDraft {
  source: SourceDocumentIR;
  resume: TailoredResume;
  templateV3: DocumentTemplateV3; // visual evidence/debug path
  universalAnalysis: UniversalTemplateImportAnalysis;
  semanticResume: ResumeSemanticIR;
  styleTokens: ImportedTemplateStyleTokens;
  reusableTemplate: ReusableResumeTemplateIR;
  reusableHtml: string;
}
```

Rules:

- `source`, `universalAnalysis`, `semanticResume`, `styleTokens`, and
  `reusableTemplate` must remain source-independent and evidence-backed.
- App review must not infer reusable behavior from `templateV3` absolute source
  boxes.
- Slot corrections or source edits must regenerate semantic/style/reusable
  artifacts.
- Old drafts may omit reusable fields; loaders should derive them from
  `source` as a compatibility fallback.

## Commit Contract

Until the review UI can edit semantic components, commits may continue saving
V3 visual templates for compatibility. The final commit path should save
`ReusableResumeTemplateIR` as the primary template model and keep V3 only as
debug evidence.

Save readiness should require:

- semantic coverage above the configured threshold.
- at least one reusable repeatable section when source contains repeatable
  content.
- style token confidence for page, body text, and section headings.
- a stress render without duplicate content or severe overflow.
- visible warnings for low-confidence section, item, or style mappings.

The commit API must enforce the reusable-template readiness gate, not only the
review UI. A V4 save must fail when semantic sections, style tokens, reusable
components, reusable HTML, or core analysis scores are missing or below the
configured thresholds.

## Phase 1 Deliverables

- `analyzeUniversalTemplateImport(source)` API.
- Spec-backed tests for source-independent analysis.
- Dogfood artifact containing the analysis report.
- Lab panel or JSON section exposing the report.

## Phase 2 Deliverables

- `inferResumeSemanticIR(source)` as the only supported semantic handoff from
  evidence to reusable template rendering.
- Confidence and evidence refs on every contact field, section, item, and
  bullet grouping where the source can support it.
- Section alias registry that is data-driven and extensible, not hardcoded to a
  specific resume/persona.
- Grouping tests for:
  - repeated experience/project entries.
  - continuation lines under the prior entry.
  - bulletless paragraph resumes.
  - custom sections and unknown section titles.
  - international date formats.
- Review mutation APIs for section type/title corrections that regenerate
  reusable artifacts from the same semantic IR.

Exit gate:

- Stress renders can replace all source content with unrelated candidate data
  without leaking source-only bullets, names, companies, dates, or projects.

## Phase 3 Deliverables

- `inferImportedTemplateStyleTokens(source)` populated from evidence clusters,
  not from fixture names or user identity.
- Token confidence for page geometry, margins, typography roles, colors, rules,
  list treatment, and date alignment.
- Token candidate lists when multiple plausible source styles exist.
- Review mutation APIs for overriding:
  - accent/body/rule/link/bullet colors.
  - body/name/section/metadata font size and weight.
  - margins, section gaps, item gaps, bullet gaps, and line height.
  - section divider and header divider presence.
- Lab token panel that shows token value, confidence, evidence refs, and any
  competing candidates.

Exit gate:

- A template imported from one resume can be restyled through token edits and
  re-rendered without touching semantic content or legacy V3 boxes.

## Phase 4 Deliverables

- `ReusableResumeTemplateIR` schemaVersion 4 is the primary app template model.
- Renderer consumes semantic data through reusable components and tokenized
  styles.
- Component IR supports at minimum:
  - header name/contact blocks.
  - section headings and optional rules.
  - repeatable entry headers.
  - optional secondary/meta/date fields.
  - bullet lists and paragraph-style achievement lines.
  - skills, education rows, and custom sections.
- Empty sections hide cleanly.
- Added items reuse the same component pattern as imported items.
- Removed items do not preserve fixed whitespace from the source.

Exit gate:

- The normal builder, preview, and export routes render V4 templates before
  considering legacy V3 or built-in templates.

## Phase 5 Deliverables

- Standalone template lab shows the same persisted draft artifacts as the app:
  reference/source render, reusable render, stress render, semantic tree, style
  tokens, mismatch report, and diagnostics.
- App review UI exposes the same conceptual panes, even if compressed into a
  smaller workflow.
- Semantic review controls:
  - assign and rename section type.
  - reorder sections.
  - split/merge semantic items.
  - move bullets between items.
  - mark a source block decorative/non-template.
- Style review controls:
  - edit supported token values.
  - choose among token candidates when available.
  - reset an override back to inferred value.
- The review UI labels source render as evidence/debug output and reusable
  render as the saved template output.

Exit gate:

- A user can correct a bad import through controls, save, reopen the template,
  add new resume content, and see the corrected reusable structure preserved.

## Phase 6 Deliverables

- Default template pickers list only built-in templates and saved V4 reusable
  templates.
- Legacy V3 visual templates are hidden from normal creation, tailoring,
  Studio, and opportunity generation flows unless explicitly requested.
- Legacy management/debug surfaces can still list V3 templates for inspection,
  rename, or deletion.
- Existing documents with already-selected V3 template ids continue to render
  and export.
- Migration drafts may retain `templateV3` only as evidence/debug data.
- Commit path saves V4 when reusable artifacts are ready and rejects incomplete
  V4 saves with actionable issues.

Exit gate:

- There is one normal user-facing template system: built-ins plus V4 reusable
  templates. V3 is compatibility/debug only.

## Phase 7 Deliverables

- Fixture manifest contains required class coverage independent of exact
  examples.
- Fixtures include PDF, DOCX, and LaTeX sources.
- Each fixture declares expected semantic sections and expected style traits.
- Dogfood suite renders:
  - source/reference preview.
  - reusable render with source content.
  - reusable stress render with unrelated candidate content.
- Scorecards report:
  - semantic coverage.
  - style token coverage.
  - layout resilience.
  - reference visual-family resemblance.
  - fixture-class coverage.
- Reference resemblance stays diagnostic unless it reveals structural failure.
- User-provided resumes may be added as private dogfood cases, but pass/fail
  must never depend on a specific person's content.

Exit gate:

- Strict suite passes with every required fixture class covered, and failures
  identify whether the break is extraction, semantic inference, token inference,
  component rendering, or review/save wiring.

## Universal Testing Contract

The verification suite must test behavior, not a single user's resume:

- Use anonymized or generated persona fixtures for normal CI-style checks.
- Keep user resumes as dogfood inputs only when the user explicitly provides
  them for debugging.
- For every new bug found from a user resume, add a generalized fixture class or
  generated reproduction that captures the pattern without depending on that
  user's name, jobs, schools, or wording.
- Every renderer test should replace source content with unrelated candidate
  content to catch leaked fixed boxes and duplicated source text.
- Every importer test should include evidence refs so failures can be traced
  back to the source block, row, line, or token cluster.
- Visual comparison is used to verify visual family and diagnose extraction
  regressions. It is not the product goal and should not force pixel-perfect
  source layout into the saved template.

## Debug Lab Contract

The standalone lab is the place to dogfood import behavior before app UX work:

- It must open from static artifacts without a running app session.
- It must show all panes needed to explain a failure:
  - reference/source preview.
  - reusable render.
  - stress render.
  - source evidence tree.
  - semantic tree.
  - style token table.
  - mismatch report.
  - raw JSON artifacts.
- It must link each issue to the likely pipeline stage:
  extraction, semantic grouping, style token inference, component rendering, or
  app wiring.
- It must make fixture coverage visible so a green run cannot hide that the
  suite only tested one resume family.

## Current Implementation Status

As of the latest implementation slice, the system has:

- V4 reusable template artifacts persisted on migration drafts.
- V4 reusable template save/list/get/delete/update database support.
- V4-first render/export/template-list behavior for normal flows.
- Legacy V3 hidden from normal pickers by default and retained for
  compatibility/debug management.
- A strict visual dogfood suite with all required fixture classes covered.
- Dogfood scorecards now gate source coverage, stress page overflow, reusable
  component completeness, expected section coverage, and expected
  visual-family trait coverage, with failures bucketed by pipeline stage. The
  strict fixture suite currently passes with scorecards enforced.
- A reusable renderer that consumes section order and entry component settings
  for header fields and bullet-vs-paragraph achievement rendering. During
  migration, V4 reusable artifacts now infer bullet-vs-paragraph achievement
  rendering from source visual evidence instead of defaulting every section to
  list styling, preserve source-backed list marker style where available, and
  render reusable contact links with inferred link color.
- Semantic contact inference uses hyperlink targets as source evidence, so
  generic visible labels like "GitHub" or "LinkedIn" still populate reusable
  contact fields from their hrefs.
- Basic semantic review controls for section type/title correction and moving
  bullets between adjacent, dragged, or explicitly selected items.
- Semantic sections can be reordered from review with buttons or drag/drop and
  regenerate reusable artifacts from the updated semantic order.
- Basic split/merge controls for semantic items, including explicit merge target
  selection, item-level split point selection, and drag/drop merge targets,
  preserving merged item headers as achievement text so user content is not
  silently dropped.
- Source evidence blocks, inline runs, individual table cells, and nested table
  cell inline runs can be marked non-template/decorative from review; reusable
  semantic artifacts regenerate from the remaining evidence.
- DOCX vertical-merge continuation cells are ignored during semantic grouping so
  repeated layout labels do not become resume content.
- Semantic item primary, secondary, date, location, URL, and metadata fields can
  be corrected directly from review after import or split.
- Style token overrides can be reset back to inferred values from current source
  evidence.
- Style token candidate lists are inferred for colors, typography roles, section
  spacing, and divider widths; name, body, section-heading, entry-title, and
  metadata typography candidates can be selected from review where present.
- Layout tokens for header mode, date placement, section-title placement, and
  column count can be reviewed, overridden, and rendered by reusable V4
  templates.

Known remaining gaps:

- Split controls support item-level split point selection; merge controls
  support explicit item targets and item drag/drop merge targets within the
  section.
- Move-bullet controls support adjacent buttons, arbitrary item target
  selection, and bullet drag/drop within the section.
- Decorative source marking supports whole blocks, inline runs, table cells, and
  nested table-cell inline runs.
- Style token candidate selection currently covers colors, name typography, body
  typography, section-heading typography, entry-title typography, metadata
  typography, section spacing, divider widths, and layout controls.
- DOCX table-heavy imports still need extraction and layout resilience work; the
  dogfood suite keeps this visible as a broad fixture class rather than a
  person-specific case. Vertical-merge semantic duplication has a regression
  guard, but broader source-text coverage and overflow resilience remain open.
- Current table-heavy DOCX smoke runs pass the universal scorecard after
  reusable table-row matching was made token-aware, body typography inference
  stopped reusing name-sized text, and sub-pixel page-height rounding stopped
  counting as page overflow.
- Current manifest scorecards pass under `--strict-scorecards`; visual
  no-bullet traits are checked against source evidence rather than semantic
  achievement modeling.
- V4 reusable templates preserve paragraph-forward achievement rendering when
  the imported source has achievement text without visual list markers.
- V4 reusable templates preserve detected list marker treatment, including
  numbered DOCX list evidence, in generated reusable renders.
- V4 reusable templates render contact email/GitHub/LinkedIn fields as semantic
  links and infer link color from source hyperlink evidence.
- Semantic contact extraction preserves linked contact targets even when the
  visible source text is only a generic link label.
- App review mismatch reports now expose the same gate model as the lab:
  extraction, semantic, style, render, and app wiring statuses with review
  actions.
- Studio has an app-level regression covering the save/reopen/add-new-content
  exit gate: a reloaded saved V4 template resolves into the editable preview,
  and newly added bank content is generated through the same saved template id.
- Reopened Studio previews now pass the resolved saved custom template into the
  editable resume preview, so the editor does not fall back to built-in styling
  when a saved V4 template id is selected.
- The custom-template manager now has a direct saved-template "Use" action that
  selects a reusable template without importing the source resume content.
- Tailor and opportunity generation routes now use the same V4-first render
  order as builder/export when rendering newly generated resume content with a
  saved reusable template.
- The static dogfood lab includes source evidence as a first-class pane, not
  only as a downloadable raw JSON artifact.
