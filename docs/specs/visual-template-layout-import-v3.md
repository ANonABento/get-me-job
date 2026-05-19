# Visual Template Layout Import V3 Spec

## Summary

Custom template import is a visual-layout migration feature. It lets a user
upload an existing resume as a layout reference and save a reusable Studio
template that preserves where content belongs: tables, cells, borders, spacing,
alignment, colors, typography, repeated row groups, and reusable slot positions.

This feature is not the primary resume parser. Resume/content parsing into the
knowledge bank or document components remains owned by the existing document
upload/parser flows. Template import may inspect source text only to identify
semantic placeholders such as name, contact, title, date, bullet, and section
labels.

This spec supersedes the broad interpretation in
`docs/specs/document-template-migration-v2.md` where "migration" implied
importing both content and visual layout. V3 is narrower and more precise:

```text
Upload visual source -> extract layout structure -> map reusable slots ->
preview reconstruction -> save visual template.
```

## User Problem

Users often already have a resume layout they like in Google Docs, Word,
Overleaf, or PDF. They want Slothing to reproduce that layout so future resumes
can be assembled from Studio data while keeping the same visual system.

Example: a Google Docs resume built almost entirely from tables:

- outer page frame.
- header row with name cell and contact cell.
- section header rows with colored label styling.
- repeated experience/project row groups.
- right-aligned date cells.
- bullet lists inside cells with tight spacing.
- compact education row.

For this user, a "template" is not just `fontFamily`, `accentColor`, and
`sectionDivider`. The table/grid is the template.

## Product Boundaries

### In Scope

- Import visual templates from `DOCX`, `LaTeX`, and selectable `PDF`.
- Preserve table/grid layout as first-class data.
- Preserve page setup, margins, fonts, colors, line heights, borders, padding,
  alignment, section headers, bullet styling, and repeated row patterns.
- Infer semantic slots from visible source text and cell roles.
- Let users correct slot mappings before saving.
- Save reusable templates that render future Studio resume data into the same
  layout.
- Show visual fidelity/confidence and block saving when extraction is too weak.

### Out Of Scope

- Importing the uploaded resume as canonical bank/document content.
- OCR-first support for scanned PDFs in the initial V3 pass.
- Pixel-perfect support for arbitrary drawings, floating shapes, images,
  comments, tracked changes, or every LaTeX package.
- Public template marketplace.

## Source Research Notes

- DOCX is the highest-priority source for table-based resumes. WordprocessingML
  represents tables with real `tbl`, `tr`, and `tc` elements, plus table-wide
  properties, table grids, row properties, and cell properties. Microsoft
  documents `tblPr`, `tblGrid`, `trPr`, and `tcPr` as the structural places to
  read table-wide, column, row, and cell formatting.
  Source: https://learn.microsoft.com/en-us/office/open-xml/word/working-with-wordprocessingml-tables

- DOCX table width, borders, and grid columns are explicitly represented. The
  Open XML table docs describe `tblW`, `tblBorders`, `tblGrid`, `tr`, and
  related child elements as the model for table dimensions and borders.
  Source: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.table

- LaTeX tables expose useful layout intent through `tabular` column specs,
  alignment (`l`, `c`, `r`), paragraph-width columns (`p{...}`, `m{...}`,
  `b{...}`), vertical rules (`|`), horizontal rules (`\hline`), padding
  (`\tabcolsep`), row stretch (`\arraystretch`), rule width
  (`\arrayrulewidth`), row/cell colors, and custom column types.
  Source: https://www.overleaf.com/learn/latex/Tables

- PDF is geometry-first. Structured extraction APIs report bounds in PDF user
  space units, usually 72 units per inch, with rectangle coordinates in PDF page
  coordinate space. This is useful for inferring columns, tables, and text
  positions, but weaker than DOCX/LaTeX because semantic tables may already be
  flattened.
  Source: https://developer.adobe.com/document-services/docs/overview/pdf-extract-api/howtos/extract-api/

