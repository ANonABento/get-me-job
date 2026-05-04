import { describe, expect, it } from "vitest";
import {
  formatDateAbsolute,
  formatDateRelative,
  normalizeLocale,
} from "./time";

describe("time formatting", () => {
  it("formats absolute dates with the requested locale", () => {
    expect(formatDateAbsolute("2026-04-29T20:01:04.882Z", "en-US")).toContain(
      "2026",
    );
    expect(formatDateAbsolute("2026-04-29T20:01:04.882Z", "en-GB")).toContain(
      "2026",
    );
  });

  it("formats relative dates across expected buckets", () => {
    const now = "2026-05-04T12:00:00.000Z";

    expect(formatDateRelative("2026-05-04T11:59:30.000Z", now)).toBe(
      "Just now",
    );
    expect(formatDateRelative("2026-05-04T10:00:00.000Z", now)).toBe("2h ago");
    expect(formatDateRelative("2026-05-03T12:00:00.000Z", now)).toBe(
      "Yesterday",
    );
    expect(formatDateRelative("2026-05-01T12:00:00.000Z", now)).toBe("3d ago");
    expect(formatDateRelative("2026-04-13T12:00:00.000Z", now)).toBe("3w ago");
    expect(formatDateRelative("2026-02-04T12:00:00.000Z", now)).toBe("2mo ago");
    expect(formatDateRelative("2024-05-04T12:00:00.000Z", now)).toBe("2y ago");
  });

  it("formats future dates without labeling them as past dates", () => {
    const now = "2026-05-04T12:00:00.000Z";

    expect(formatDateRelative("2026-05-04T12:15:00.000Z", now)).toBe("in 15m");
    expect(formatDateRelative("2026-05-05T12:00:00.000Z", now)).toBe(
      "Tomorrow",
    );
    expect(formatDateRelative("2026-05-07T12:00:00.000Z", now)).toBe("in 3d");
  });

  it("normalizes supported and unsupported locales", () => {
    expect(normalizeLocale("fr")).toBe("fr");
    expect(normalizeLocale("en")).toBe("en-US");
    expect(normalizeLocale("zz-ZZ")).toBe("en-US");
  });
});
