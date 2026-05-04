import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRelativeTime, rollupActivityItems } from "./recent-activity";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for timestamps less than a minute ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:30Z"));
    expect(formatRelativeTime("2024-06-15T12:00:00Z")).toBe("just now");
  });

  it("returns minutes for timestamps less than an hour ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:15:00Z"));
    expect(formatRelativeTime("2024-06-15T12:00:00Z")).toBe("15m ago");
  });

  it("returns hours for timestamps less than a day ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T15:00:00Z"));
    expect(formatRelativeTime("2024-06-15T12:00:00Z")).toBe("3h ago");
  });

  it("returns days for timestamps less than a week ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-18T12:00:00Z"));
    expect(formatRelativeTime("2024-06-15T12:00:00Z")).toBe("3d ago");
  });

  it("returns formatted date for timestamps older than a week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-30T12:00:00Z"));
    const result = formatRelativeTime("2024-06-15T12:00:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
  });
});

describe("rollupActivityItems", () => {
  it("groups same action, target, and day while preserving timestamps", () => {
    const result = rollupActivityItems([
      {
        id: "doc-1",
        type: "document_uploaded",
        title: "test-resume.pdf",
        timestamp: "2024-06-15T09:14:00Z",
      },
      {
        id: "doc-2",
        type: "document_uploaded",
        title: "test-resume.pdf",
        timestamp: "2024-06-15T09:18:00Z",
      },
      {
        id: "doc-3",
        type: "document_uploaded",
        title: "test-resume.pdf",
        timestamp: "2024-06-16T09:14:00Z",
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      type: "document_uploaded",
      title: "test-resume.pdf",
      count: 1,
      timestamp: "2024-06-16T09:14:00Z",
    });
    expect(result[1]).toMatchObject({
      type: "document_uploaded",
      title: "test-resume.pdf",
      count: 2,
      timestamp: "2024-06-15T09:18:00Z",
      timestamps: ["2024-06-15T09:14:00Z", "2024-06-15T09:18:00Z"],
    });
  });
});