- PDF viewer coordinates and PDF page coordinates differ. PDF page coordinates
  use a bottom-left origin, while viewer coordinates are commonly top-left.
  Any source overlay/reconstruction UI must normalize coordinate systems before
  comparing original and rendered output.
  Source: https://pdfjs.express/documentation/viewer/coordinates.8

## UX Model

### Entry Point

Rename the current action from content-sounding language to layout-sounding
language:

- Primary action: `Import visual template`.
- File prompt: `Upload layout reference`.
- Review step: `Review structure`.
- Save action: `Save visual template`.

Avoid `Create from resume` and `Import existing resume`; those imply content
import.

### Upload Help Text

```text
Use an existing resume as a layout reference. Slothing reads visual structure
such as tables, cells, borders, spacing, colors, and reusable fields. Resume
content import is handled separately by document upload.
```

Source guidance:

- `DOCX`: best for Google Docs/Word layouts, especially tables.
- `LaTeX`: best for Overleaf layouts with explicit commands/macros.
- `PDF`: fallback for selectable text and strong geometry; scanned PDFs need
  OCR before this flow.

### Review Screen

The review state should have three panes:

- `Original`: source preview or reconstructed source overlay.
- `Structure`: detected table/grid tree and slot mappings.
- `Template Preview`: rendered reusable template with sample Studio data.

Primary metrics:

- `Tables detected`.
- `Cells preserved`.
- `Repeat groups`.
- `Slots mapped`.
- `Visual fidelity`.

Do not lead with "text blocks". Text blocks are diagnostics, not the product.

### Save Rules

The template should only be saveable when minimum visual fidelity is met.

Recommended initial thresholds:

- At least one page.
- At least one named region or table/grid region.
- At least `name` plus one contact slot mapped, or explicit user override.
- For table-based sources, at least one table with cells/rows preserved.
- Overall fidelity status must be `ready` or `review`, not `low`.

If extraction is weak, show:

```text
Could not read enough layout structure from this file. Try DOCX/LaTeX, or use a
selectable PDF with visible text.
```

## Data Model

V3 can either extend `DocumentTemplateV2` carefully or introduce
`DocumentTemplateV3`. Recommendation: create `DocumentTemplateV3` because table
geometry, repeat groups, and style cascade need to be first-class, and bolting
them onto V2 will keep producing generic templates.

### DocumentTemplateV3

```ts
interface DocumentTemplateV3 {
  schemaVersion: 3;
  id: string;
  name: string;
  description?: string;
  source?: TemplateSourceRef;
  page: TemplatePage;
  tokens: Record<string, TypographyToken>;
  regions: TemplateRegionV3[];
  slots: TemplateSlotV3[];
  repeatGroups: TemplateRepeatGroup[];
  diagnostics: TemplateDiagnostic[];
}
```

### Page

```ts
interface TemplatePage {
  size: "letter" | "a4" | string;
  widthPt: number;
  heightPt: number;
  margins: BoxEdges;
  background?: FillStyle;
}
```

### Region

```ts
interface TemplateRegionV3 {
  id: string;
  role: "page-frame" | "header" | "main" | "sidebar" | "footer" | "section";
  flow: "block" | "grid" | "table" | "absolute";
  box?: TemplateBox;
  style?: RegionStyle;
  nodes: TemplateNodeV3[];
}
```

### Nodes

```ts
type TemplateNodeV3 =
  | TemplateTable
  | TemplateRow
  | TemplateCell
  | TemplateTextBlock
  | TemplateSlotBlock
  | TemplateListBlock
  | TemplateSectionBlock;
```

### Table

