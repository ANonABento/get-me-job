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

## Phase 1 Deliverables

- `analyzeUniversalTemplateImport(source)` API.
- Spec-backed tests for source-independent analysis.
- Dogfood artifact containing the analysis report.
- Lab panel or JSON section exposing the report.
