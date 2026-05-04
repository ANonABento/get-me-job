import { describe, expect, it } from "vitest";
import { pluralize } from "./pluralize";

describe("pluralize", () => {
  it("uses singular for exactly one", () => {
    expect(pluralize(1, "Job")).toBe("1 Job");
  });

  it("uses plural for zero, many, negative, and non-integer counts", () => {
    expect(pluralize(0, "Job")).toBe("0 Jobs");
    expect(pluralize(2, "Job")).toBe("2 Jobs");
    expect(pluralize(100, "Job")).toBe("100 Jobs");
    expect(pluralize(-1, "Job")).toBe("-1 Jobs");
    expect(pluralize(1.5, "Job")).toBe("1.5 Jobs");
  });

  it("supports explicit plural overrides", () => {
    expect(pluralize(1, "goose", "geese")).toBe("1 goose");
    expect(pluralize(2, "goose", "geese")).toBe("2 geese");
  });
});
