/**
 * Static sample opportunity used by the layout builder's live preview.
 * Spec: docs/opportunity-card-layout-builder-spec.md §4.
 *
 * Every chunk has data to render — no conditional null returns — so the
 * builder shows the user exactly what each chunk looks like, even ones
 * the user wouldn't normally see (e.g. `applicant-ratio` is rare on
 * real WW postings).
 */
import type { Opportunity } from "@/types/opportunity";

export const LAYOUT_PREVIEW_OPPORTUNITY: Opportunity = {
  id: "preview-opp",
  type: "job",
  title: "Senior Frontend Engineer",
  company: "Acme Robotics",
  source: "waterlooworks",
  sourceUrl: "https://example.com/preview",
  city: "Toronto",
  province: "ON",
  country: "Canada",
  remoteType: "remote",
  jobType: "full-time",
  level: "senior",
  openings: 2,
  applicants: 47,
  workTerm: "Fall 2026",
  summary:
    "Build the next generation of our editor experience. You'll lead a small team of frontend engineers, set technical direction, and ship features that thousands of users touch every day. We move fast, ship often, and prefer pragmatism over purity.",
  responsibilities: ["Lead frontend architecture", "Mentor junior engineers"],
  requiredSkills: ["React", "TypeScript", "Next.js"],
  salaryMin: 120_000,
  salaryMax: 160_000,
  salaryCurrency: "USD",
  inferredPayUnit: "annual",
  inferredPayMin: 120_000,
  inferredPayMax: 160_000,
  inferredPayCurrency: "USD",
  deadline: "May 22",
  status: "pending",
  tags: ["React", "TypeScript", "Senior"],
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z",
};
