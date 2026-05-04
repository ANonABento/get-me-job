import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  findForbiddenColorViolations,
  isForbiddenColorClass,
  isForbiddenInlineColorValue,
} = require("../../../scripts/forbidden-color-lint.cjs") as {
  findForbiddenColorViolations: (
    source: string,
    filePath: string,
  ) => Array<{
    filePath: string;
    line: number;
    column: number;
    value: string;
    message: string;
  }>;
  isForbiddenColorClass: (className: string) => boolean;
  isForbiddenInlineColorValue: (value: string) => boolean;
};

describe("forbidden color lint", () => {
  it("rejects hardcoded Tailwind color utilities", () => {
    expect(isForbiddenColorClass(`bg-${"white"}`)).toBe(true);
    expect(isForbiddenColorClass(`text-${"slate"}-500`)).toBe(true);
    expect(isForbiddenColorClass(`border-${"gray"}-200/80`)).toBe(true);
    expect(isForbiddenColorClass(`bg-[#${"ffffff"}]`)).toBe(true);
    expect(isForbiddenColorClass(`text-[${"rgb"}(255,255,255)]`)).toBe(true);
    expect(isForbiddenColorClass(`hover:bg-${"white"}`)).toBe(true);
    expect(isForbiddenColorClass(`dark:text-${"gray"}-500`)).toBe(true);
    expect(isForbiddenColorClass(`focus:!border-${"slate"}-300`)).toBe(true);
    expect(isForbiddenColorClass(`sm:hover:bg-[#${"ffffff"}]`)).toBe(true);
  });

  it("allows semantic token and transparent utilities", () => {
    expect(isForbiddenColorClass("bg-paper")).toBe(false);
    expect(isForbiddenColorClass("text-paper-foreground/60")).toBe(false);
    expect(isForbiddenColorClass("border-border")).toBe(false);
    expect(isForbiddenColorClass("bg-transparent")).toBe(false);
    expect(isForbiddenColorClass("text-inherit")).toBe(false);
  });

  it("rejects inline color literals but allows CSS variable references", () => {
    expect(isForbiddenInlineColorValue("#ffffff")).toBe(true);
    expect(isForbiddenInlineColorValue("rgba(0, 0, 0, 0.5)")).toBe(true);
    expect(isForbiddenInlineColorValue("white")).toBe(true);
    expect(isForbiddenInlineColorValue("hsl(var(--foreground))")).toBe(false);
    expect(isForbiddenInlineColorValue("transparent")).toBe(false);
  });

  it("finds className, cn, and inline style violations", () => {
    const source = `
      <div className="bg-${"white"} text-foreground" />
      <Button className={cn(getClassName("bg-card"), active && "border-${"gray"}-200", "bg-[${"rgb"}(255,255,255)]")} />
      <span style={{ ${"color"}: '#${"111827"}', backgroundColor: 'hsl(var(--card))', ${"fill"}: '${"black"}' }} />
    `;

    expect(findForbiddenColorViolations(source, "sample.tsx")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: `bg-${"white"}` }),
        expect.objectContaining({ value: `border-${"gray"}-200` }),
        expect.objectContaining({ value: `bg-[${"rgb"}(255,255,255)]` }),
        expect.objectContaining({ value: `${"color"}: "#${"111827"}"` }),
        expect.objectContaining({ value: `${"fill"}: "black"` }),
      ]),
    );
  });
});
