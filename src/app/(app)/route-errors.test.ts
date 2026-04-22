import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(process.cwd(), "src/app/(app)");

function findPageDirectories(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => findPageDirectories(path.join(dir, entry.name)));

  if (entries.some((entry) => entry.isFile() && entry.name === "page.tsx")) {
    directories.unshift(dir);
  }

  return directories;
}

describe("app route error boundaries", () => {
  it("adds an error.tsx file next to every app route page", () => {
    const pageDirectories = findPageDirectories(appDir);
    const routeDirectories = [appDir, ...pageDirectories];
    const missingErrors = routeDirectories
      .filter((directory) => !existsSync(path.join(directory, "error.tsx")))
      .map((directory) => path.relative(appDir, directory));

    expect(missingErrors).toEqual([]);
  });

  it("wires every app route error boundary to the shared client error UI", () => {
    const pageDirectories = findPageDirectories(appDir);
    const routeDirectories = [appDir, ...pageDirectories];
    const invalidErrors = routeDirectories.flatMap((directory) => {
      const errorFile = path.join(directory, "error.tsx");
      const relativePath = path.relative(appDir, errorFile);

      if (!existsSync(errorFile)) {
        return [relativePath];
      }

      const content = readFileSync(errorFile, "utf8");
      const hasClientDirective = /^"use client";/m.test(content);
      const importsSharedBoundary =
        /from\s+"@\/components\/ui\/app-route-error";/.test(content);
      const reExportsSharedBoundary = /export\s+default\s+AppRouteError;/.test(content);

      return hasClientDirective && importsSharedBoundary && reExportsSharedBoundary
        ? []
        : [relativePath];
    });

    expect(invalidErrors).toEqual([]);
  });
});
