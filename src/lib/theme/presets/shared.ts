import type { ThemeId, ThemeTokens } from "../tokens";

export const sansFont =
  '"Aptos", "Segoe UI", "Helvetica Neue", system-ui, sans-serif';
export const monoFont = '"Courier New", monospace';

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

export const sharedStatusTokens = {
  destructive: "0 72% 51%",
  destructiveForeground: "0 0% 100%",
  success: "152 60% 42%",
  successForeground: "0 0% 100%",
  warning: "38 92% 50%",
  warningForeground: "0 0% 0%",
  info: "220 80% 56%",
  infoForeground: "0 0% 100%",
} as const;
