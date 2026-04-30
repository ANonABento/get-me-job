import { describe, expect, it } from "vitest";
import {
  THEME_CONTROL_CLASSES,
  THEME_DASHED_SURFACE_CLASSES,
  THEME_INTERACTIVE_SURFACE_CLASSES,
  THEME_MUTED_SURFACE_CLASSES,
  THEME_PRIMARY_GRADIENT_BUTTON_CLASSES,
  THEME_SURFACE_CLASSES,
} from "./component-classes";

describe("theme component classes", () => {
  it.each([
    THEME_SURFACE_CLASSES,
    THEME_INTERACTIVE_SURFACE_CLASSES,
    THEME_MUTED_SURFACE_CLASSES,
    THEME_CONTROL_CLASSES,
    THEME_DASHED_SURFACE_CLASSES,
  ])("uses theme token radius and border width", (classes) => {
    expect(classes).toContain("rounded-[var(--radius)]");
    expect(classes).toContain("border-[length:var(--border-width)]");
  });

  it("uses theme shadows and backdrop blur for card surfaces", () => {
    expect(THEME_SURFACE_CLASSES).toContain("glass");
    expect(THEME_SURFACE_CLASSES).toContain("shadow-[var(--shadow-card)]");
    expect(THEME_SURFACE_CLASSES).toContain(
      "[backdrop-filter:var(--backdrop-blur)]",
    );
    expect(THEME_INTERACTIVE_SURFACE_CLASSES).toContain(
      "hover:shadow-[var(--shadow-elevated)]",
    );
  });

  it("uses theme tokens for primary gradient buttons", () => {
    expect(THEME_PRIMARY_GRADIENT_BUTTON_CLASSES).toContain(
      "bg-[image:var(--gradient-primary)]",
    );
    expect(THEME_PRIMARY_GRADIENT_BUTTON_CLASSES).toContain(
      "text-primary-foreground",
    );
  });
});
