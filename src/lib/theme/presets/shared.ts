import type { ThemeId, ThemeTokens } from "../tokens";

export const sansFont =
  '"Aptos", "Segoe UI", "Helvetica Neue", system-ui, sans-serif';
export const bloxyDisplayFont = '"Courier New", monospace';

export function createThemeTokens(
  id: ThemeId,
  name: string,
  description: string,
  tokens: Omit<ThemeTokens, "id" | "name" | "description">
): ThemeTokens {
  return {
    id,
    name,
    description,
    ...tokens,
  };
}

// Status colors are tuned to clear WCAG 2.1 AA contrast (>=4.5:1 for body text)
// against the white card background and against their own /10 tinted backgrounds.
export const sharedStatusTokens = {
  destructive: "0 72% 42%",
  destructiveForeground: "0 0% 100%",
  success: "152 65% 28%",
  successForeground: "0 0% 100%",
  warning: "30 95% 30%",
  warningForeground: "0 0% 100%",
  info: "220 80% 40%",
  infoForeground: "0 0% 100%",
} as const;
