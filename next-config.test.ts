import { describe, expect, it } from "vitest";
import nextConfig from "./next.config.mjs";

describe("legacy jobs redirects", () => {
  it("redirects jobs pages to canonical opportunities pages", async () => {
    await expect(nextConfig.redirects?.()).resolves.toEqual(
      expect.arrayContaining([
        {
          source: "/jobs",
          destination: "/opportunities",
          permanent: true,
        },
        {
          source: "/jobs/:id",
          destination: "/opportunities/:id",
          permanent: true,
        },
        {
          source: "/jobs/research/:id",
          destination: "/opportunities/:id/research",
          permanent: true,
        },
      ]),
    );
  });
});
