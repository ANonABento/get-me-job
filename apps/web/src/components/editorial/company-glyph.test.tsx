import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompanyGlyph, getGlyphClass, getGlyphInitial } from "./company-glyph";

describe("getGlyphClass", () => {
  it.each([
    ["Linear", "glyph-linear"],
    ["VERCEL", "glyph-vercel"],
    ["Anthropic", "glyph-anthropic"],
    ["anthr", "glyph-anthropic"],
    ["Supabase", "glyph-supabase"],
    ["Mercury", "glyph-mercury"],
  ])("normalizes %s → %s", (input, expected) => {
    expect(getGlyphClass(input)).toBe(expected);
  });

  it("falls back to default for unknown companies", () => {
    expect(getGlyphClass("Acme Co")).toBe("glyph-default");
    // Multi-word names that happen to contain a known token still fall back —
    // we don't greedy-match "Mercury Bank" to the Mercury glyph.
    expect(getGlyphClass("Mercury Bank")).toBe("glyph-default");
  });

  it("falls back to default for empty/nullish input", () => {
    expect(getGlyphClass(undefined)).toBe("glyph-default");
    expect(getGlyphClass(null)).toBe("glyph-default");
    expect(getGlyphClass("")).toBe("glyph-default");
  });
});

describe("getGlyphInitial", () => {
  it("returns the uppercased first character", () => {
    expect(getGlyphInitial("linear")).toBe("L");
    expect(getGlyphInitial("Acme")).toBe("A");
  });
  it("returns ? for nullish input", () => {
    expect(getGlyphInitial(undefined)).toBe("?");
    expect(getGlyphInitial("")).toBe("?");
    expect(getGlyphInitial("   ")).toBe("?");
  });
});

describe("CompanyGlyph", () => {
  it("renders the known glyph class for a recognized company", () => {
    const { container } = render(<CompanyGlyph company="Linear" />);
    const glyph = container.firstChild as HTMLElement;
    expect(glyph.className).toMatch(/glyph-linear/);
    expect(glyph.textContent).toBe("L");
  });

  it("renders the default glyph + initial for an unknown company", () => {
    const { container } = render(<CompanyGlyph company="Custom Corp" />);
    const glyph = container.firstChild as HTMLElement;
    expect(glyph.className).toMatch(/glyph-default/);
    expect(glyph.textContent).toBe("C");
  });

  it("respects the size prop", () => {
    const { container } = render(<CompanyGlyph company="Linear" size="lg" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/h-8/);
  });

  it("allows an explicit initial override", () => {
    render(<CompanyGlyph company="linear" initial="L1" />);
    expect(screen.getByText("L1")).toBeInTheDocument();
  });

  it("is aria-hidden (decorative)", () => {
    const { container } = render(<CompanyGlyph company="Linear" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
