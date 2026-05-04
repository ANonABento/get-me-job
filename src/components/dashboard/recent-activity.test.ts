import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRelativeTime } from "./recent-activity";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Just now' for timestamps less than a minute ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:30Z"));
    expect(formatRelativeTime("2024-06-15T12:00:00Z")).toBe("Just now");
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

  it("returns week buckets for timestamps older than a week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-30T12:00:00Z"));
    expect(formatRelativeTime("2024-06-15T12:00:00Z")).toBe("2w ago");
  });
});
