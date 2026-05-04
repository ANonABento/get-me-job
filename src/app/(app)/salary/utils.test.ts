import { describe, expect, it } from "vitest";
import { getSalaryCalculatorLayoutClass } from "./utils";

describe("getSalaryCalculatorLayoutClass", () => {
  it("uses a single calculator column before results exist", () => {
    expect(getSalaryCalculatorLayoutClass(false)).toContain(
      "lg:grid-cols-[minmax(0,42rem)]",
    );
  });

  it("uses two columns once results exist", () => {
    expect(getSalaryCalculatorLayoutClass(true)).toContain("lg:grid-cols-2");
  });
});
