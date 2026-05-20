/**
 * Chunk catalog + LayoutPreference types for the opportunity-card layout
 * builder. Spec: docs/opportunity-card-layout-builder-spec.md.
 *
 * Every visible piece of the review-queue card has a chunk key here.
 * The card renderer (`render-chunk.tsx`) maps each key to its concrete
 * JSX; the user's preferred ordering lives in
 * `opportunity_view_preferences.layout_json` and is consumed by both
 * `review-queue.tsx` (real card) and `layout-builder.tsx` (preview).
 *
 * Adding a new chunk:
 *   1. Append the key to `CHUNK_KEYS`
 *   2. Add a label to `CHUNK_LABELS`
 *   3. Add a section to `CHUNK_SECTIONS`
 *   4. Add a `RenderChunk` case
 *   5. `getEffectiveLayout` auto-injects unknown keys into the right
 *      section's `disabled` list — old user prefs don't break.
 */
import { z } from "zod";

export const CHUNK_KEYS = [
  // header
  "company",
  "title",
  "status-pill",
  "remote-badge",
  "source-badge",
  // meta — small chip-style metadata strip
  "applicants",
  "openings",
  "work-term",
  "level",
  "applicant-ratio",
  // body — the main reading flow
  "location",
  "salary",
  "deadline",
  "tags",
  "summary",
  // P1 of bento-builder-redesign-spec: structured sub-sections of the
  // posting body. Each renders only when its source field is non-empty.
  "responsibilities",
  "required-skills",
  "preferred-skills",
  "benefits",
  // actions — the footer
  "dismiss",
  "save",
  "apply",
  "google-company",
  "open-original",
] as const;

export type ChunkKey = (typeof CHUNK_KEYS)[number];

export const SECTIONS = ["header", "meta", "body", "actions"] as const;
export type Section = (typeof SECTIONS)[number];

/** Which section a chunk belongs to. Drag scope is restricted to its own section. */
export const CHUNK_SECTIONS: Record<ChunkKey, Section> = {
  company: "header",
  title: "header",
  "status-pill": "header",
  "remote-badge": "header",
  "source-badge": "header",
  applicants: "meta",
  openings: "meta",
  "work-term": "meta",
  level: "meta",
  "applicant-ratio": "meta",
  location: "body",
  salary: "body",
  deadline: "body",
  tags: "body",
  summary: "body",
  responsibilities: "body",
  "required-skills": "body",
  "preferred-skills": "body",
  benefits: "body",
  dismiss: "actions",
  save: "actions",
  apply: "actions",
  "google-company": "actions",
  "open-original": "actions",
};

/** Human-readable labels for the layout builder UI. */
export const CHUNK_LABELS: Record<ChunkKey, string> = {
  company: "Company",
  title: "Title",
  "status-pill": "Status pill",
  "remote-badge": "Remote badge",
  "source-badge": "Source badge",
  applicants: "Applicants",
  openings: "Openings",
  "work-term": "Work term",
  level: "Level",
  "applicant-ratio": "Applicant ratio",
  location: "Location",
  salary: "Salary",
  deadline: "Deadline",
  tags: "Tags",
  summary: "Summary",
  responsibilities: "Responsibilities",
  "required-skills": "Required skills",
  "preferred-skills": "Preferred skills",
  benefits: "Benefits",
  dismiss: "Dismiss button",
  save: "Save button",
  apply: "Apply button",
  "google-company": "Search company",
  "open-original": "Open original",
};

/**
 * Per-device layout — one ordered chunk list per section, plus a
 * `disabled` bag for keys the user has hidden. The renderer concatenates
 * all four section arrays in order and skips anything in `disabled`.
 */
export interface DeviceLayout {
  header: ChunkKey[];
  meta: ChunkKey[];
  body: ChunkKey[];
  actions: ChunkKey[];
  disabled: ChunkKey[];
}

export interface LayoutPreference {
  desktop: DeviceLayout;
  mobile: DeviceLayout;
}

const chunkKeySchema = z.enum(CHUNK_KEYS);

const deviceLayoutSchema = z.object({
  header: z.array(chunkKeySchema),
  meta: z.array(chunkKeySchema),
  body: z.array(chunkKeySchema),
  actions: z.array(chunkKeySchema),
  disabled: z.array(chunkKeySchema),
});

/**
 * Validates a LayoutPreference. Beyond the shape check, also enforces:
 *   - Every chunk key appears exactly once across header+meta+body+actions+disabled
 *   - Each section only contains chunks whose CHUNK_SECTIONS entry matches
 *
 * Returns the parsed object on success; throws ZodError otherwise.
 * Used by the PATCH endpoint + by getEffectiveLayout when reading.
 */
export const layoutPreferenceSchema = z
  .object({
    desktop: deviceLayoutSchema,
    mobile: deviceLayoutSchema,
  })
  .superRefine((value, ctx) => {
    for (const device of ["desktop", "mobile"] as const) {
      const layout = value[device];
      const allKeys = [
        ...layout.header,
        ...layout.meta,
        ...layout.body,
        ...layout.actions,
        ...layout.disabled,
      ];
      // Duplicate check.
      const seen = new Set<ChunkKey>();
      for (const key of allKeys) {
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${device} layout has duplicate chunk: ${key}`,
            path: [device],
          });
          return;
        }
        seen.add(key);
      }
      // Completeness check: every known chunk must be somewhere.
      for (const key of CHUNK_KEYS) {
        if (!seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${device} layout missing chunk: ${key}`,
            path: [device],
          });
          return;
        }
      }
      // Section-membership check — a body chunk can't appear in the
      // header array. (Disabled is exempt — chunks keep their section
      // when toggled off, so we don't need to validate it.)
      for (const section of ["header", "meta", "body", "actions"] as const) {
        for (const key of layout[section]) {
          if (CHUNK_SECTIONS[key] !== section) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${device}.${section}: chunk "${key}" belongs in section "${CHUNK_SECTIONS[key]}"`,
              path: [device, section],
            });
            return;
          }
        }
      }
    }
  });

export type LayoutPreferenceInput = z.input<typeof layoutPreferenceSchema>;
