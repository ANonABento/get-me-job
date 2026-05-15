import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import SalaryCompatibilityPage from "./page";

describe("SalaryCompatibilityPage", () => {
  it("redirects the legacy salary route to the Toolkit salary tab", () => {
    SalaryCompatibilityPage({ params: { locale: "en" } });

    expect(redirectMock).toHaveBeenCalledWith("/en/toolkit?tab=salary");
  });

  it("respects the active locale when redirecting", () => {
    SalaryCompatibilityPage({ params: { locale: "fr" } });

    expect(redirectMock).toHaveBeenCalledWith("/fr/toolkit?tab=salary");
  });
});