```ts
interface TemplateTable {
  kind: "table";
  id: string;
  role?: "outer-frame" | "header" | "section" | "repeat-item" | "metadata";
  box?: TemplateBox;
  columns: TemplateTableColumn[];
  rows: TemplateTableRow[];
  borders?: BorderSet;
  cellDefaults?: CellStyle;
  sourceRef?: SourceRef;
}

interface TemplateTableColumn {
  widthPt?: number;
  widthPct?: number;
  minWidthPt?: number;
  alignment?: TextAlignment;
}

interface TemplateTableRow {
  id: string;
  role?: "section-header" | "item-header" | "item-body" | "compact-row";
  heightPt?: number;
  repeatGroupId?: string;
  cells: TemplateTableCell[];
  borders?: BorderSet;
  fill?: FillStyle;
  sourceRef?: SourceRef;
}

interface TemplateTableCell {
  id: string;
  colSpan?: number;
  rowSpan?: number;
  widthPt?: number;
  padding?: BoxEdges;
  borders?: BorderSet;
  fill?: FillStyle;
  verticalAlign?: "top" | "middle" | "bottom";
  textAlign?: TextAlignment;
  nodes: TemplateNodeV3[];
  sourceRef?: SourceRef;
}
```

### Slots

Slots bind future Studio data into the visual structure.

```ts
interface TemplateSlotV3 {
  id: string;
  path:
    | "contact.name"
    | "contact.email"
    | "contact.phone"
    | "contact.location"
    | "contact.linkedin"
    | "contact.github"
    | "summary"
    | "experiences[].title"
    | "experiences[].company"
    | "experiences[].location"
    | "experiences[].dates"
    | "experiences[].highlights[]"
    | "projects[].name"
    | "projects[].metadata"
    | "projects[].description"
    | "projects[].highlights[]"
    | "education[].institution"
    | "education[].degree"
    | "education[].field"
    | "education[].date"
    | "skills[]"
    | "certifications[]"
    | "awards[]";
  role: "text" | "richText" | "link" | "list" | "inlineList" | "metadata";
  token?: string;
  sourceRefs: SourceRef[];
  fallback?: string;
}
```

### Repeat Groups

```ts
interface TemplateRepeatGroup {
  id: string;
  collection:
    | "experiences"
    | "projects"
    | "education"
    | "skills"
    | "certifications"
    | "awards";
  nodeIds: string[];
  emptyBehavior: "hide" | "show-placeholder" | "reserve-space";
  sourceRefs: SourceRef[];
}
```

### Style Primitives

```ts
interface TemplateBox {
  xPt?: number;
  yPt?: number;
  widthPt?: number;
  heightPt?: number;
}

interface BoxEdges {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface BorderStyle {
  widthPt: number;
  color: string;
  style: "solid" | "dashed" | "dotted" | "double" | "none";
}

interface BorderSet {
  top?: BorderStyle;
  right?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  insideH?: BorderStyle;
  insideV?: BorderStyle;
}

interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: "normal" | "italic";
  textTransform?: "none" | "uppercase";
  letterSpacing?: string;
}
```

## Source IR

V3 should preserve source structure before converting to a reusable template.

```ts
interface SourceDocumentIRV3 {
  sourceType: "docx" | "tex" | "pdf";
  filename: string;
  pages: SourcePage[];
  nodes: SourceNode[];
  rawText: string;
  diagnostics: TemplateDiagnostic[];
}

type SourceNode =
  | SourceParagraph
  | SourceTable
  | SourceTableRow
  | SourceTableCell
  | SourceListItem
  | SourceInlineRun;
```

Every source node should carry:

- stable id.
- source path when available, such as `word/document.xml/tbl[1]/tr[2]/tc[1]`.
- page id and bbox when available.
- text.
- style hints.
- child nodes.

## Import Strategy

### DOCX

DOCX is the first implementation target.

Extractor requirements:

- Read `word/document.xml`.
- Read styles from `word/styles.xml`.
- Read numbering from `word/numbering.xml`.
- Read document defaults, theme fonts, and section page setup where practical.
- Preserve `w:tbl` as `SourceTable`.
- Preserve `w:tblPr`:
  - table width.
  - alignment.
  - borders.
  - cell margins/default padding.
  - shading/fill.
