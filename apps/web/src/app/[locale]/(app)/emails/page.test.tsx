import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import EmailsCompatibilityPage from "./page";

describe("EmailsCompatibilityPage", () => {
  it("redirects the legacy emails route to the Toolkit email tab", () => {
    EmailsCompatibilityPage({ params: { locale: "en" } });

    expect(redirectMock).toHaveBeenCalledWith("/en/toolkit?tab=email");
  });

  it("respects the active locale when redirecting", () => {
    EmailsCompatibilityPage({ params: { locale: "es" } });

    expect(redirectMock).toHaveBeenCalledWith("/es/toolkit?tab=email");
  });
});
