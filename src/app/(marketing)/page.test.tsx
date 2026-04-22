import { describe, expect, it, vi } from "vitest";
import { getMarketingPageMetadata } from "@/lib/seo";

vi.mock("./components/hero", () => ({
  Hero: () => null,
}));

vi.mock("./components/features", () => ({
  Features: () => null,
}));

vi.mock("./components/how-it-works", () => ({
  HowItWorks: () => null,
}));

vi.mock("./components/testimonials", () => ({
  Testimonials: () => null,
}));

vi.mock("./components/cta-section", () => ({
  CTASection: () => null,
}));

import { metadata } from "./page";

describe("marketing landing page metadata", () => {
  it("uses the shared marketing metadata", () => {
    expect(metadata).toEqual(getMarketingPageMetadata());
  });
});
