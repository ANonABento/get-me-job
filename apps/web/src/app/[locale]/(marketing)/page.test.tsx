import { describe, expect, it } from "vitest";
import { getLocalizedMarketingPageMetadata } from "@/lib/seo";
import { generateMetadata } from "./page";

describe("marketing landing page metadata", () => {
  it("uses the shared localized marketing metadata", () => {
    expect(generateMetadata({ params: { locale: "ja" } })).toEqual(
      getLocalizedMarketingPageMetadata("ja"),
    );
  });
});
