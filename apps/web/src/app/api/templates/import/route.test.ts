import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("/api/templates/import", () => {
  it("rejects legacy style-template imports", async () => {
    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      code: "legacy_template_import_disabled",
    });
  });
});
