import { describe, it, expect } from "vitest";
import { cn, generateId, formatDate, formatFileSize, slugify } from "./utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("should handle objects", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });
});

describe("generateId", () => {
  it("should return a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("should return a non-empty string", () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it("should generate unique ids", () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it("should only contain alphanumeric characters", () => {
    const id = generateId();
    expect(/^[a-z0-9]+$/.test(id)).toBe(true);
  });
});

describe("formatDate", () => {
  it("should format date string correctly", () => {
    const result = formatDate("2024-06-15");
    expect(result).toBe("Jun 2024");
  });

  it("should format Date object correctly", () => {
    const date = new Date("2024-12-25");
    const result = formatDate(date);
    expect(result).toBe("Dec 2024");
  });

  it("should handle different months", () => {
    // Use mid-month dates to avoid timezone edge cases
    expect(formatDate("2024-01-15")).toBe("Jan 2024");
    expect(formatDate("2024-07-15")).toBe("Jul 2024");
  });
});

describe("formatFileSize", () => {
  it("should format 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  it("should format bytes", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
  });

  it("should format kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(2048)).toBe("2 KB");
  });

  it("should format megabytes", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });

  it("should format gigabytes", () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
  });
});

describe("slugify", () => {
  it("should convert to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should replace spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("hello@world!")).toBe("helloworld");
  });

  it("should handle multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("should trim leading and trailing hyphens", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("should handle underscores", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });
});
