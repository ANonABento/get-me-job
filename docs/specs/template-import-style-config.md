# Template Import Style Config Spec

## Summary

Let users import an existing resume or cover-letter document as a reusable
template style config. V1 extracts a normalized style system compatible with the
existing template renderer. It does not attempt pixel-perfect cloning.

Template import is a Studio/template-picker action, separate from normal
Components upload. The user intent is "use this document's look," not "extract
content from this document."

## Product Behavior

- Studio template picker includes an "Import template" action.
- Supported v1 sources: PDF, DOCX, and LaTeX `.tex`.
- Imported templates appear alongside built-in and existing custom templates.
- The import flow shows warnings when style values are inferred or defaulted.
- Users can save, rename, delete, and apply imported templates through existing
  custom-template management behavior.
- Existing normal upload flow remains content-focused and does not silently
  create templates.

## Implementation Changes

### Template source types

- Extend custom template `sourceType` from `pdf | docx` to
  `pdf | docx | tex`.
- Update the DB mapper, route validation, API response types, and template list
  response to accept `tex`.
- Preserve backward compatibility for existing `pdf` and `docx` template rows.

### Import pipeline

- Extend the existing template import route and extraction helper rather than
  creating a parallel backend.
- Detect source type from filename and MIME type:
  - `.pdf`
  - `.docx`
  - `.tex`
- For `.tex`, extract style signals from source commands where practical:
  - document class and page size.
  - margin/package settings.
  - font package or font commands.
  - section heading style macros.
  - list/bullet style.
  - accent color definitions.
- For PDF/DOCX, keep existing text/style signal extraction and improve only
  where needed for the normalized output.

### Normalized style output

The imported template must resolve to existing template-renderer-compatible
styles:

- font family.
- body font size.
- header/name size.
- section header size.
- line height.
- accent color.
- layout: single-column or two-column.
- header style: centered, left, or minimal.
- bullet style: disc, dash, arrow, or none.
- section divider: line, space, or none.
- margins.
- section gap.
- page size when detectable.

If a value cannot be detected, apply the existing default and include a warning.

### Studio UI

- Add the import action where templates are selected or managed in Studio.
- On successful import, add the saved custom template to the template list and
  select or offer to apply it.
- Display source filename, source type, warnings, and a concise confidence state
  in the import result.
- Do not add a visual template editor in v1.

## Edge Cases

- Unsupported file type returns a validation error before AI/template analysis.
- Weak extraction returns a usable default template with warnings, not a crash.
- Malformed `.tex` should still attempt heuristic extraction from raw text.
- Imported templates linked to source documents must only be visible to the
  owning user.
- Deleting an imported template must preserve existing fallback behavior for
  documents that referenced it.

## Test Plan

- Template source detection tests for PDF, DOCX, `.tex`, and unsupported files.
- Template analyzer tests:
  - LaTeX margins/font/color/section signals.
  - DOCX source still reads existing signals.
  - PDF source falls back safely when text extraction is weak.
- API tests for `/api/templates/import`:
  - Saves PDF, DOCX, and TEX custom templates.
  - Returns warnings and sections found.
  - Rejects unsupported files and oversized files.
- UI tests:
  - Studio template import action opens.
  - Successful import appears in template picker.
  - Warnings are visible in the import result.
- Run typecheck and targeted lint for touched files.

## Acceptance Criteria

- A `.tex` resume template can be imported and saved as a custom template.
- A PDF or DOCX template still imports through the existing route.
- Imported templates are selectable in Studio and usable for resume rendering.
- No v1 implementation promises pixel-perfect reproduction.

## Agent Handoff Prompt

```text
/goal Implement Studio template import for PDF, DOCX, and LaTeX style-config extraction.

Use docs/specs/template-import-style-config.md as the source of truth.

Requirements:
- Template import lives in Studio/template picker, not the Components upload flow.
- Extend custom template sourceType to pdf | docx | tex.
- Import templates as TemplateStyles/AnalyzedTemplate-compatible style configs.
- Extract page size, margins, fonts, sizes, colors, section style, bullet style, layout, and header alignment.
- Save imported templates into custom_templates.
- Return clear warnings/confidence when defaults are used.
- Do not implement pixel-perfect cloning in v1.

Verify with template import API tests, analyzer tests, UI flow tests, lint, and typecheck.
```
