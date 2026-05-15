import { cn } from "@/lib/utils";

export type CompanyGlyphSize = "sm" | "md" | "lg";

const sizeClass: Record<CompanyGlyphSize, string> = {
  // 16px — inline next to small text
  sm: "h-4 w-4 text-[9px]",
  // 20px — opportunity list rows
  md: "h-5 w-5 text-[11px]",
  // 32px — detail drawers, larger card headers
  lg: "h-8 w-8 text-[14px]",
};

/**
 * Known company → glyph class. Lowercase keys, normalized.
 * Keys match `.glyph-*` rules in globals.css.
 */
const KNOWN_GLYPHS: Record<string, string> = {
  linear: "glyph-linear",
  vercel: "glyph-vercel",
  notion: "glyph-notion",
  figma: "glyph-figma",
  stripe: "glyph-stripe",
  posthog: "glyph-posthog",
  supabase: "glyph-supabase",
  supa: "glyph-supabase",
  webflow: "glyph-webflow",
  arc: "glyph-arc",
  airbnb: "glyph-airbnb",
  anthropic: "glyph-anthropic",
  anthr: "glyph-anthropic",
  replit: "glyph-replit",
  loom: "glyph-loom",
  mercury: "glyph-mercury",
};

function normalize(company: string): string {
  return company
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function getGlyphClass(company: string | undefined | null): string {
  if (!company) return "glyph-default";
  const normalized = normalize(company);
  return KNOWN_GLYPHS[normalized] ?? "glyph-default";
}

export function getGlyphInitial(company: string | undefined | null): string {
  if (!company) return "?";
  const trimmed = company.trim();
  if (!trimmed) return "?";
  return trimmed[0]!.toUpperCase();
}

interface CompanyGlyphProps {
  company: string | undefined | null;
  size?: CompanyGlyphSize;
  className?: string;
  /**
   * Override the initial shown in the monogram. Useful when the API
   * gives you "linear" but you want the user-facing label to read "L".
   */
  initial?: string;
}

export function CompanyGlyph({
  company,
  size = "md",
  className,
  initial,
}: CompanyGlyphProps) {
  const glyphClass = getGlyphClass(company);
  // Flat editorial treatment — paper bg, 1px rule, brand-dark monogram.
  // Per-company differentiation removed (gradients felt too SaaS); the
  // glyph class names still resolve via getGlyphClass() for back-compat
  // but every variant is visually identical.
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-display font-bold",
        sizeClass[size],
        glyphClass,
        className,
      )}
    >
      {initial ?? getGlyphInitial(company)}
    </span>
  );
}
