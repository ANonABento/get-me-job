import { describe, expect, it } from "vitest";
import { getEmailTemplateLayoutClass } from "./utils";

describe("getEmailTemplateLayoutClass", () => {
  it("uses a single template column before a template is selected", () => {
    expect(getEmailTemplateLayoutClass(false)).toContain(
      "lg:grid-cols-[minmax(0,42rem)]",
    );
  });

  it("uses two columns once a template has been selected", () => {
    expect(getEmailTemplateLayoutClass(true)).toContain("lg:grid-cols-2");
  });
});
