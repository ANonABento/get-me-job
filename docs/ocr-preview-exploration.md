# OCR Preview Exploration

## Current Decision

Keep image-only PDF OCR deferred until there is a clear user need. The import
pipeline now handles extractable PDFs, DOCX, TXT, Markdown, HTML templates, and
stored text previews. OCR would add cost, latency, and operational complexity
without improving those stable paths.

## Recommended Path

- Detect image-only PDFs during parsing by checking for very low extracted text
  length and no source positions.
- Offer an explicit "Run OCR" action instead of doing OCR automatically.
- Prefer a managed document OCR provider for hosted deployments, with
  Tesseract.js or a local CLI as a self-hosted fallback.
- Store OCR text in the existing document `extracted_text` field so the text
  preview route can reuse the same durable preview path.

## Not In Scope Yet

- Automatic OCR on every PDF upload.
- OCR bounding boxes for highlight overlays.
- OCR billing and quota policy.
