/**
 * HTML → LaTeX converter.
 *
 * Converts a Tiptap-rendered resume HTML string into a self-contained LaTeX
 * document suitable for pasting into Overleaf or compiling with `pdflatex`.
 *
 * Design goals:
 *   - Never throw. Unknown tags are stripped, plain-text inside is preserved.
 *   - Escape LaTeX special characters in any text node we surface.
 *   - Produce a valid `\documentclass{article}` skeleton with `geometry`,
 *     `enumitem`, and `hyperref` packages so the output compiles standalone.
 */

const LATEX_SPECIAL_CHARS: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "%": "\\%",
  "&": "\\&",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

const LATEX_SPECIAL_REGEX = /[\\%&$#_{}~^]/g;

/**
 * Escape LaTeX special characters in plain text.
 *
 * The order of replacement matters because `\textbackslash{}` itself contains
 * `{` and `}`, but the single-pass regex with a function replacer avoids the
 * re-escape problem.
 */
export function escapeLatexText(input: string): string {
  if (!input) return "";
  return input.replace(LATEX_SPECIAL_REGEX, (c) => LATEX_SPECIAL_CHARS[c] ?? c);
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  middot: "·",
  copy: "©",
  reg: "®",
  trade: "™",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
};

/**
 * Decode the small set of HTML entities we expect to find in Tiptap output.
 * Anything we don't recognize is returned verbatim.
 */
export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&([a-zA-Z]+);/g, (whole, name: string) => {
      const lookup = NAMED_ENTITIES[name.toLowerCase()];
      return lookup ?? whole;
    });
}

// ---------------------------------------------------------------------------
// Minimal HTML tokenizer/parser.
//
// We deliberately avoid pulling in a full HTML parser. Tiptap output is
// well-formed, and our converter only needs to walk a small set of tags. We
// tokenize into open/close/void tags and text, then reduce to a stream of
// "block" instructions (paragraphs, sections, lists) that produce LaTeX.
// ---------------------------------------------------------------------------

type Token =
  | { kind: "open"; tag: string; attrs: Record<string, string> }
  | { kind: "close"; tag: string }
  | { kind: "void"; tag: string; attrs: Record<string, string> }
  | { kind: "text"; value: string };

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re =
    /([a-zA-Z_:][a-zA-Z0-9_.:-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[name] = decodeHtmlEntities(value);
  }
  return attrs;
}

export function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      // Skip HTML comments.
      if (html.startsWith("<!--", i)) {
        const end = html.indexOf("-->", i + 4);
        i = end === -1 ? html.length : end + 3;
        continue;
      }
      // Skip doctypes and processing instructions.
      if (html[i + 1] === "!" || html[i + 1] === "?") {
        const end = html.indexOf(">", i);
        i = end === -1 ? html.length : end + 1;
        continue;
      }
      const close = html.indexOf(">", i);
      if (close === -1) {
        // Stray `<` — treat the rest as text.
        tokens.push({ kind: "text", value: html.slice(i) });
        break;
      }
      const raw = html.slice(i + 1, close).trim();
      i = close + 1;
      if (!raw) continue;

      if (raw.startsWith("/")) {
        const tag = raw.slice(1).trim().split(/\s+/, 1)[0].toLowerCase();
        if (tag) tokens.push({ kind: "close", tag });
        continue;
      }

      const selfClosing = raw.endsWith("/");
      const inner = selfClosing ? raw.slice(0, -1).trim() : raw;
      const spaceIdx = inner.search(/\s/);
      const tag = (
        spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)
      ).toLowerCase();
      const attrs = parseAttrs(spaceIdx === -1 ? "" : inner.slice(spaceIdx));

      if (VOID_ELEMENTS.has(tag) || selfClosing) {
        tokens.push({ kind: "void", tag, attrs });
      } else {
        tokens.push({ kind: "open", tag, attrs });
      }
    } else {
      const next = html.indexOf("<", i);
      const slice = next === -1 ? html.slice(i) : html.slice(i, next);
      tokens.push({ kind: "text", value: slice });
      i = next === -1 ? html.length : next;
    }
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Block/inline rendering.
// ---------------------------------------------------------------------------

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "section",
  "article",
  "header",
  "footer",
  "main",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
]);

const STRIPPED_TAGS = new Set(["script", "style", "head", "title", "meta"]);

function isBlock(tag: string): boolean {
  return BLOCK_TAGS.has(tag);
}

/**
 * Collapse whitespace runs in a text node and escape LaTeX specials.
 */
function renderText(raw: string): string {
  const decoded = decodeHtmlEntities(raw);
  // Collapse all whitespace (including newlines) to single spaces — LaTeX
  // doesn't care about source line breaks within a paragraph.
  const collapsed = decoded.replace(/\s+/g, " ");
  return escapeLatexText(collapsed);
}

function wrap(content: string, prefix: string, suffix: string): string {
  return `${prefix}${content}${suffix}`;
}

