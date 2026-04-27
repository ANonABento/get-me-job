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
    BuilderRedirectPage({});

    expect(redirectMock).toHaveBeenCalledWith("/studio");
  });

  it("preserves the legacy cover letter builder mode", () => {
    BuilderRedirectPage({ searchParams: { mode: "cover-letter" } });

    expect(redirectMock).toHaveBeenCalledWith("/studio?mode=cover-letter");
  });
});
