import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(process.cwd(), "src/app");
const componentDir = path.resolve(process.cwd(), "src/components");
const scrollableOverflowUtilities = ["overflow-auto", "overflow-y-auto", "overflow-x-auto"] as const;

function readAppFile(relativePath: string) {
  return readFileSync(path.join(appDir, relativePath), "utf8");
}

function readSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return readSourceFiles(entryPath);
    if (!/\.(ts|tsx|css)$/.test(entry.name)) return [];
    return readFileSync(entryPath, "utf8");
  });
}

describe("scroll behavior", () => {
  it("disables overscroll bounce on the root document and body", () => {
    const globalsCss = readAppFile("globals.css");

    expect(globalsCss).toMatch(/html\s*{[^}]*overscroll-behavior:\s*none;/s);
    expect(globalsCss).toMatch(/body\s*{[^}]*overscroll-behavior:\s*none;/s);
  });

  it("disables overscroll bounce on shared overflow containers", () => {
    const globalsCss = readAppFile("globals.css");

    for (const utility of scrollableOverflowUtilities) {
      expect(globalsCss).toMatch(new RegExp(`\\.${utility}[,\\s{][^}]*overscroll-behavior:\\s*none;`, "s"));
    }
  });

  it("covers every scrollable overflow utility used by app pages and shared components", () => {
    const globalsCss = readAppFile("globals.css");
    const source = readSourceFiles(appDir).concat(readSourceFiles(componentDir)).join("\n");
    const usedScrollableUtilities = scrollableOverflowUtilities.filter((utility) => source.includes(utility));

    expect(usedScrollableUtilities).not.toHaveLength(0);

    for (const utility of usedScrollableUtilities) {
      expect(globalsCss).toMatch(new RegExp(`\\.${utility}[,\\s{][^}]*overscroll-behavior:\\s*none;`, "s"));
    }
  });

  it("uses a non-bouncing vertical scroller for app pages", () => {
    const appLayout = readAppFile("(app)/layout.tsx");

    expect(appLayout).toContain("overflow-y-auto overscroll-y-none");
  });
});
