#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const SCAN_ROOTS = ["src"];
const FORBIDDEN_COLOR_FAMILIES = [
  "gray",
  "slate",
  "zinc",
  "neutral",
  "stone",
];
const FORBIDDEN_COLOR_NAMES = [
  "white",
  "black",
  "gray",
  "grey",
  "slate",
  "zinc",
  "neutral",
  "stone",
];
const STYLE_COLOR_PROPS = [
  "backgroundColor",
  "borderColor",
  "caretColor",
  "columnRuleColor",
  "color",
  "fill",
  "outlineColor",
  "stroke",
  "textDecorationColor",
];
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3,8})$/i;
const FUNCTION_COLOR_PATTERN = /^(?:rgb|rgba|hsl|hsla)\(/i;
const FORBIDDEN_COLOR_FAMILY_PATTERN = new RegExp(
  `^(?:bg|text|border)-(?:${FORBIDDEN_COLOR_FAMILIES.join(
    "|",
  )})-\\d{2,3}(?:\\/\\d+)?$`,
);
const CLASS_HELPER_CALL_PATTERN = /\b(?:cn|clsx|cva)\s*\(/g;
const STRING_LITERAL_PATTERN = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`/gms;

function getBaseTailwindClass(className) {
  let bracketDepth = 0;
  let baseStart = 0;

  for (let index = 0; index < className.length; index += 1) {
    const char = className[index];

    if (char === "[") {
      bracketDepth += 1;
      continue;
    }

    if (char === "]") {
      bracketDepth = Math.max(bracketDepth - 1, 0);
      continue;
    }

    if (char === ":" && bracketDepth === 0) {
      baseStart = index + 1;
    }
  }

  return className.slice(baseStart).replace(/^!/, "");
}

function isForbiddenColorClass(className) {
  const baseClassName = getBaseTailwindClass(className);

  if (/^(?:bg|text)-(?:white|black)(?:\/\d+)?$/.test(baseClassName)) {
    return true;
  }

  if (FORBIDDEN_COLOR_FAMILY_PATTERN.test(baseClassName)) {
    return true;
  }

  return /^(?:bg|text|border)-\[(?:#|rgb|rgba|hsl|hsla)/i.test(baseClassName);
}

function isAllowedColorLiteral(value) {
  return value === "transparent" || value === "inherit";
}

function isForbiddenInlineColorValue(value) {
  const normalized = value.trim().toLowerCase();

  if (isAllowedColorLiteral(normalized) || normalized.includes("var(--")) {
    return false;
  }

  return (
    HEX_COLOR_PATTERN.test(normalized) ||
    FUNCTION_COLOR_PATTERN.test(normalized) ||
    FORBIDDEN_COLOR_NAMES.includes(normalized)
  );
}

function lineAndColumnForIndex(source, index) {
  const before = source.slice(0, index);
  const lines = before.split(/\r?\n/);

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function addClassViolations(violations, source, filePath, classValue, index) {
  for (const className of classValue.split(/\s+/).filter(Boolean)) {
    if (!isForbiddenColorClass(className)) {
      continue;
    }

    const classIndex = source.indexOf(className, index);
    violations.push({
      filePath,
      ...lineAndColumnForIndex(source, classIndex >= 0 ? classIndex : index),
      value: className,
      message: `Forbidden hardcoded color utility "${className}". Use a semantic token class instead.`,
    });
  }
}

function findClosingParenIndex(source, openParenIndex) {
  let depth = 1;
  let quote = null;
  let escaped = false;

  for (let index = openParenIndex + 1; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(") {
      depth += 1;
      continue;
    }

    if (char !== ")") {
      continue;
    }

    depth -= 1;

    if (depth === 0) {
      return index;
    }
  }

  return -1;
}

function findClassNameViolations(source, filePath) {
  const violations = [];
  const staticClassPattern =
    /\bclassName\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*`([^`]*)`\s*\})/gms;

  for (const match of source.matchAll(staticClassPattern)) {
    const classValue =
      match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6] ?? "";

    addClassViolations(violations, source, filePath, classValue, match.index);
  }

  for (const match of source.matchAll(CLASS_HELPER_CALL_PATTERN)) {
    const openParenIndex = source.indexOf("(", match.index);
    const closeParenIndex = findClosingParenIndex(source, openParenIndex);

    if (closeParenIndex === -1) {
      continue;
    }

    const callBody = source.slice(openParenIndex + 1, closeParenIndex);

    for (const stringMatch of callBody.matchAll(STRING_LITERAL_PATTERN)) {
      const classValue = stringMatch[1] ?? stringMatch[2] ?? stringMatch[3] ?? "";
      addClassViolations(
        violations,
        source,
        filePath,
        classValue,
        openParenIndex + 1 + stringMatch.index,
      );
    }
  }

  return violations;
}

function findInlineStyleViolations(source, filePath) {
  const violations = [];
  const stylePattern = /\bstyle\s*=\s*\{\s*\{([\s\S]*?)\}\s*\}/gms;

  for (const match of source.matchAll(stylePattern)) {
    const styleBody = match[1] ?? "";

    for (const prop of STYLE_COLOR_PROPS) {
      const propPattern = new RegExp(
        `\\b${prop}\\s*:\\s*(['"])(.*?)\\1`,
        "gms",
      );

      for (const propMatch of styleBody.matchAll(propPattern)) {
        const value = propMatch[2] ?? "";

        if (!isForbiddenInlineColorValue(value)) {
          continue;
        }

        const valueIndex = match.index + propMatch.index;
        violations.push({
          filePath,
          ...lineAndColumnForIndex(source, valueIndex),
          value: `${prop}: "${value}"`,
          message: `Forbidden inline ${prop} literal "${value}". Use a CSS variable token instead.`,
        });
      }
    }
  }

  return violations;
}

function findForbiddenColorViolations(source, filePath) {
  return [
    ...findClassNameViolations(source, filePath),
    ...findInlineStyleViolations(source, filePath),
  ].sort((a, b) => a.line - b.line || a.column - b.column);
}

function listSourceFiles(rootDir) {
  const files = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }

      if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(entryPath);
      }
    }
  }

  walk(rootDir);
  return files;
}

function runForbiddenColorLint({
  cwd = process.cwd(),
  roots = SCAN_ROOTS,
} = {}) {
  const violations = [];

  for (const root of roots) {
    const absoluteRoot = path.resolve(cwd, root);

    if (!fs.existsSync(absoluteRoot)) {
      continue;
    }

    for (const filePath of listSourceFiles(absoluteRoot)) {
      const source = fs.readFileSync(filePath, "utf8");
      const relativePath = path.relative(cwd, filePath);

      violations.push(...findForbiddenColorViolations(source, relativePath));
    }
  }

  return violations;
}

function formatViolation(violation) {
  return `${violation.filePath}:${violation.line}:${violation.column} ${violation.message}`;
}

if (require.main === module) {
  const violations = runForbiddenColorLint();

  if (violations.length > 0) {
    console.error(
      `Forbidden hardcoded color lint failed with ${violations.length} violation(s):`,
    );
    for (const violation of violations) {
      console.error(formatViolation(violation));
    }
    process.exit(1);
  }
}

module.exports = {
  findForbiddenColorViolations,
  isForbiddenColorClass,
  isForbiddenInlineColorValue,
  runForbiddenColorLint,
};
