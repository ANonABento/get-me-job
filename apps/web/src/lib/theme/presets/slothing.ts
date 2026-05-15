import type { ThemePreset } from "../tokens";
import { createThemeTokens, sharedStatusTokens } from "./shared";

const id = "slothing";
const name = "Slothing";
const description =
  "Calm editorial system — cream paper light, Midnight Indigo dark.";

// Reference fonts via globals.css vars so the Outfit/Geist/JetBrains pipeline
// (loaded in apps/web/src/app/[locale]/layout.tsx) drives typography.
const bodyFont = "var(--font-body)";
const displayFont = "var(--display)";

export const slothingTheme = {
  id,
  name,
  description,
  preview: {
    primary: "#1a1530",
    background: "#f5efe2",
    accent: "#b8704a",
  },
  light: createThemeTokens(id, name, description, {
    // Surfaces
    background: "38 47% 92%", // --bg #f5efe2
    foreground: "248 39% 14%", // --ink #1a1410
    card: "40 100% 97%", // --paper #fffaef
    cardForeground: "248 39% 14%",
    popover: "40 100% 97%",
    popoverForeground: "248 39% 14%",
    // Ink-based primary (matches Kev's primary button: ink bg / bg text)
    primary: "248 39% 14%",
    primaryForeground: "38 47% 92%",
    // Secondary / muted = alt band #e9dec8
    secondary: "40 43% 85%",
    secondaryForeground: "30 23% 18%",
    muted: "40 43% 85%",
    mutedForeground: "38 18% 35%",
    // Accent = brand rust (saturated hover states, editorial)
    accent: "21 44% 51%", // --brand rust #b8704a
    accentForeground: "40 100% 97%",
    // Border / input ≈ rgba(26,20,16,0.12) over cream ≈ #dbd5c9
    border: "40 24% 82%",
    input: "40 24% 82%",
    ring: "21 44% 51%",
    ...sharedStatusTokens,
    radius: "0.625rem", // 10px = --r-md soft
    // Editorial intent: paper cards are flat (bg + border only).
    // Shadow is reserved for hover-lift, drawers, modals, popovers.
    shadowCard: "none",
    shadowElevated: "0 20px 50px rgba(60, 40, 20, 0.18)",
    shadowButton: "none",
    fontFamily: bodyFont,
    fontHeading: displayFont,
    letterSpacing: "0",
    textTransform: "none",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "700",
    borderWidth: "1px",
  }),
  dark: createThemeTokens(id, name, description, {
    // Surfaces — Midnight Indigo
    background: "232 43% 10%", // --bg #0F1226
    foreground: "41 64% 90%", // --ink #f6ecd6 (warm cream)
    card: "234 42% 15%", // --paper #161936
    cardForeground: "41 64% 90%",
    popover: "234 42% 15%",
    popoverForeground: "41 64% 90%",
    // Cream-on-indigo button
    primary: "41 64% 90%",
    primaryForeground: "232 43% 10%",
    // Secondary / muted = #1A1D38
    secondary: "234 37% 16%",
    secondaryForeground: "41 32% 74%",
    muted: "234 37% 16%",
    mutedForeground: "251 17% 59%",
    // Brightened rust on dark
    accent: "23 67% 63%", // #e09060
    accentForeground: "232 43% 10%",
    // Border ≈ rgba(246,236,214,0.10) over indigo ≈ #262838
    border: "231 19% 19%",
    input: "231 19% 19%",
    ring: "23 67% 63%",
    ...sharedStatusTokens,
    radius: "0.625rem",
    // Flat paper cards on dark too. Modals/drawers keep elevation.
    shadowCard: "none",
    shadowElevated: "0 20px 50px rgba(0, 0, 0, 0.55)",
    shadowButton: "none",
    fontFamily: bodyFont,
    fontHeading: displayFont,
    letterSpacing: "0",
    textTransform: "none",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "700",
    borderWidth: "1px",
  }),
} as const satisfies ThemePreset;
