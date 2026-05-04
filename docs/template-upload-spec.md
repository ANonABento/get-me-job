# Template Upload Spec (FUTURE - not implemented yet)

## Goal

Let users add custom document templates and choose them from the same Studio template picker used for system templates.

## Supported Uploads

- User uploads a custom template as HTML, Markdown, or DOCX.
- Uploaded templates are normalized into the internal render format.
- Invalid or unsafe markup is rejected before storage.

## Picker Integration

- Templates render in the picker grid alongside system templates.
- The search filter introduced in T4 discovers custom templates by name.
- System and custom templates share thumbnail, name, description, and Apply affordances.
- Custom templates can include optional tags for filtering.

## Management

- Users can rename, edit, and delete their own templates.
- System templates remain read-only.
- Deleting a template should not break existing documents; affected documents fall back to a safe system template.

## Organization

- Add a tag or category system for larger libraries.
- Suggested initial categories: Resume, Cover Letter, Minimal, Formal, Creative, Technical.

## Out Of Scope For V1

- Template sharing between users.
- Marketplace or public gallery workflows.
- Collaborative editing.
- Paid template licensing.
