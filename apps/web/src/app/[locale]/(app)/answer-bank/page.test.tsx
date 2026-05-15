import { beforeEach, describe, expect, it, vi } from "vitest";
import AnswerBankRedirectPage from "./page";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("AnswerBankRedirectPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("redirects to the Knowledge Bank answers tab", () => {
    AnswerBankRedirectPage({ params: { locale: "en" } });

    expect(redirectMock).toHaveBeenCalledWith("/en/bank?tab=answers");
  });

  it("preserves the active locale segment", () => {
    AnswerBankRedirectPage({ params: { locale: "fr" } });

    expect(redirectMock).toHaveBeenCalledWith("/fr/bank?tab=answers");
  });
});