- Preserve `w:tblGrid/w:gridCol` as column widths.
- Preserve `w:tr/w:trPr`:
  - row height.
  - row-level formatting.
- Preserve `w:tc/w:tcPr`:
  - cell width.
  - grid span.
  - vertical merge.
  - borders.
  - shading.
  - margins.
  - vertical alignment.
- Preserve paragraph/run styles inside each cell:
  - font family.
  - font size.
  - bold/italic.
  - color.
  - alignment.
  - line spacing.
- Preserve hyperlinks when available.

DOCX table groups:

- Consecutive tables with same style and no intervening paragraph should be
  treated as a single logical table candidate.
- Repeated rows with similar cell count/style should be candidates for repeat
  groups.
- One-cell bordered tables are still meaningful; they may represent section
  frames or full-width rows.

### LaTeX

LaTeX should use a pragmatic parser, not full TeX execution.

Extractor requirements:

- Parse document class page size hints.
- Parse geometry package margins.
- Parse `tabular`, `tabularx`, `longtable`, `array`, and common resume macros
  where practical.
- Parse column specs:
  - `l`, `c`, `r`.
  - `p{}`, `m{}`, `b{}` widths.
  - `|` vertical rules.
  - `@{}` inter-column spacing overrides.
  - `>{...}` and `<{...}` column decorators when recognizable.
- Parse rules:
  - `\hline`.
  - `\cline`.
  - `\toprule`, `\midrule`, `\bottomrule` as semantic horizontal rules.
- Parse styling:
  - `\arrayrulewidth`.
  - `\arrayrulecolor`.
  - `\tabcolsep`.
  - `\arraystretch`.
  - `\rowcolor`.
  - `\cellcolor`.
  - `\multicolumn`.
  - `\multirow` where feasible.
- Expand simple `\newcommand` macros with positional args.

LaTeX confidence is high when the source uses explicit tabular/geometry/macros
that the importer recognizes. Confidence drops when layout is generated by
arbitrary package code or complex custom commands.

### PDF

PDF is a fallback visual source.

Extractor requirements:

- Extract page dimensions.
- Extract text items with bounding boxes, font size, font family when possible,
  color when possible, and page coordinates.
- Normalize PDF bottom-left coordinates into the UI/render coordinate system.
- Group characters/items into words, lines, paragraphs, and regions.
- Infer tables from aligned x/y edges, repeated line starts, border strokes when
  available, and consistent row bands.
- Infer section headers from typography, horizontal rules, and spacing.
- Infer repeat groups from repeated y-patterns and text structure.

PDF cannot be expected to preserve tables as reliably as DOCX. The UI must say
that PDF reconstruction is inferred.

## Slot Mapping Strategy

Slot mapping should happen after layout extraction, not before.

Recommended stages:

1. Detect section header nodes.
2. Identify table/grid roles from structure:
   - header table.
   - section header row.
   - repeated item row group.
   - metadata row.
   - bullet cell.
3. Classify cells by visual position and text patterns:
   - largest text near top -> `contact.name`.
   - email/phone/url patterns -> contact slots.
   - right-aligned date-like text -> date slot.
   - bold leading phrase before separator -> title/name slot.
   - dense delimiter-separated text -> metadata or inline list.
   - bullet/list children -> highlights slot.
4. Bind source node ids to slots.
5. Build repeat groups from repeated table row/cell patterns.
6. Show low-confidence mappings for user correction.

## Renderer Requirements

The V3 renderer must render tables as tables/grid, not flattened block sections.

HTML preview/export:

- Use CSS table/grid where structure is tabular.
- Preserve explicit column widths.
- Preserve row/cell borders.
- Preserve cell padding.
- Preserve cell background fills.
- Preserve vertical/horizontal alignment.
- Preserve list marker color/style.
- Preserve section row styling.
- Hide repeat groups with no data unless `emptyBehavior` reserves space.

PDF export:

- Reuse the same HTML/CSS path where possible.
- Add visual regression tests against rendered page dimensions and table
  boundaries.

