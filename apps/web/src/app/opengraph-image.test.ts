import { describe, expect, it, vi } from "vitest";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/config";

vi.mock("next/og", () => ({
  ImageResponse: vi.fn(function ImageResponse(element, options) {
    return { element, options };
  }),
}));

const OG_ROUTES = [
  () => import("./opengraph-image"),
  () => import("./[locale]/(marketing)/opengraph-image"),
  () => import("./[locale]/(marketing)/ats-scanner/opengraph-image"),
  () => import("./[locale]/(marketing)/pricing/opengraph-image"),
  () => import("./[locale]/(marketing)/extension/opengraph-image"),
  () => import("./[locale]/(app)/dashboard/opengraph-image"),
  () => import("./[locale]/(app)/answers/opengraph-image"),
  () => import("./[locale]/(app)/builder/opengraph-image"),
  () => import("./[locale]/(app)/cover-letter/opengraph-image"),
  () => import("./[locale]/(app)/documents/opengraph-image"),
  () => import("./[locale]/(app)/studio/opengraph-image"),
  () => import("./[locale]/(app)/tailor/opengraph-image"),
  () => import("./[locale]/(app)/upload/opengraph-image"),
  () => import("./[locale]/(app)/opportunities/opengraph-image"),
  () => import("./[locale]/(app)/opportunities/review/opengraph-image"),
  () => import("./[locale]/(app)/opportunities/[id]/opengraph-image"),
  () => import("./[locale]/(app)/opportunities/[id]/research/opengraph-image"),
  () => import("./[locale]/(app)/components/opengraph-image"),
  () => import("./[locale]/(app)/analytics/opengraph-image"),
  () => import("./[locale]/(app)/calendar/opengraph-image"),
  () => import("./[locale]/(app)/emails/opengraph-image"),
  () => import("./[locale]/(app)/interview/opengraph-image"),
  () => import("./[locale]/(app)/profile/opengraph-image"),
  () => import("./[locale]/(app)/salary/opengraph-image"),
  () => import("./[locale]/(app)/settings/opengraph-image"),
  () => import("./[locale]/(marketing)/privacy/opengraph-image"),
  () => import("./[locale]/(marketing)/terms/opengraph-image"),
];

describe("Open Graph image route modules", () => {
  it.each(OG_ROUTES)("exports the Next image route contract", async (load) => {
    const mod = await load();

    expect(mod.size).toEqual(OG_SIZE);
    expect(mod.contentType).toBe(OG_CONTENT_TYPE);
    expect(typeof mod.default).toBe("function");
  });
});
