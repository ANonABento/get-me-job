import { describe, expect, it } from "vitest";
import {
  clampZoomPercent,
  MAX_ZOOM_PERCENT,
  MIN_ZOOM_PERCENT,
} from "./toolbar";

describe("editor toolbar helpers", () => {
  it("clamps zoom values to the supported preview range", () => {
    expect(clampZoomPercent(25)).toBe(MIN_ZOOM_PERCENT);
    expect(clampZoomPercent(175)).toBe(MAX_ZOOM_PERCENT);
    expect(clampZoomPercent(103.4)).toBe(103);
  });

  it("falls back to 100 percent for non-finite zoom values", () => {
    expect(clampZoomPercent(Number.NaN)).toBe(100);
    expect(clampZoomPercent(Number.POSITIVE_INFINITY)).toBe(100);
  });
});
