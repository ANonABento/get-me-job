import fs from "fs";
import path from "path";
import { needsOCRFallback, extractTextWithOCR } from "./ocr";

function toAbsolutePath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

function decodeUtf16Be(buffer: Buffer): string {
  const start = buffer[0] === 0xfe && buffer[1] === 0xff ? 2 : 0;
  const chars: string[] = [];
  for (let i = start; i + 1 < buffer.length; i += 2) {
    const code = (buffer[i] << 8) | buffer[i + 1];
    if (code > 0) chars.push(String.fromCharCode(code));
  }
  return chars.join("");
}

function decodePdfLiteralString(value: string): string {
  const decoded = value
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) =>
      String.fromCharCode(parseInt(octal, 8)),
    );

  const bytes = Buffer.from(
    Array.from(decoded, (char) => char.charCodeAt(0) & 0xff),
  );
  const hasUtf16Bom = bytes[0] === 0xfe && bytes[1] === 0xff;
  const nullByteCount = bytes.filter((byte) => byte === 0).length;
  if (hasUtf16Bom || nullByteCount > bytes.length / 4) {
    return decodeUtf16Be(bytes);
  }

  return decoded.replace(/\0/g, "");
}

function extractPdfTextFallback(dataBuffer: Buffer): string {
  const raw = dataBuffer.toString("latin1");
  const textRuns: string[] = [];
  const literalPattern = /\((?:\\.|[^\\)])*\)/g;
  const textRunPattern = /(\((?:\\.|[^\\)])*\)\s*Tj)/g;
  const textArrayPattern = /\[([\s\S]*?)\]\s*TJ/g;

  let match: RegExpExecArray | null;

  while ((match = textRunPattern.exec(raw)) !== null) {
    const literal = match[0].match(literalPattern)?.[0];
    if (literal) {
      textRuns.push(decodePdfLiteralString(literal.slice(1, -1)));
    }
  }

  while ((match = textArrayPattern.exec(raw)) !== null) {
    const chunk = match[1];
    for (const literal of chunk.match(literalPattern) ?? []) {
      textRuns.push(decodePdfLiteralString(literal.slice(1, -1)));
    }
  }

  return textRuns
    .map((text) => text.trim())
    .filter(Boolean)
    .join("\n");
}

function sanitizeExtractedPdfText(text: string): string {
  return text
    .replace(/þÿ/g, "")
    .replace(/\u0000/g, "")
    .replace(/(\d)Í(?=-[A-Za-z]{2,})/g, "$1")
    .replace(/[ \t]+\n/g, "\n");
}

function isReconstructedSectionHeading(line: string): boolean {
  const cleaned = line.replace(/[^\p{L}\p{N}\s&/]/gu, "").trim();
  return (
    cleaned.length >= 3 &&
    cleaned.length <= 50 &&
    cleaned === cleaned.toUpperCase() &&
    /[A-Z]{3,}/.test(cleaned)
  );
}

function isProjectsHeading(line: string): boolean {
  return /^PROJECTS?$/i.test(line.replace(/[^\p{L}\p{N}\s]/gu, "").trim());
}

/**
 * Some PDFs ship text as positioned glyphs with no embedded line
 * structure (LaTeX-compiled resumes are the worst offenders) —
 * `pdf-parse` then emits one giant line, which breaks the section
 * detector that relies on per-line headers like "EXPERIENCE". We
 * re-derive text from pdfjs's per-item positions, grouping items into
 * lines by y-overlap and joining with newlines. The result has
 * structural fidelity even when the PDF didn't embed any.
 */
