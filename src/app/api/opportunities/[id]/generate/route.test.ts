import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("opportunity resume generation route", () => {
  it("serves resume templates from the new opportunities action path", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      templates: expect.arrayContaining([
        expect.objectContaining({ id: "classic", name: expect.any(String) }),
      ]),
    });
  });
});
