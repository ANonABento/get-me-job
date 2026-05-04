/**
 * Filename sanitization for uploads.
 *
 * Strips path traversal, HTML/JS tags, and control characters. Caps length so
 * extreme filenames cannot bypass column limits or DoS the UI. Used for the
 * persisted display filename — the on-disk path is always server-generated.
 */

export const MAX_DISPLAY_FILENAME_LENGTH = 255;

const HTML_TAG_PATTERN = /<[^>]*>/g;
const CONTROL_CHAR_PATTERN = /[\x00-\x1f\x7f]/g;
const PATH_SEPARATORS_PATTERN = /[\\/]+/g;
const COLLAPSE_DOTS_PATTERN = /\.{2,}/g;
const COLLAPSE_WHITESPACE_PATTERN = /\s+/g;
const LEADING_UNSAFE_PATTERN = /^[.\s-]+/;
const TRAILING_UNSAFE_PATTERN = /[.\s-]+$/;

const FALLBACK_FILENAME = "upload";

/**
 * Sanitize a user-supplied display filename:
 *  - strip HTML/JS tags (e.g. `<script>alert(1)</script>` → `alert(1)`)
 *  - strip control chars (NULL, BEL, …)
 *  - strip path separators and traversal segments (`../../etc/passwd.pdf` →
 *    `passwd.pdf`)
 *  - collapse runs of whitespace to single spaces
 *  - cap to {@link MAX_DISPLAY_FILENAME_LENGTH} bytes/chars
 *
 * Always returns a non-empty string (`upload` if input sanitizes to nothing).
 */
export function sanitizeFilename(raw: string): string {
  if (typeof raw !== "string" || raw.length === 0) return FALLBACK_FILENAME;

  // 1. Drop tags first so `<script>foo</script>.pdf` doesn't leave the inner
  //    text behind glued to control chars.
  let cleaned = raw.replace(HTML_TAG_PATTERN, "");

  // 2. Strip control chars.
  cleaned = cleaned.replace(CONTROL_CHAR_PATTERN, "");

  // 3. Replace path separators with a single space, then collapse `..` runs so
  //    `../../etc/passwd.pdf` becomes ` etc passwd.pdf` and finally
  //    `etc passwd.pdf` after whitespace collapse.
  cleaned = cleaned.replace(PATH_SEPARATORS_PATTERN, " ");
  cleaned = cleaned.replace(COLLAPSE_DOTS_PATTERN, "");

  // 4. Drop residual angle brackets / quotes that some filesystems disallow
  //    even after tag stripping (e.g. unmatched `<` or `"`).
  cleaned = cleaned.replace(/[<>"|?*]/g, "");

  // 5. Collapse whitespace and trim unsafe leading/trailing characters.
  cleaned = cleaned.replace(COLLAPSE_WHITESPACE_PATTERN, " ").trim();
  cleaned = cleaned
    .replace(LEADING_UNSAFE_PATTERN, "")
    .replace(TRAILING_UNSAFE_PATTERN, "");

  // 6. If everything washed away, fall back to a generic name so we never
  //    persist an empty filename.
  if (cleaned.length === 0) return FALLBACK_FILENAME;

  // 7. Cap length. Slice from the END so the file extension (if any) survives
  //    when the front of the name is long.
  if (cleaned.length > MAX_DISPLAY_FILENAME_LENGTH) {
    cleaned = cleaned.slice(cleaned.length - MAX_DISPLAY_FILENAME_LENGTH);
  }

  return cleaned;
}
