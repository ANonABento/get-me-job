# Import, Parsing, and Template Expansion Notes

## Current quick issues

- Review list ordering should follow document order. For PDFs, prefer `sourceBbox` page/y/x order; fall back to parsed source order when no bbox exists.
- PDF bbox preview should not make the whole page feel selected. Keep all highlights clickable, but render non-selected boxes quietly and selected boxes strongly.
- Root component bboxes should ideally highlight the entry header, while bullet rows highlight individual bullets. The current fuzzy matcher can still feel noisy because parent and child highlights are all visible at once.

## Bbox improvements to consider

- Store a separate `sourceOrder` and `sourceHeaderBbox` for root entries.
- Keep `sourceBbox` for the full matched text if useful, but use `sourceHeaderBbox` in the left-list jump/highlight state.
- Add a debug view that shows match method, winning needle, and matched bbox count per component.
- For linked PDF text, preserve link annotations as metadata instead of only appending URLs into reconstructed text.
- Consider a higher-confidence matching tier later: embeddings, LLM citations, or document-layout extraction for PDFs that fuzzy text matching cannot resolve.

## Document types

- Resume: current primary flow.
- Cover letter: parse recipient/company/role, claims, evidence, tone, and reusable paragraphs.
- Portfolio: parse projects, links, media descriptions, case-study structure, and proof points.
- Template document: import a resume/cover letter as a style/layout template rather than content.
- General career notes: parse loose bullets into components with lower confidence.

## File formats

- PDF: text extraction plus positional bboxes; hardest for layout recovery.
- DOCX/Word: content structure and styles are more accessible; good candidate for template import.
- LaTeX: support both source `.tex` and generated PDF. Source import can preserve commands, spacing, section macros, and style intent better than PDF-only extraction.
- Plain text/Markdown: content-only import with no layout template.

## Resume Template Import

Goal: let a user upload an existing resume and reuse its visual system as a template.

Extract:
- Page size, margins, columns, section spacing.
- Font families, sizes, weights, colors.
- Header layout and contact formatting.
- Section heading treatment: caps, rules, colors, spacing.
- Entry layout: title/company/date alignment, bullets, indentation.
- Tables or grid-like structures.

Output:
- A normalized template record in `custom_templates`.
- A previewable style config compatible with the resume generator.
- A confidence report listing what was inferred vs approximated.

Open questions:
- Should template import be a separate document type or an option during resume upload?
- Should content extraction and template extraction happen together or as two explicit actions?
- Should imported templates be editable in a visual template editor before use?
