import { describe, expect, it } from "vitest";

import {
  decodeHtmlEntities,
  escapeLatexText,
  htmlToLatex,
  htmlToLatexBody,
  htmlToLatexPreview,
  tokenize,
} from "./html-to-latex";

describe("escapeLatexText", () => {
  it("escapes percent, ampersand, dollar, hash, and underscore", () => {
    expect(escapeLatexText("50% off & save $5 #deal_now")).toBe(
      "50\\% off \\& save \\$5 \\#deal\\_now",
    );
  });

  it("escapes curly braces", () => {
    expect(escapeLatexText("{a, b}")).toBe("\\{a, b\\}");
  });

  it("escapes backslash, tilde, and caret to safe macros", () => {
    expect(escapeLatexText("a\\b~c^d")).toBe(
      "a\\textbackslash{}b\\textasciitilde{}c\\textasciicircum{}d",
    );
  });

  it("returns empty for falsy input", () => {
    expect(escapeLatexText("")).toBe("");
  });

  it("does not double-escape characters introduced by replacements", () => {
    // Backslash is replaced with `\textbackslash{}`. The `{` and `}` in that
    // replacement must NOT be re-escaped. A single regex pass with a function
    // replacer guarantees this; this test pins the contract.
    expect(escapeLatexText("\\")).toBe("\\textbackslash{}");
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes the common named entities", () => {
    expect(decodeHtmlEntities("Tom &amp; Jerry &mdash; pals")).toBe(
      "Tom & Jerry — pals",
    );
  });

  it("decodes numeric entities", () => {
    expect(decodeHtmlEntities("&#8211; dash &#x2014; em")).toBe("– dash — em");
  });

  it("leaves unknown entities verbatim", () => {
    expect(decodeHtmlEntities("&notAnEntity;")).toBe("&notAnEntity;");
  });
});

describe("tokenize", () => {
  it("splits tags and text", () => {
    expect(tokenize("<p>Hello <b>world</b></p>")).toEqual([
      { kind: "open", tag: "p", attrs: {} },
      { kind: "text", value: "Hello " },
      { kind: "open", tag: "b", attrs: {} },
      { kind: "text", value: "world" },
      { kind: "close", tag: "b" },
      { kind: "close", tag: "p" },
    ]);
  });

  it("captures attributes including hrefs", () => {
    const tokens = tokenize('<a href="https://example.com/?q=1&amp;r=2">x</a>');
    expect(tokens[0]).toMatchObject({
      kind: "open",
      tag: "a",
      attrs: { href: "https://example.com/?q=1&r=2" },
    });
  });

  it("skips HTML comments", () => {
    expect(tokenize("<!-- skip me --><p>x</p>")).toEqual([
      { kind: "open", tag: "p", attrs: {} },
      { kind: "text", value: "x" },
      { kind: "close", tag: "p" },
    ]);
  });
});

describe("htmlToLatexBody — section headers", () => {
  it("maps h1/h2/h3 to section/subsection/subsubsection", () => {
    const out = htmlToLatexBody("<h1>Top</h1><h2>Mid</h2><h3>Low</h3>");
    expect(out).toContain("\\section*{Top}");
    expect(out).toContain("\\subsection*{Mid}");
    expect(out).toContain("\\subsubsection*{Low}");
  });

  it("maps h4-h6 to \\paragraph*", () => {
    const out = htmlToLatexBody("<h4>Sub</h4><h5>X</h5><h6>Y</h6>");
    expect(out).toContain("\\paragraph*{Sub}");
    expect(out).toContain("\\paragraph*{X}");
    expect(out).toContain("\\paragraph*{Y}");
  });

  it("escapes special chars inside headings", () => {
    expect(htmlToLatexBody("<h2>R&amp;D 100%</h2>")).toContain(
      "\\subsection*{R\\&D 100\\%}",
    );
  });
});

describe("htmlToLatexBody — lists", () => {
  it("converts unordered lists to itemize", () => {
    const out = htmlToLatexBody("<ul><li>One</li><li>Two</li></ul>");
    expect(out).toBe(
      [
        "\\begin{itemize}",
        "  \\item One",
        "  \\item Two",
        "\\end{itemize}",
      ].join("\n"),
    );
  });

  it("converts ordered lists to enumerate", () => {
    const out = htmlToLatexBody("<ol><li>First</li><li>Second</li></ol>");
    expect(out).toBe(
      [
        "\\begin{enumerate}",
        "  \\item First",
        "  \\item Second",
        "\\end{enumerate}",
      ].join("\n"),
    );
  });

  it("escapes special chars in list items", () => {
    const out = htmlToLatexBody("<ul><li>Saved 50% on R&amp;D</li></ul>");
    expect(out).toContain("\\item Saved 50\\% on R\\&D");
  });

  it("preserves inline formatting inside list items", () => {
    const out = htmlToLatexBody(
      "<ul><li>Use <strong>TypeScript</strong> daily</li></ul>",
    );
    expect(out).toContain("\\item Use \\textbf{TypeScript} daily");
  });

  it("returns nothing for an empty list", () => {
    expect(htmlToLatexBody("<ul></ul>")).toBe("");
  });
});

