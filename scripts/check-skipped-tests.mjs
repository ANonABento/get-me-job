#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const TARGET_DIRS = ["apps/web/e2e", "apps/extension/tests", "apps/web/src"];
const ALLOWLIST_PATH = path.join(ROOT, "scripts/skipped-tests.allowlist.json");

const allowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
const allowed = new Map(
  allowlist.skips.map((entry) => [
    `${entry.file}:${entry.line}:${entry.kind}`,
    entry,
  ]),
);

const files = TARGET_DIRS.flatMap((dir) => walk(path.join(ROOT, dir))).filter(
  (file) => /\.(ts|tsx)$/.test(file),
);

const findings = [];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(ROOT, file).replaceAll(path.sep, "/");
  for (const match of findSkipCalls(source)) {
    if (!isUnconditionalSkip(source, match.index, match.kind)) continue;
    const key = `${relative}:${lineForIndex(source, match.index)}:${match.kind}`;
    if (!allowed.has(key)) {
      findings.push({ ...match, file: relative, line: lineForIndex(source, match.index) });
    }
  }
}

if (findings.length > 0) {
  console.error("Unallowlisted unconditional skipped tests found:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.kind}`);
  }
  console.error(
    `Add metadata to ${path.relative(ROOT, ALLOWLIST_PATH)} or make the skip conditional with a clear reason.`,
  );
  process.exit(1);
}

for (const [key, entry] of allowed) {
  if (!entry.reason || !entry.owner || !entry.targetRemovalCondition) {
    console.error(`Skipped-test allowlist entry is missing metadata: ${key}`);
    process.exit(1);
  }
}

console.log(
  `Skipped-test audit passed: ${allowed.size} unconditional skips documented.`,
);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() ? [full] : [];
  });
}

function findSkipCalls(source) {
  const regex =
    /\b(test\.describe\.skip|test\.skip|describe\.skip|it\.skip)\s*\(/g;
  const matches = [];
  let match;
  while ((match = regex.exec(source))) {
    matches.push({ kind: match[1], index: match.index });
  }
  return matches;
}

function isUnconditionalSkip(source, index, kind) {
  if (
    kind === "test.describe.skip" ||
    kind === "describe.skip" ||
    kind === "it.skip"
  ) {
    return true;
  }

  const open = source.indexOf("(", index);
  const afterOpen = source.slice(open + 1).trimStart();
  return (
    afterOpen.startsWith("true") ||
    afterOpen.startsWith('"') ||
    afterOpen.startsWith("'") ||
    afterOpen.startsWith("`")
  );
}

function lineForIndex(source, index) {
  return source.slice(0, index).split("\n").length;
}
