import { beforeEach, describe, expect, it, vi } from "vitest";
import BuilderRedirectPage from "./page";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("BuilderRedirectPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("redirects to Document Studio", () => {
    BuilderRedirectPage();

    expect(redirectMock).toHaveBeenCalledWith("/studio");
  });

  it("ignores legacy builder mode params", () => {
    BuilderRedirectPage();

    expect(redirectMock).toHaveBeenCalledWith("/studio");
  });
});
