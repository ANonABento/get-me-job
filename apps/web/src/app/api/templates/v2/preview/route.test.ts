import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("/api/templates/v2/preview", () => {
  it("rejects V2 template previews", async () => {
    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      code: "legacy_template_preview_disabled",
    });
  });
});