describe("htmlToLatexBody — bold and italic", () => {
  it("maps strong and b to \\textbf", () => {
    expect(htmlToLatexBody("<p><strong>bold</strong> text</p>")).toContain(
      "\\textbf{bold}",
    );
    expect(htmlToLatexBody("<p><b>bold</b></p>")).toContain("\\textbf{bold}");
  });

  it("maps em and i to \\textit", () => {
    expect(htmlToLatexBody("<p><em>nice</em></p>")).toContain("\\textit{nice}");
    expect(htmlToLatexBody("<p><i>nice</i></p>")).toContain("\\textit{nice}");
  });

  it("nests bold inside italic", () => {
    const out = htmlToLatexBody("<p><em>say <strong>hi</strong></em></p>");
    expect(out).toContain("\\textit{say \\textbf{hi}}");
  });

  it("maps code to \\texttt", () => {
    expect(htmlToLatexBody("<p>run <code>npm test</code></p>")).toContain(
      "\\texttt{npm test}",
    );
  });
});

describe("htmlToLatexBody — hyperlinks", () => {
  it("emits \\href for anchor tags", () => {
    const out = htmlToLatexBody(
      '<p><a href="https://example.com">Example</a></p>',
    );
    expect(out).toBe("\\href{https://example.com}{Example}");
  });

  it("uses the URL as label when anchor has no text", () => {
    const out = htmlToLatexBody('<p><a href="https://example.com"></a></p>');
    expect(out).toContain("\\href{https://example.com}{https://example.com}");
  });

  it("escapes %, #, and _ inside the href target", () => {
    const out = htmlToLatexBody(
      '<p><a href="https://example.com/path_to/100%25?id=#frag">Link</a></p>',
    );
    expect(out).toContain(
      "\\href{https://example.com/path\\_to/100\\%25?id=\\#frag}{Link}",
    );
  });

  it("drops the anchor wrapper when href is missing", () => {
    const out = htmlToLatexBody("<p><a>nope</a></p>");
    expect(out).toBe("nope");
  });
});

describe("htmlToLatexBody — special-character escaping in plain text", () => {
  it("escapes &, %, $, #, _, {, } in body text", () => {
    const out = htmlToLatexBody(
      "<p>Cost: $5 &amp; 10% of #items_total {final}</p>",
    );
    expect(out).toContain(
      "Cost: \\$5 \\& 10\\% of \\#items\\_total \\{final\\}",
    );
  });

  it("escapes backslash in body text", () => {
    expect(htmlToLatexBody("<p>C:\\Users\\me</p>")).toContain(
      "C:\\textbackslash{}Users\\textbackslash{}me",
    );
  });

  it("collapses whitespace across newlines", () => {
    expect(htmlToLatexBody("<p>foo\n  \n  bar</p>")).toBe("foo bar");
  });
});

describe("htmlToLatexBody — robustness", () => {
  it("strips unknown wrappers but keeps their text", () => {
    const out = htmlToLatexBody(
      '<div class="x"><span style="color:red">hi</span></div>',
    );
    expect(out).toBe("hi");
  });

  it("ignores script and style content entirely", () => {
    const out = htmlToLatexBody(
      "<p>Before</p><script>alert(1)</script><style>p{}</style><p>After</p>",
    );
    expect(out).toContain("Before");
    expect(out).toContain("After");
    expect(out).not.toContain("alert");
    expect(out).not.toContain("p{}");
  });

  it("does not throw on an unclosed tag", () => {
    expect(() => htmlToLatexBody("<p>oops")).not.toThrow();
  });

  it("returns empty string for empty input", () => {
    expect(htmlToLatexBody("")).toBe("");
    expect(htmlToLatexBody("   ")).toBe("");
  });

  it("renders <br> as a line break and <hr> as a rule", () => {
    expect(htmlToLatexBody("<p>line1<br/>line2</p>")).toContain("\\\\");
    expect(htmlToLatexBody("<hr/>")).toContain("\\hrulefill");
  });
});

describe("htmlToLatex — full document", () => {
  it("produces a compilable \\documentclass{article} skeleton", () => {
    const tex = htmlToLatex("<h1>Resume</h1><p>Hello.</p>");
    expect(tex).toContain("\\documentclass[11pt,letterpaper]{article}");
    expect(tex).toContain("\\usepackage[margin=1in]{geometry}");
    expect(tex).toContain("\\usepackage{enumitem}");
    expect(tex).toContain("\\usepackage{hyperref}");
    expect(tex).toContain("\\begin{document}");
    expect(tex).toContain("\\section*{Resume}");
    expect(tex).toContain("Hello.");
    expect(tex).toContain("\\end{document}");
  });

  it("respects custom title, document class options, and margin", () => {
    const tex = htmlToLatex("<p>hi</p>", {
      title: "Jane's CV",
      documentClassOptions: "12pt,a4paper",
      margin: "0.75in",
    });
    expect(tex).toContain("\\documentclass[12pt,a4paper]{article}");
    expect(tex).toContain("\\usepackage[margin=0.75in]{geometry}");
    // Title is LaTeX-escaped inside pdftitle.
    expect(tex).toContain("pdftitle={Jane's CV}");
  });

  it("escapes special chars in the pdftitle metadata", () => {
    const tex = htmlToLatex("<p>x</p>", { title: "R&D 100%" });
    expect(tex).toContain("pdftitle={R\\&D 100\\%}");
  });
});

describe("htmlToLatexPreview", () => {
  it("returns source plus warnings for unsupported nodes", () => {
    const preview = htmlToLatexPreview("<p>Hello</p><img src='x.png' />");

    expect(preview.tex).toContain("\\documentclass");
    expect(preview.tex).toContain("Hello");
    expect(preview.warnings).toContain("Images are omitted from LaTeX source.");
  });
});
