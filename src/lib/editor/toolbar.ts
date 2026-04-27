export const MIN_ZOOM_PERCENT = 50;
export const MAX_ZOOM_PERCENT = 150;

export function clampZoomPercent(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.min(MAX_ZOOM_PERCENT, Math.max(MIN_ZOOM_PERCENT, Math.round(value)));
}
