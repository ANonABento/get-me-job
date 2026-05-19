import db from "./legacy";

// Extension session TTL is the lifetime of the row in extension_sessions
// — i.e., how long the token is valid for API calls. The previous code
// split this into RUNTIME (30 days) vs LOCALSTORAGE (5 minutes) on the
// belief that the localstorage handoff was a short-lived intermediate
// token, but the extension uses the same token for every subsequent
// request, so Firefox sessions (which always use the localstorage
// transport — Chrome's externally_connectable isn't supported there)
// were auto-disconnecting every 5 minutes. Align both at 30 days; the
// "transport" parameter is now purely informational.
export const EXTENSION_TOKEN_TTL_RUNTIME_MS = 30 * 24 * 60 * 60 * 1000;
export const EXTENSION_TOKEN_TTL_LOCALSTORAGE_MS =
  EXTENSION_TOKEN_TTL_RUNTIME_MS;

export function ensureExtensionSessionsColumns(): void {
  try {
    const columns = db
      .prepare("PRAGMA table_info(extension_sessions)")
      .all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((column) => column.name));

    if (!columnNames.has("device_user_agent")) {
      db.prepare(
        "ALTER TABLE extension_sessions ADD COLUMN device_user_agent text",
      ).run();
    }
  } catch {
    // Tests and first-boot environments may not have the table available yet.
  }
}