/**
 * Recursive descent over tokens — produces LaTeX. Maintains a small stack of
 * "skip" markers so unknown wrappers (and `<script>`/`<style>`) drop their
 * content cleanly.
 */
class Renderer {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Render the full token stream as a sequence of blocks, separated by blank
   * lines. The implicit top-level is treated as a block container.
   */
  renderDocument(): string {
    const out: string[] = [];
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos];
      if (t.kind === "close") {
        // Stray close tag at root — skip.
        this.pos++;
        continue;
      }
      const piece = this.renderNext();
      if (piece.trim()) out.push(piece);
    }
    return out.join("\n\n");
  }

  private renderNext(): string {
    const t = this.tokens[this.pos];
    if (!t) return "";

    if (t.kind === "text") {
      this.pos++;
      return renderText(t.value);
    }
    if (t.kind === "void") {
      this.pos++;
      return this.renderVoid(t.tag);
    }
    if (t.kind === "close") {
      this.pos++;
      return "";
    }

    // Open tag.
    this.pos++;
    return this.renderOpen(t.tag, t.attrs);
  }

  private renderVoid(tag: string): string {
    if (tag === "br") return "\\\\\n";
    if (tag === "hr") return "\\hrulefill";
    return "";
  }

  /**
   * Collect inline children up to the matching close tag and return them as a
   * single string. Block descendants inside an "inline" context are flattened
   * — we never emit a `\section` inside a `\textbf{...}`.
   */
  private collectInline(closeTag: string): string {
    const parts: string[] = [];
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos];
      if (t.kind === "close" && t.tag === closeTag) {
        this.pos++;
        return parts.join("");
      }
      parts.push(this.renderNext());
    }
    return parts.join("");
  }

  /**
   * Like `collectInline` but for block contexts — returns an array of block
   * strings, splitting on block-level children when possible.
   */
  private collectBlocks(closeTag: string): string[] {
    const blocks: string[] = [];
    let buffer = "";
    const flush = () => {
      const s = buffer.trim();
      if (s) blocks.push(s);
      buffer = "";
    };
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos];
      if (t.kind === "close" && t.tag === closeTag) {
        this.pos++;
        flush();
        return blocks;
      }
      if (t.kind === "open" && isBlock(t.tag)) {
        flush();
        this.pos++;
        const rendered = this.renderOpen(t.tag, t.attrs);
        if (rendered.trim()) blocks.push(rendered.trim());
        continue;
      }
      buffer += this.renderNext();
    }
    flush();
    return blocks;
  }

  /**
   * Skip the entire subtree of an unknown/stripped tag, discarding all
   * children. Used for `<script>`, `<style>`, etc.
   */
  private skipSubtree(closeTag: string): void {
    let depth = 1;
    while (this.pos < this.tokens.length && depth > 0) {
      const t = this.tokens[this.pos++];
      if (t.kind === "open" && t.tag === closeTag) depth++;
      else if (t.kind === "close" && t.tag === closeTag) depth--;
    }
  }

  private renderOpen(tag: string, attrs: Record<string, string>): string {
    if (STRIPPED_TAGS.has(tag)) {
      this.skipSubtree(tag);
      return "";
    }

    switch (tag) {
      case "h1": {
        const inner = this.collectInline("h1");
        return `\\section*{${inner.trim()}}`;
      }
      case "h2": {
        const inner = this.collectInline("h2");
        return `\\subsection*{${inner.trim()}}`;
      }
      case "h3": {
        const inner = this.collectInline("h3");
        return `\\subsubsection*{${inner.trim()}}`;
      }
      case "h4":
      case "h5":
      case "h6": {
        const inner = this.collectInline(tag);
        return `\\paragraph*{${inner.trim()}}`;
      }
      case "p": {
        const inner = this.collectInline("p");
        return inner.trim();
      }
      case "strong":
      case "b": {
        const inner = this.collectInline(tag);
        return wrap(inner, "\\textbf{", "}");
      }
      case "em":
      case "i": {
        const inner = this.collectInline(tag);
        return wrap(inner, "\\textit{", "}");
      }
      case "u": {
        const inner = this.collectInline("u");
        return wrap(inner, "\\underline{", "}");
      }
      case "code": {
        const inner = this.collectInline("code");
        return wrap(inner, "\\texttt{", "}");
      }
      case "a": {
        const inner = this.collectInline("a");
        const href = attrs.href ?? "";
        if (!href) return inner;
        // hyperref's `\href` accepts a URL with most specials, but `%` and `#`
        // still need escaping. We do not run the full `escapeLatexText` on the
        // URL — that would mangle things like `&`, which are valid in URLs and
        // require a different treatment. Instead, we escape only the chars
        // that break `\href`.
        const safeHref = href
          .replace(/\\/g, "\\\\")
          .replace(/%/g, "\\%")
          .replace(/#/g, "\\#")
          .replace(/_/g, "\\_")
          .replace(/{/g, "\\{")
          .replace(/}/g, "\\}");
        const label = inner.trim() || escapeLatexText(href);
        return `\\href{${safeHref}}{${label}}`;
      }
      case "ul": {
        const items = this.collectListItems("ul");
        if (items.length === 0) return "";
        return [
          "\\begin{itemize}",
          ...items.map((item) => `  \\item ${item}`),
          "\\end{itemize}",
        ].join("\n");
      }
      case "ol": {
        const items = this.collectListItems("ol");
        if (items.length === 0) return "";
        return [
          "\\begin{enumerate}",
          ...items.map((item) => `  \\item ${item}`),
          "\\end{enumerate}",
        ].join("\n");
      }
      case "li": {
        // `<li>` encountered outside a list — render its inner content inline.
        return this.collectInline("li").trim();
      }
      case "blockquote": {
        const blocks = this.collectBlocks("blockquote");
        return ["\\begin{quote}", ...blocks, "\\end{quote}"].join("\n");
      }
      case "pre": {
        // Preserve text but escape it; LaTeX `verbatim` would break on Tiptap
        // children, so we wrap in `\texttt` paragraphs.
        const inner = this.collectInline("pre").trim();
        return `\\begin{quote}\\texttt{${inner}}\\end{quote}`;
      }
      default: {
        // Unknown tag — flatten: descend into children, concatenate their
        // output, drop the wrapper. This is how we handle `<span>`, `<div>`,
        // `<section>`, etc.
        if (isBlock(tag)) {
          const blocks = this.collectBlocks(tag);
          return blocks.join("\n\n");
        }
        return this.collectInline(tag);
      }
    }
  }

  private collectListItems(listTag: "ul" | "ol"): string[] {
    const items: string[] = [];
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos];
      if (t.kind === "close" && t.tag === listTag) {
        this.pos++;
        return items;
      }
      if (t.kind === "open" && t.tag === "li") {
        this.pos++;
        const inner = this.collectInline("li").trim();
        if (inner) items.push(inner);
        continue;
      }
      // Anything else inside a list — skip the token.
      this.pos++;
    }
    return items;
  }
}

