const THEME_RADIUS_AND_BORDER_CLASSES =
  "rounded-[var(--radius)] border-[length:var(--border-width)]";

const THEME_GLASS_SURFACE_CLASSES =
  `glass ${THEME_RADIUS_AND_BORDER_CLASSES} text-card-foreground shadow-[var(--shadow-card)] [backdrop-filter:var(--backdrop-blur)]`;

export const THEME_SURFACE_CLASSES =
  THEME_GLASS_SURFACE_CLASSES;

export const THEME_INTERACTIVE_SURFACE_CLASSES =
  `${THEME_GLASS_SURFACE_CLASSES} transition-all hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]`;

export const THEME_MUTED_SURFACE_CLASSES =
  `${THEME_RADIUS_AND_BORDER_CLASSES} bg-muted/30 [backdrop-filter:var(--backdrop-blur)]`;

export const THEME_CONTROL_CLASSES =
  `${THEME_RADIUS_AND_BORDER_CLASSES} bg-background`;

export const THEME_DASHED_SURFACE_CLASSES =
  `${THEME_RADIUS_AND_BORDER_CLASSES} border-dashed bg-background/50 [backdrop-filter:var(--backdrop-blur)]`;

export const THEME_PRIMARY_GRADIENT_BUTTON_CLASSES =
  "bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90";
