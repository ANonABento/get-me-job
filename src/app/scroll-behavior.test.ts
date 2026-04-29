import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(process.cwd(), "src/app");

function readAppFile(relativePath: string) {
  return readFileSync(path.join(appDir, relativePath), "utf8");
}

describe("scroll behavior", () => {
  it("disables overscroll bounce on the root document and body", () => {
    const globalsCss = readAppFile("globals.css");

    expect(globalsCss).toMatch(/html\s*{[^}]*overscroll-behavior:\s*none;/s);
    expect(globalsCss).toMatch(/body\s*{[^}]*overscroll-behavior:\s*none;/s);
  });

  it("disables overscroll bounce on shared overflow containers", () => {
    const globalsCss = readAppFile("globals.css");

    expect(globalsCss).toMatch(
      /\.overflow-auto,\s*\.overflow-y-auto,\s*\.overflow-x-auto\s*{[^}]*overscroll-behavior:\s*none;/s
    );
  });

  it("uses a non-bouncing vertical scroller for app pages", () => {
    const appLayout = readAppFile("(app)/layout.tsx");

    expect(appLayout).toContain("overflow-y-auto overscroll-y-none");
  });
});
