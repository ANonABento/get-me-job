import { describe, expect, it, vi } from "vitest";
import { getLocaleSetting, setLocaleSetting } from "./locale";

vi.mock("@/lib/db/queries", () => ({
  getSetting: vi.fn(),
  setSetting: vi.fn(),
}));

const { getSetting, setSetting } = await import("@/lib/db/queries");

describe("locale settings", () => {
  it("falls back to en-US when no setting exists", () => {
    vi.mocked(getSetting).mockReturnValueOnce(null);

    expect(getLocaleSetting("user-1")).toBe("en-US");
  });

  it("normalizes and stores supported locales", () => {
    expect(setLocaleSetting("fr", "user-1")).toBe("fr");
    expect(setSetting).toHaveBeenCalledWith("locale", "fr", "user-1");
  });
});
