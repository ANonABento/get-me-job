export const EDITORIAL_PREFS_STORAGE_KEY = "slothing-prefs";

export const ACCENTS = [
  { id: "rust", label: "Rust", color: "#b8704a" },
  { id: "olive", label: "Olive", color: "#6a8a3a" },
  { id: "plum", label: "Plum", color: "#8e4a7a" },
  { id: "coral", label: "Coral", color: "#d96c5a" },
  { id: "indigo", label: "Indigo", color: "#4a5dc7" },
  { id: "ink", label: "Ink", color: "#1a1410" },
] as const;

export const DISPLAY_FONTS = [
  { id: "outfit", label: "Outfit" },
  { id: "space", label: "Space" },
  { id: "jakarta", label: "Jakarta" },
  { id: "inter", label: "Inter" },
  { id: "dm", label: "DM Sans" },
] as const;

export const RADII = [
  { id: "sharp", label: "Sharp" },
  { id: "soft", label: "Soft" },
  { id: "round", label: "Round" },
] as const;

export const DENSITIES = [
  { id: "comfy", label: "Comfy" },
  { id: "compact", label: "Compact" },
] as const;

/**
 * Ink shade — the "dominant ink" color used for primary buttons, the
 * AppBar "New" tile, and any element that wants a solid commitment.
 * Light mode shifts; dark mode keeps the cream variant.
 *
 * - `black`   — warm near-black (#1a1410). Original editorial default.
 * - `midnight` — deep indigo (#1a1530). Less harsh; reads as
 *                "old book ink" against cream paper.
 * - `espresso` — warm dark brown (#2a1a14). Still bold but warmer.
 */
export const INKS = [
  { id: "black", label: "Black", color: "#1a1410" },
  { id: "midnight", label: "Midnight", color: "#1a1530" },
  { id: "espresso", label: "Espresso", color: "#2a1a14" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];
export type DisplayFontId = (typeof DISPLAY_FONTS)[number]["id"];
export type RadiusId = (typeof RADII)[number]["id"];
export type DensityId = (typeof DENSITIES)[number]["id"];
export type InkId = (typeof INKS)[number]["id"];

export interface EditorialPrefs {
  accent: AccentId;
  display: DisplayFontId;
  radius: RadiusId;
  density: DensityId;
  ink: InkId;
}

export const DEFAULT_EDITORIAL_PREFS: EditorialPrefs = {
  accent: "rust",
  display: "outfit",
  radius: "soft",
  density: "comfy",
  // Midnight by default — less harsh than pure black against cream paper.
  ink: "midnight",
};

const ACCENT_IDS = new Set(ACCENTS.map((a) => a.id));
const DISPLAY_IDS = new Set(DISPLAY_FONTS.map((d) => d.id));
const RADIUS_IDS = new Set(RADII.map((r) => r.id));
const DENSITY_IDS = new Set(DENSITIES.map((d) => d.id));
const INK_IDS = new Set(INKS.map((i) => i.id));

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === "string" && ACCENT_IDS.has(value as AccentId);
}
export function isDisplayFontId(value: unknown): value is DisplayFontId {
  return typeof value === "string" && DISPLAY_IDS.has(value as DisplayFontId);
}
export function isRadiusId(value: unknown): value is RadiusId {
  return typeof value === "string" && RADIUS_IDS.has(value as RadiusId);
}
export function isDensityId(value: unknown): value is DensityId {
  return typeof value === "string" && DENSITY_IDS.has(value as DensityId);
}
export function isInkId(value: unknown): value is InkId {
  return typeof value === "string" && INK_IDS.has(value as InkId);
}

export function parseEditorialPrefs(raw: unknown): EditorialPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_EDITORIAL_PREFS };
  const obj = raw as Record<string, unknown>;
  return {
    accent: isAccentId(obj.accent)
      ? obj.accent
      : DEFAULT_EDITORIAL_PREFS.accent,
    display: isDisplayFontId(obj.display)
      ? obj.display
      : DEFAULT_EDITORIAL_PREFS.display,
    radius: isRadiusId(obj.radius)
      ? obj.radius
      : DEFAULT_EDITORIAL_PREFS.radius,
    density: isDensityId(obj.density)
      ? obj.density
      : DEFAULT_EDITORIAL_PREFS.density,
    ink: isInkId(obj.ink) ? obj.ink : DEFAULT_EDITORIAL_PREFS.ink,
  };
}