DOCX export:

- Longer-term: generate actual DOCX tables from V3 table primitives.
- Initial pass can keep PDF/HTML fidelity first.

LaTeX export:

- Longer-term: generate tabular/table constructs from V3 table primitives.
- Initial pass can use current export fallback with warnings.

## Review UI Requirements

### Original Pane

- DOCX: render a source preview if available, otherwise show a table/tree
  overlay derived from source IR.
- PDF: show page image or text-box overlay.
- LaTeX: show compiled preview if supported, otherwise source-derived layout
  preview.

### Structure Pane

Tree view:

```text
Page
  Outer table
    Header row
      Name cell -> contact.name
      Contact cell -> contact.email, contact.phone, links
    Experience section row
    Experience repeat group
      Title/date row -> title, company, dates
      Bullet cell -> highlights[]
```

User edits:

- Select node.
- Assign semantic slot.
- Mark row/cell group as repeat group.
- Set collection type: experience, project, education, skills.
- Toggle "hide when empty".
- Confirm or reject inferred table/cell roles.

### Template Preview Pane

- Render with synthetic Studio data, not necessarily the uploaded resume.
- Offer sample-data presets:
  - compact.
  - normal.
  - long.
- Highlight mismatches:
  - overflow.
  - missing slot.
  - unmapped source region.
  - collapsed table.

## API Surface

Recommended V3 endpoints:

- `POST /api/templates/layout-import`
  - Multipart upload.
  - Returns source IR summary, V3 template draft, fidelity report, and warnings.

- `GET /api/templates/layout-imports/:id`
  - Loads a draft.

- `PATCH /api/templates/layout-imports/:id`
  - Updates slot mappings, repeat groups, node roles, metadata, and template
    name.

- `POST /api/templates/layout-imports/:id/preview`
  - Renders current draft with sample Studio data.

- `POST /api/templates/layout-imports/:id/commit`
  - Saves `DocumentTemplateV3`.

- `GET /api/templates`
  - Includes V3 templates in the picker.

- `POST /api/templates/v3/preview`
  - Renders an arbitrary V3 template payload for tests/review.

## Fidelity Model

Use separate fidelity dimensions so users can understand what failed.

```ts
interface VisualTemplateFidelityReport {
  status: "ready" | "review" | "low";
  score: number;
  checks: FidelityCheck[];
  metrics: {
    pageSetup: number;
    tableStructure: number;
    cellGeometry: number;
    styleCoverage: number;
    slotCoverage: number;
    repeatGroupCoverage: number;
    renderCompleteness: number;
  };
}
```

Example checks:

- `page_setup_detected`.
- `tables_detected`.
- `table_grid_widths_detected`.
- `cell_borders_detected`.
- `cell_padding_detected`.
- `section_headers_detected`.
- `repeat_groups_detected`.
- `required_slots_mapped`.
- `preview_rendered_without_overflow`.

For the screenshot-like table resume, success means:

- outer table exists.
- header row has two cells.
- section header rows exist.
- experience/project repeat groups exist.
- right date cells are recognized.
- bullet cells are recognized.
- education compact row is recognized.

## Implementation Phases

### Phase 0: Product And Naming Cleanup

- Rename UI labels to visual template language.
- Remove "resume migration" wording from the visible template flow.
- Stop auto-loading parsed resume content into Studio from this flow.
- Keep uploaded source text as sample/slot evidence only.
- Update docs and tests to use visual-template terminology.

### Phase 1: V3 Schema And Renderer Skeleton

- Add `DocumentTemplateV3` schema.
- Add HTML renderer support for page, region, table, row, cell, slot, list, and
  repeat group primitives.
- Add sample data renderer for preview.
- Add picker mapping so V3 templates appear in Studio.

### Phase 2: DOCX Table Import

