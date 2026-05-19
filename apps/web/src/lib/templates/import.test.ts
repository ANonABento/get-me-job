import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/parser/pdf", () => ({
  extractTextFromFile: vi.fn(async () => ""),
}));

import { extractTemplateFromFile, getTemplateSourceType } from "./import";

const latexResume = String.raw`
\documentclass[11pt,letterpaper]{article}
\usepackage[margin=0.65in,top=0.5in,bottom=0.7in]{geometry}
\usepackage{helvet}
\usepackage{xcolor}
\definecolor{accent}{HTML}{2F5597}
\usepackage{titlesec}
\titleformat{\section}{\large\bfseries\color{accent}}{}{0em}{}[\titlerule]
\renewcommand{\labelitemi}{--}
\linespread{1.08}
\begin{document}
\begin{center}
{\Huge Jane Candidate}\\
jane@example.com
\end{center}
\section*{Experience}
\begin{itemize}
\item Built accessible account workflows.
\item Led platform reliability work.
\end{itemize}
\section*{Skills}
TypeScript, React, SQL
\end{document}
`;

describe("template import", () => {
  it("detects supported template sources and rejects unsupported files", () => {
    expect(getTemplateSourceType("resume.pdf", "application/pdf")).toBe("pdf");
    expect(
      getTemplateSourceType(
        "resume.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe("docx");
    expect(getTemplateSourceType("resume.tex", "text/x-tex")).toBe("tex");
    expect(getTemplateSourceType("resume.tex", "text/plain")).toBe("tex");
    expect(getTemplateSourceType("notes.txt", "text/plain")).toBeNull();
    expect(getTemplateSourceType("resume.html", "text/html")).toBeNull();
    expect(getTemplateSourceType("resume.md", "text/markdown")).toBeNull();
  });

  it("extracts LaTeX margins, font, color, section, bullet, page, and header signals", async () => {
    const result = await extractTemplateFromFile({
      filename: "resume.tex",
      mimeType: "text/x-tex",
      llmClient: null,
      buffer: Buffer.from(latexResume),
    });

    expect(result.template.source?.type).toBe("tex");
    expect(result.template.pageSize).toBe("letter");
    expect(result.template.margins).toMatchObject({
      top: "0.5in",
      bottom: "0.7in",
      left: "0.65in",
      right: "0.65in",
    });
    expect(result.template.styles).toMatchObject({
      fontFamily: "Helvetica, Arial, sans-serif",
      fontSize: "11pt",
      headerSize: "24pt",
      sectionHeaderSize: "14pt",
      lineHeight: "1.08",
      accentColor: "#2F5597",
      headerStyle: "centered",
      bulletStyle: "dash",
      sectionDivider: "line",
    });
    expect(result.sectionsFound).toEqual(
      expect.arrayContaining(["experience", "skills"]),
    );
    expect(result.confidence).toBe("high");
  });

  it("extracts DOCX page, margin, font, size, color, layout, header, bullet, and section signals", async () => {
    const docx = zipEntries({
      "word/document.xml": [
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
        "<w:body>",
        '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>Jane Candidate</w:t></w:r></w:p>',
        '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:bottom="720" w:left="1080" w:right="1080"/><w:cols w:num="2"/></w:sectPr>',
        "</w:body>",
        "</w:document>",
      ].join(""),
      "word/styles.xml": [
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
        '<w:style><w:rPr><w:rFonts w:ascii="Aptos"/><w:color w:val="1F4E79"/><w:sz w:val="22"/></w:rPr></w:style>',
        '<w:style><w:rPr><w:sz w:val="22"/></w:rPr></w:style>',
        '<w:style><w:rPr><w:sz w:val="32"/></w:rPr></w:style>',
        '<w:style><w:pPr><w:pBdr><w:bottom w:val="single"/></w:pBdr></w:pPr></w:style>',
        "</w:styles>",
      ].join(""),
      "word/numbering.xml": [
        '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
        '<w:abstractNum><w:lvl><w:lvlText w:val="--"/></w:lvl></w:abstractNum>',
        "</w:numbering>",
      ].join(""),
    });

    const result = await extractTemplateFromFile({
      filename: "resume.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      llmClient: null,
      buffer: docx,
    });

    expect(result.template.source?.type).toBe("docx");
    expect(result.template.pageSize).toBe("letter");
    expect(result.template.margins).toMatchObject({
      top: "0.5in",
      bottom: "0.5in",
      left: "0.75in",
      right: "0.75in",
    });
    expect(result.template.styles).toMatchObject({
      fontFamily: '"Aptos", Arial, sans-serif',
      fontSize: "11pt",
      headerSize: "16pt",
      sectionHeaderSize: "16pt",
      accentColor: "#1F4E79",
      layout: "two-column",
      headerStyle: "centered",
      bulletStyle: "dash",
      sectionDivider: "line",
    });
  });

  it("treats sparse DOCX style XML as usable Word defaults", async () => {
    const docx = zipEntries({
      "word/document.xml": [
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
        "<w:body>",
        "<w:p><w:r><w:t>Jane Candidate</w:t></w:r></w:p>",
        "<w:p><w:r><w:t>jane@example.com</w:t></w:r></w:p>",
        "<w:p><w:r><w:t>Experience</w:t></w:r></w:p>",
        "<w:p><w:r><w:t>Built reusable document templates from DOCX resumes.</w:t></w:r></w:p>",
        "<w:p><w:r><w:t>Skills</w:t></w:r></w:p>",
        "<w:p><w:r><w:t>TypeScript, React, PDF, LaTeX</w:t></w:r></w:p>",
        "</w:body>",
        "</w:document>",
      ].join(""),
    });

    const result = await extractTemplateFromFile({
      filename: "resume.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      llmClient: null,
      buffer: docx,
    });

    expect(result.template.styles).toMatchObject({
      fontFamily: "Aptos, Calibri, Arial, sans-serif",
      fontSize: "11pt",
      lineHeight: "1.35",
      layout: "single-column",
      bulletStyle: "disc",
      sectionDivider: "line",
    });
    expect(result.confidence).toBe("high");
    expect(result.warnings.join(" ")).not.toMatch(/Used defaults/i);
  });

  it("returns usable defaults with warnings when PDF extraction is weak", async () => {
    const result = await extractTemplateFromFile({
      filename: "resume.pdf",
      mimeType: "application/pdf",
      llmClient: null,
      buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"),
    });

    expect(result.template.source?.type).toBe("pdf");
    expect(result.template.styles.fontFamily).toContain("Helvetica");
    expect(result.confidence).toBe("low");
    expect(result.warnings.join(" ")).toMatch(/default/i);
  });
});

function zipEntries(entries: Record<string, string>): Buffer {
  return Buffer.concat(
    Object.entries(entries).map(([name, content]) => {
      const nameBuffer = Buffer.from(name);
      const contentBuffer = Buffer.from(content);
      const header = Buffer.alloc(30);
      header.writeUInt32LE(0x04034b50, 0);
      header.writeUInt16LE(0, 8);
      header.writeUInt32LE(contentBuffer.length, 18);
      header.writeUInt32LE(contentBuffer.length, 22);
      header.writeUInt16LE(nameBuffer.length, 26);
      header.writeUInt16LE(0, 28);
      return Buffer.concat([header, nameBuffer, contentBuffer]);
    }),
  );
}