async function extractTextFromPositions(dataBuffer: Buffer): Promise<string> {
  const { extractPdfPositions } = await import("@/lib/parse/pdf-positions");
  // Keep junk items (bullet glyphs, separators, single-char runs) when
  // reconstructing text — they carry structural signal that downstream
  // parsing needs (the bullet `•` tells `extractExperiences` what's a
  // highlight; the soft-hyphen `­` is often a date-range separator).
  // The matcher path filters them out elsewhere for its own reasons.
  const { items, links, pageDimensions } = await extractPdfPositions(
    dataBuffer,
    {
      includeJunk: true,
    },
  );
  if (items.length === 0) return "";
  const pageOut: string[] = [];
  for (const { page } of pageDimensions) {
    const pageItems = items.filter((it) => it.page === page);
    const pageLinks = links.filter((link) => link.page === page);
    if (pageItems.length === 0) continue;
    const lines: {
      y: number;
      y1: number;
      segs: { x0: number; x1: number; text: string }[];
      links: string[];
    }[] = [];
    for (const it of pageItems) {
      const h = Math.max(it.y1 - it.y0, 8);
      const found = lines.find((l) => Math.abs(l.y - it.y0) < h * 0.6);
      const seg = { x0: it.x0, x1: it.x1, text: it.text };
      if (found) {
        found.segs.push(seg);
        found.y1 = Math.max(found.y1, it.y1);
      } else {
        lines.push({ y: it.y0, y1: it.y1, segs: [seg], links: [] });
      }
    }
    lines.sort((a, b) => a.y - b.y);
    for (const link of pageLinks) {
      const line = lines.find(
        (candidate) => link.y1 >= candidate.y && link.y0 <= candidate.y1,
      );
      if (line && !line.links.includes(link.url)) line.links.push(link.url);
    }
    let inProjectsSection = false;
    const lineStrings = lines.map((l) => {
      const sorted = l.segs.sort((a, b) => a.x0 - b.x0);
      let out = "";
      let lastRight = -Infinity;
      for (const seg of sorted) {
        const gap = seg.x0 - lastRight;
        // Choose the separator from the horizontal gap between this
        // segment and the previous one on the same line:
        //   < 1.5pt → no separator (kerned glyphs, split ligatures —
        //     pdfjs emits "fi" as separate "f"+"i" runs sometimes;
        //     inserting a space here breaks email addresses like
        //     "user@domain.com" into "user @ domain.c om")
        //   1.5–25pt → single space (normal inter-word gap)
        //   > 25pt → ` | ` column marker (right-aligned date / location)
        if (out !== "") {
          if (gap < 1.5) {
            // no separator
          } else if (gap > 25) {
            out += " | ";
          } else {
            out += " ";
          }
        }
        out += seg.text;
        lastRight = seg.x1;
      }

      const isProjectHeadingLine = isProjectsHeading(out);
      if (isProjectHeadingLine) {
        inProjectsSection = true;
      } else if (isReconstructedSectionHeading(out)) {
        inProjectsSection = false;
      }

      for (const url of inProjectsSection && !isProjectHeadingLine
        ? l.links
        : []) {
        if (!out.includes(url)) out += ` ${url}`;
      }
      return out;
    });
    pageOut.push(lineStrings.join("\n"));
  }
  return pageOut.join("\n\n");
}

/**
 * pdf-parse output is "structurally flat" when newlines are too rare
 * to preserve section structure. Resumes are short (3-8KB of text)
 * with dozens of natural breaks. If we get fewer than one newline per
 * ~200 characters, the extractor lost the line structure and we
 * should re-derive it from pdfjs positions.
 */
function isStructurallyFlat(text: string): boolean {
  if (!text) return true;
  const lineCount = (text.match(/\n/g) ?? []).length;
  if (lineCount === 0 && text.length > 200) return true;
  return text.length / (lineCount + 1) > 200;
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const pdf = (await import("pdf-parse")).default;
  const dataBuffer = fs.readFileSync(toAbsolutePath(filePath));
  const fallbackText = extractPdfTextFallback(dataBuffer);

  let parsedText = "";
  let parseFailed = false;
  try {
    const data = await pdf(dataBuffer);
    parsedText = sanitizeExtractedPdfText(data.text);
  } catch {
    parseFailed = true;
  }

  if (!parseFailed && parsedText && !needsOCRFallback(parsedText)) {
    // pdf-parse's output is unreliable for layout-heavy PDFs (LaTeX
    // résumés especially): it routinely loses inter-word spaces or
    // emits the entire document on one line. The positions path
    // reads x/y from pdfjs and reconstructs lines + spaces from the
    // geometry — uniformly more reliable, so we prefer it when it
    // produces non-flat output. pdf-parse stays as the fallback for
    // pathological PDFs where positions extraction fails.
    try {
      const fromPositions = sanitizeExtractedPdfText(
        await extractTextFromPositions(dataBuffer),
      );
      if (fromPositions && !isStructurallyFlat(fromPositions)) {
        return fromPositions;
      }
    } catch {
      // Positions extraction unavailable — fall through.
    }
    return parsedText;
  }

  if (fallbackText) {
    return sanitizeExtractedPdfText(fallbackText);
  }

  return sanitizeExtractedPdfText(await extractTextWithOCR(dataBuffer));
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = (await import("mammoth")).default;
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractTextFromPDF(filePath);
    case ".txt":
      return fs.readFileSync(toAbsolutePath(filePath), "utf-8");
    case ".docx": {
      const buffer = fs.readFileSync(toAbsolutePath(filePath));
      return extractTextFromDocx(buffer);
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
