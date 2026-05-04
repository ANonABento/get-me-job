import { describe, expect, it } from "vitest";
import { getResponsiveDetailGridClass } from "./shared-layout-utils";

describe("getResponsiveDetailGridClass", () => {
  it("uses a single primary column when no detail panel exists", () => {
    expect(getResponsiveDetailGridClass(false)).toContain(
      "lg:grid-cols-[minmax(0,42rem)]",
    );
  });

  it("uses two columns when a detail panel exists", () => {
    expect(getResponsiveDetailGridClass(true)).toContain("lg:grid-cols-2");
  });
});
