export type StudioSaveStatusState = "saved" | "saving" | "unsaved" | "error";

export interface StudioSaveStatus {
  state: StudioSaveStatusState;
  lastSavedAt?: number;
  error?: string;
}

export function formatRelativeSaveTime(
  timestamp: number,
  now = Date.now(),
): string {
  const elapsedSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (elapsedSeconds < 5) return "Just now";
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d ago`;
}

export function getStudioSaveStatusLabel(
  status: StudioSaveStatus,
  now = Date.now(),
): string {
  if (status.state === "saving") return "Saving...";
  if (status.state === "unsaved") return "Unsaved changes";
  if (status.state === "error") {
    return status.error ? `Save failed - ${status.error}` : "Save failed";
  }

  return `Saved ${formatRelativeSaveTime(status.lastSavedAt ?? now, now)}`;
}
