import { describe, expect, it } from "vitest";
import { messageForError, messageForStatus } from "./error-messages";

describe("messageForStatus", () => {
  it("returns the reconnect prompt for 401", () => {
    expect(messageForStatus(401)).toBe(
      "Sign in expired. Reconnect the extension.",
    );
  });

  it("treats 403 the same as 401 (not allowed = reconnect)", () => {
    expect(messageForStatus(403)).toBe(
      "Sign in expired. Reconnect the extension.",
    );
  });

  it("returns the rate-limit hint for 429", () => {
    expect(messageForStatus(429)).toBe(
      "We're rate-limited. Try again in a minute.",
    );
  });

  it("returns the server-side message for 500", () => {
    expect(messageForStatus(500)).toBe(
      "Slothing servers are having a problem.",
    );
  });

  it("returns the server-side message for 503", () => {
    expect(messageForStatus(503)).toBe(
      "Slothing servers are having a problem.",
    );
  });

  it("falls back to a generic message for unrecognised codes (400)", () => {
    expect(messageForStatus(400)).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("falls back to a generic message for 0 / invalid codes", () => {
    expect(messageForStatus(0)).toBe("Something went wrong. Please try again.");
  });
});

describe("messageForError", () => {
  it("maps the api-client's Authentication expired message to a 401-style message", () => {
    expect(messageForError(new Error("Authentication expired"))).toBe(
      messageForStatus(401),
    );
  });

  it("maps Not authenticated to a 401-style message", () => {
    expect(messageForError(new Error("Not authenticated"))).toBe(
      messageForStatus(401),
    );
  });

  it("recovers the HTTP status from a Request failed: <code> message", () => {
    expect(messageForError(new Error("Request failed: 429"))).toBe(
      messageForStatus(429),
    );
    expect(messageForError(new Error("Request failed: 503"))).toBe(
      messageForStatus(503),
    );
  });

  it("distinguishes exhausted retry failures from immediate server failures", () => {
    expect(
      messageForError(new Error("Request still failing after retry: 503")),
    ).toBe(
      "Slothing is still not responding after retrying. Try again in a minute.",
    );
  });

  it("maps Failed to fetch (browser network error) to a network message", () => {
    expect(messageForError(new Error("Failed to fetch"))).toBe(
      "Network error. Check your connection and try again.",
    );
  });

  it("maps a TypeError (fetch in SW) to a network message", () => {
    expect(messageForError(new TypeError("anything"))).toBe(
      "Network error. Check your connection and try again.",
    );
  });

  it("falls back to the raw message if it already looks like a sentence", () => {
    const msg = "Couldn't read the full job description from this page.";
    expect(messageForError(new Error(msg))).toBe(msg);
  });

  it("returns the generic message for non-Error throws / empty messages", () => {
    expect(messageForError(undefined)).toBe(
      "Something went wrong. Please try again.",
    );
    expect(messageForError("a string")).toBe(
      "Something went wrong. Please try again.",
    );
    expect(messageForError(new Error(""))).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
