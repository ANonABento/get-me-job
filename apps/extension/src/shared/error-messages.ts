/**
 * User-facing error string mapping for the Slothing extension.
 *
 * The popup (and any other extension surface) should never show raw
 * `"Request failed: 503"` / `"Authentication expired"` strings. Wrap any
 * error path in `messageForError(err)` to get an English sentence safe
 * for end-users.
 *
 * Mirror of the message tone used by `apps/web/.../extension/connect/page.tsx`
 * `messageForStatus` — the connect page keeps its own copy because it sits
 * inside the next-intl tree (different package boundary), but the
 * user-visible strings should stay aligned. If you change one, change both.
 *
 * English-only by design: the extension itself does not use next-intl.
 */

/**
 * Maps an HTTP status code to a human-friendly message.
 */
export function messageForStatus(status: number): string {
  if (status === 401 || status === 403) {
    return "Sign in expired. Reconnect the extension.";
  }
  if (status === 429) {
    return "We're rate-limited. Try again in a minute.";
  }
  if (status >= 500) {
    return "Slothing servers are having a problem.";
  }
  return "Something went wrong. Please try again.";
}

export function retryExhaustedMessage(): string {
  return "Slothing is still not responding after retrying. Try again in a minute.";
}

/**
 * Best-effort mapping of an unknown thrown value to a human-friendly
 * message. Recognises the specific phrases the api-client throws today
 * (`"Authentication expired"`, `"Not authenticated"`, `"Request failed: <code>"`,
 * `"Failed to fetch"`) and falls back to the original message for anything
 * else — that's almost always more useful than a generic catch-all.
 */
export function messageForError(err: unknown): string {
  // Generic network failure (fetch in service workers throws TypeError here)
  if (err instanceof TypeError) {
    return "Network error. Check your connection and try again.";
  }

  const raw = err instanceof Error ? err.message : "";
  if (!raw) return "Something went wrong. Please try again.";

  // Auth-shaped messages from SlothingAPIClient.
  if (
    raw === "Authentication expired" ||
    raw === "Not authenticated" ||
    /unauthor/i.test(raw)
  ) {
    return messageForStatus(401);
  }

  // `Request failed: 503` — recover the status code.
  const match = raw.match(/Request failed:\s*(\d{3})/);
  if (match) {
    const code = Number(match[1]);
    if (Number.isFinite(code)) return messageForStatus(code);
  }

  const retryMatch = raw.match(/Request still failing after retry:\s*(\d{3})/);
  if (retryMatch) {
    return retryExhaustedMessage();
  }

  // Browser fetch failures bubble up as "Failed to fetch".
  if (/failed to fetch/i.test(raw) || /network/i.test(raw)) {
    return "Network error. Check your connection and try again.";
  }

  // For anything else, the underlying message is usually a sentence already
  // (e.g. "Couldn't read the full job description from this page.").
  return raw;
}
