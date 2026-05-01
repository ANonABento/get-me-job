import {
  BASE_FONT_VARIABLES,
  BASE_SPACING_VARIABLES,
  DEFAULT_EFFECT_VARIABLES,
  type ThemeCssVariables,
  type ThemeTokens,
} from "./tokens";

export function themeTokensToCssVariables(
  tokens: ThemeTokens,
): ThemeCssVariables {
  const fontHeading = tokens.fontHeading ?? tokens.fontFamily;

  return {
    ...BASE_SPACING_VARIABLES,
    ...BASE_FONT_VARIABLES,
    ...DEFAULT_EFFECT_VARIABLES,
    "--background": tokens.background,
    "--foreground": tokens.foreground,
    "--card": tokens.card,
    "--card-foreground": tokens.cardForeground,
    "--popover": tokens.popover,
    "--popover-foreground": tokens.popoverForeground,
    "--primary": tokens.primary,
    "--primary-foreground": tokens.primaryForeground,
    "--secondary": tokens.secondary,
    "--secondary-foreground": tokens.secondaryForeground,
    "--muted": tokens.muted,
    "--muted-foreground": tokens.mutedForeground,
    "--accent": tokens.accent,
    "--accent-foreground": tokens.accentForeground,
    "--destructive": tokens.destructive,
    "--destructive-foreground": tokens.destructiveForeground,
    "--success": tokens.success,
    "--success-foreground": tokens.successForeground,
    "--warning": tokens.warning,
    "--warning-foreground": tokens.warningForeground,
    "--info": tokens.info,
    "--info-foreground": tokens.infoForeground,
    "--border": tokens.border,
    "--input": tokens.input,
    "--ring": tokens.ring,
    "--radius": tokens.radius,
    "--shadow-card": tokens.shadowCard,
    "--shadow-elevated": tokens.shadowElevated,
    "--shadow-button": tokens.shadowButton,
    "--shadow-sm": tokens.shadowCard,
    "--shadow": tokens.shadowCard,
    "--shadow-md": tokens.shadowElevated,
    "--shadow-lg": tokens.shadowElevated,
    "--shadow-xl": tokens.shadowElevated,
    "--font-family": tokens.fontFamily,
    "--font-sans": tokens.fontFamily,
    "--font-heading": fontHeading,
    "--letter-spacing": tokens.letterSpacing,
    "--text-transform": tokens.textTransform,
    "--font-weight-normal": tokens.fontWeightNormal,
    "--font-weight-medium": tokens.fontWeightMedium,
    "--font-weight-bold": tokens.fontWeightBold,
    "--border-width": tokens.borderWidth,
    "--backdrop-blur":
      tokens.backdropBlur ?? DEFAULT_EFFECT_VARIABLES["--backdrop-blur"],
    "--glow-color":
      tokens.glowColor ?? DEFAULT_EFFECT_VARIABLES["--glow-color"],
    "--glow-color-secondary":
      tokens.glowColorSecondary ??
      DEFAULT_EFFECT_VARIABLES["--glow-color-secondary"],
    "--offset-shadow-x":
      tokens.offsetShadowX ?? DEFAULT_EFFECT_VARIABLES["--offset-shadow-x"],
    "--offset-shadow-y":
      tokens.offsetShadowY ?? DEFAULT_EFFECT_VARIABLES["--offset-shadow-y"],
    "--gradient-bg":
      tokens.gradientBg ?? DEFAULT_EFFECT_VARIABLES["--gradient-bg"],
    "--surface-glass-opacity":
      tokens.surfaceGlassOpacity ??
      DEFAULT_EFFECT_VARIABLES["--surface-glass-opacity"],
    "--surface-border-opacity":
      tokens.surfaceBorderOpacity ??
      DEFAULT_EFFECT_VARIABLES["--surface-border-opacity"],
    "--glow-primary-opacity": tokens.glowColor ? "0.3" : "0.15",
    "--glass-border-color": DEFAULT_EFFECT_VARIABLES["--glass-border-color"],
    "--glass-background-color":
      DEFAULT_EFFECT_VARIABLES["--glass-background-color"],
    "--skeleton-highlight-color":
      DEFAULT_EFFECT_VARIABLES["--skeleton-highlight-color"],
    "--gradient-primary":
      "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
    "--gradient-success":
      "linear-gradient(135deg, hsl(var(--success)) 0%, hsl(172 55% 48%) 100%)",
    "--gradient-hero":
      "linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--accent) / 0.04) 100%)",
  };
}

export function applyThemeTokens(
  tokens: ThemeTokens,
  root: HTMLElement | null | undefined = typeof document === "undefined"
    ? undefined
    : document.documentElement,
): void {
  if (!root) return;

  const variables = themeTokensToCssVariables(tokens);
  root.dataset.themePreset = tokens.id;

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
}
