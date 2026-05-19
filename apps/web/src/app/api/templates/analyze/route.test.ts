import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("/api/templates/analyze", () => {
  it("rejects legacy text template analysis", async () => {
    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      code: "legacy_template_analysis_disabled",
    });
  });
});
