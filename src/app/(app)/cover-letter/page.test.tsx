import { describe, expect, it, vi } from "vitest";
import CoverLetterRedirectPage from "./page";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("CoverLetterRedirectPage", () => {
  it("redirects to Document Studio", () => {
    CoverLetterRedirectPage();

    expect(redirectMock).toHaveBeenCalledWith("/studio");
  });
});
