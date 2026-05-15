import { beforeEach, describe, expect, it, vi } from "vitest";
import BankRedirectPage from "./page";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("BankRedirectPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("redirects to the new /components route", () => {
    BankRedirectPage({ params: { locale: "en" } });
    expect(redirectMock).toHaveBeenCalledWith("/en/components");
  });

  it("preserves the active locale segment", () => {
    BankRedirectPage({ params: { locale: "fr" } });
    expect(redirectMock).toHaveBeenCalledWith("/fr/components");
  });
});
