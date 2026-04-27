import { describe, expect, it, vi } from "vitest";
import TailorRedirectPage from "./page";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("TailorRedirectPage", () => {
  it("redirects to Document Studio tailored mode", () => {
    TailorRedirectPage();

    expect(redirectMock).toHaveBeenCalledWith("/studio?mode=tailored");
  });
});