/**
 * Convert just the body fragment of a Tiptap HTML string into LaTeX content
 * (no preamble, no `\begin{document}`). Useful for embedding or for tests.
 */
export function htmlToLatexBody(html: string): string {
  if (!html || !html.trim()) return "";
  const tokens = tokenize(html);
  const renderer = new Renderer(tokens);
  return renderer.renderDocument();
}

export interface HtmlToLatexOptions {
  /** Document title — used in PDF metadata. Defaults to "Resume". */
  title?: string;
  /** Document class options string, e.g. "11pt,letterpaper". */
  documentClassOptions?: string;
  /** Page margin (e.g. "1in", "2cm"). Defaults to "1in". */
  margin?: string;
}

export interface LatexPreviewResult {
  tex: string;
  warnings: string[];
}

const UNSUPPORTED_WARNING_TAGS: Record<string, string> = {
  img: "Images are omitted from LaTeX source.",
  table: "Tables are flattened and may need manual cleanup.",
  input: "Form controls are omitted from LaTeX source.",
};

export function collectLatexWarnings(html: string): string[] {
  const warnings = new Set<string>();
  for (const token of tokenize(html)) {
    if (
      (token.kind === "open" || token.kind === "void") &&
      UNSUPPORTED_WARNING_TAGS[token.tag]
    ) {
      warnings.add(UNSUPPORTED_WARNING_TAGS[token.tag]);
    }
  }
  return Array.from(warnings);
}

export function htmlToLatexPreview(
  html: string,
  options: HtmlToLatexOptions = {},
): LatexPreviewResult {
  return {
    tex: htmlToLatex(html, options),
    warnings: collectLatexWarnings(html),
  };
}

/**
 * Convert a Tiptap-rendered HTML string into a complete LaTeX document.
 *
 * The output starts with `\documentclass{article}` and pulls in `geometry`,
 * `enumitem`, and `hyperref`. The body of the converted HTML is wrapped in
 * `\begin{document}` / `\end{document}`.
 */
export function htmlToLatex(
  html: string,
  options: HtmlToLatexOptions = {},
): string {
  const title = options.title ?? "Resume";
  const classOpts = options.documentClassOptions ?? "11pt,letterpaper";
  const margin = options.margin ?? "1in";
  const body = htmlToLatexBody(html);

  return [
    `\\documentclass[${classOpts}]{article}`,
    `\\usepackage[utf8]{inputenc}`,
    `\\usepackage[T1]{fontenc}`,
    `\\usepackage[margin=${margin}]{geometry}`,
    `\\usepackage{enumitem}`,
    `\\usepackage{hyperref}`,
    ``,
    `\\hypersetup{`,
    `  colorlinks=true,`,
    `  linkcolor=black,`,
    `  urlcolor=blue,`,
    `  pdftitle={${escapeLatexText(title)}}`,
    `}`,
    ``,
    `\\pagestyle{empty}`,
    `\\setlength{\\parindent}{0pt}`,
    ``,
    `\\begin{document}`,
    ``,
    body,
    ``,
    `\\end{document}`,
    ``,
  ].join("\n");
}
