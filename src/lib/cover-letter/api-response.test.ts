import { describe, expect, it } from "vitest";
import { readCoverLetterApiResult } from "./api-response";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), init);
}

describe("readCoverLetterApiResult", () => {
  it("returns generated content from a successful response", async () => {
    await expect(
      readCoverLetterApiResult(
        jsonResponse({ success: true, content: "Hello" }, { status: 200 }),
        "Fallback error"
      )
    ).resolves.toEqual({ ok: true, content: "Hello" });
  });

  it("returns API errors from failed responses", async () => {
    await expect(
      readCoverLetterApiResult(
        jsonResponse({ error: "No LLM provider configured" }, { status: 400 }),
        "Fallback error"
      )
    ).resolves.toEqual({ ok: false, error: "No LLM provider configured" });
  });

  it("falls back when the response shape is invalid", async () => {
    await expect(
      readCoverLetterApiResult(
        jsonResponse({ success: true }, { status: 200 }),
        "Fallback error"
      )
    ).resolves.toEqual({ ok: false, error: "Fallback error" });
  });
});
