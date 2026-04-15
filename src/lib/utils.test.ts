import { describe, it, expect } from "vitest";
import { cn, generateId, formatDate, formatFileSize, slugify, extractJSON } from "./utils";

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

describe("extractJSON", () => {
  it("should parse pure JSON", () => {
    const input = '{"name": "John", "age": 30}';
    expect(extractJSON(input)).toEqual({ name: "John", age: 30 });
  });

  it("should parse JSON with surrounding whitespace", () => {
    const input = '  \n  {"name": "John"}  \n  ';
    expect(extractJSON(input)).toEqual({ name: "John" });
  });

  it("should parse JSON wrapped in ```json code fence", () => {
    const input = '```json\n{"name": "John"}\n```';
    expect(extractJSON(input)).toEqual({ name: "John" });
  });

  it("should parse JSON wrapped in ``` code fence without language", () => {
    const input = '```\n{"name": "John"}\n```';
    expect(extractJSON(input)).toEqual({ name: "John" });
  });

  it("should parse JSON with surrounding prose", () => {
    const input = 'Here is the result:\n{"name": "John", "age": 30}\nHope that helps!';
    expect(extractJSON(input)).toEqual({ name: "John", age: 30 });
  });

  it("should parse nested JSON objects", () => {
    const input = '{"contact": {"name": "John"}, "skills": ["Python"]}';
    expect(extractJSON(input)).toEqual({ contact: { name: "John" }, skills: ["Python"] });
  });

  it("should handle JSON with prose before and after braces", () => {
    const input = 'Sure! Here is your data: {"key": "value"} Let me know if you need more.';
    expect(extractJSON(input)).toEqual({ key: "value" });
  });

  it("should throw on completely invalid input", () => {
    expect(() => extractJSON("not json at all")).toThrow("Failed to extract JSON");
  });

  it("should throw on empty string", () => {
    expect(() => extractJSON("")).toThrow("Failed to extract JSON");
  });

  it("should throw on array input (not an object)", () => {
    expect(() => extractJSON('[1, 2, 3]')).toThrow("Failed to extract JSON");
  });

  it("should throw on primitive JSON values", () => {
    expect(() => extractJSON('"just a string"')).toThrow("Failed to extract JSON");
    expect(() => extractJSON("42")).toThrow("Failed to extract JSON");
  });

  it("should handle markdown fence with extra whitespace", () => {
    const input = '```json  \n  {"name": "John"}  \n  ```';
    expect(extractJSON(input)).toEqual({ name: "John" });
  });

  it("should parse complex resume-like JSON", () => {
    const input = `Here's the parsed resume:
\`\`\`json
{
  "contact": {"name": "Jane Doe", "email": "jane@example.com"},
  "experiences": [{"company": "Acme", "title": "Engineer"}],
  "skills": [{"name": "TypeScript", "category": "technical"}]
}
\`\`\``;
    const result = extractJSON(input);
    expect(result.contact).toEqual({ name: "Jane Doe", email: "jane@example.com" });
    expect(result.experiences).toHaveLength(1);
    expect(result.skills).toHaveLength(1);
  });

  it("should handle JSON with escaped characters", () => {
    const input = '{"message": "Hello \\"world\\"", "path": "C:\\\\Users"}';
    expect(extractJSON(input)).toEqual({ message: 'Hello "world"', path: "C:\\Users" });
  });
});