- Build DOCX Source IR V3 extractor.
- Preserve table/cell/row properties.
- Convert DOCX IR into V3 template draft.
- Add fixture for the user's table-based resume pattern.
- Add tests that assert rows, cells, widths, borders, fills, and slot refs are
  preserved.

### Phase 3: Review UI

- Replace the current generic review modal with Original / Structure / Template
  Preview panes.
- Add editable slot and repeat-group controls.
- Add clear fidelity blocking states.

### Phase 4: LaTeX Layout Import

- Add tabular/parser support.
- Preserve common table/rule/color/spacing commands.
- Support simple macro expansion.

### Phase 5: PDF Geometry Import

- Add robust bbox grouping.
- Add table inference from alignment and strokes.
- Lower confidence when table structure is inferred rather than explicit.

### Phase 6: Export Hardening

- Make PDF/HTML export use V3 renderer.
- Add visual regression snapshots for table layouts.
- Add DOCX/LaTeX export generation from V3 primitives as follow-up if needed.

## Acceptance Criteria

### Product

- User can upload a DOCX table-based resume and save a visual template without
  importing that resume as document content.
- The saved template appears in the Studio template picker.
- Applying the template to different resume data keeps the imported visual
  layout.
- The UI clearly says content parsing/import is separate.

### Technical

- DOCX table rows/cells are stored as first-class IR nodes.
- Table column widths, cell spans, borders, padding, fills, and alignment are
  represented in the V3 template.
- Repeat groups render variable-length experience/project/education data.
- Missing data can hide repeat groups without leaving broken borders.
- Fidelity report blocks save for low-structure imports.

### Fixture-Specific

For a table resume like the provided screenshot:

- Header renders as a two-cell row.
- Name cell preserves large purple typography.
- Contact cell is right-aligned.
- Experience, Projects, and Education headers preserve purple label styling.
- Experience entries preserve title/date row geometry.
- Project entries preserve dense inline metadata.
- Bullets preserve tight spacing and marker styling.
- Education preserves compact row layout.
- Outer frame/table borders are visible.

## Test Plan

- DOCX extractor unit tests:
  - `tbl`, `tr`, `tc`, `tblGrid`, `gridSpan`, borders, shading, padding.
  - paragraph/run styles inside cells.
  - hyperlinks and bullet lists inside table cells.

- V3 schema tests:
  - validate page, table, row, cell, slot, repeat group.
  - reject invalid slot paths or impossible table structures.

- V3 renderer tests:
  - table column widths.
  - row/cell borders.
  - repeat group rendering.
  - hide-empty behavior.
  - overflow warnings.

- Review UI tests:
  - upload shows Original / Structure / Template Preview.
  - low-fidelity import cannot save.
  - slot mapping updates preview.
  - committed V3 template appears in picker.

- Visual tests:
  - render table-based resume fixture at desktop and PDF export dimensions.
  - assert nonblank page, visible outer frame, header row, section rows, and
    repeated item groups.

## Current Implementation Gaps

The current implementation should be treated as a prototype only.

- It still derives a generic V2 section template instead of table-first layout.
- It leads with text block counts instead of table/cell fidelity.
- It does not preserve nested table geometry enough for Google Docs-style
  resumes.
- It has unclear product wording around resume import versus visual template
  import.
- It uses parsed source content as preview/sample data in ways that confuse the
  boundary with document parsing.

## Agent Handoff Prompt

```text
/goal Redesign custom template import into Visual Template Layout Import V3.

Use docs/specs/visual-template-layout-import-v3.md as the source of truth.

Key constraints:
- This is visual layout import, not resume content parsing.
- DOCX table geometry is the first-class target.
- Preserve tables, rows, cells, borders, padding, fills, alignment, typography,
  section headers, repeat groups, and semantic slots.
- Uploaded source text is only evidence for slot detection and sample preview.
- Existing document upload/parser owns content import.
- Save reusable templates that render future Studio resume data into the
  imported visual layout.

Start with Phase 0 and Phase 1, then implement DOCX table import before
expanding LaTeX/PDF.
```
