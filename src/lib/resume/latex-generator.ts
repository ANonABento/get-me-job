import type { TailoredResume } from "./generator";

export interface LatexTemplateConfig {
  id: string;
  name: string;
  description: string;
  layout: "single-column" | "two-column";
  defaultFontSize: 10 | 11 | 12;
  defaultMargin: string;
}

export interface LatexOptions {
  fontSize?: 10 | 11 | 12;
  margin?: string;
  sectionSpacing?: string;
  targetCharsPerLine?: number;
}

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
 * Escape LaTeX special characters in a string.
 */
export function escapeLatex(text: string): string {
  if (!text) return "";
  return text.replace(LATEX_SPECIAL_REGEX, (char) => LATEX_SPECIAL_CHARS[char]);
}

/**
 * Calculate margin needed to achieve approximately N characters per line.
 * Assumes standard LaTeX letter paper (8.5in wide) with Computer Modern font.
 * At 10pt, ~6.5 chars/cm; at 11pt, ~6 chars/cm; at 12pt, ~5.5 chars/cm.
 */
export function calculateMarginForCharsPerLine(
  targetChars: number,
  fontSize: 10 | 11 | 12
): string {
  const pageWidthInches = 8.5;
  const charsPerInch: Record<number, number> = {
    10: 16.5,
    11: 15.2,
    12: 14.0,
  };

  const cpi = charsPerInch[fontSize];
  const neededTextWidth = targetChars / cpi;
  const totalMargin = pageWidthInches - neededTextWidth;
  const singleMargin = Math.max(0.5, Math.min(1.5, totalMargin / 2));

  return `${singleMargin.toFixed(2)}in`;
}

export const LATEX_TEMPLATES: LatexTemplateConfig[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean, ATS-friendly single column layout",
    layout: "single-column",
    defaultFontSize: 11,
    defaultMargin: "0.5in",
  },
  {
    id: "two-column",
    name: "Two Column",
    description: "Sidebar layout with skills column",
    layout: "two-column",
    defaultFontSize: 10,
    defaultMargin: "0.5in",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean, content-focused layout",
    layout: "single-column",
    defaultFontSize: 11,
    defaultMargin: "0.75in",
  },
];

export function getLatexTemplate(id: string): LatexTemplateConfig {
  return LATEX_TEMPLATES.find((t) => t.id === id) || LATEX_TEMPLATES[0];
}

function renderModernTemplate(
  resume: TailoredResume,
  fontSize: 10 | 11 | 12,
  margin: string,
  sectionSpacing: string
): string {
  const { contact, summary, experiences, skills, education } = resume;

  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
  ]
    .filter(Boolean)
    .map((c) => escapeLatex(c!))
    .join(" \\textbar{} ");

  const experienceBlocks = experiences
    .map(
      (exp) => `
\\noindent\\textbf{${escapeLatex(exp.title)}} \\hfill ${escapeLatex(exp.dates)} \\\\
\\textit{${escapeLatex(exp.company)}}
\\begin{itemize}[leftmargin=*, nosep]
${exp.highlights.map((h) => `  \\item ${escapeLatex(h)}`).join("\n")}
\\end{itemize}
\\vspace{${sectionSpacing}}`
    )
    .join("\n");

  const educationBlocks = education
    .map(
      (edu) => `
\\noindent\\textbf{${escapeLatex(edu.degree)} in ${escapeLatex(edu.field)}} \\hfill ${escapeLatex(edu.date)} \\\\
\\textit{${escapeLatex(edu.institution)}}`
    )
    .join("\n\\vspace{2pt}\n");

  return `\\documentclass[${fontSize}pt, letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=${margin}]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\pagestyle{empty}
\\definecolor{accent}{HTML}{2563EB}

\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{${sectionSpacing}}{4pt}

\\begin{document}

\\begin{center}
{\\LARGE\\bfseries ${escapeLatex(contact.name)}} \\\\[4pt]
${contactLine}
\\end{center}

\\section*{Summary}
${escapeLatex(summary)}

\\section*{Experience}
${experienceBlocks}

\\section*{Skills}
${skills.map((s) => escapeLatex(s)).join(" \\textbullet{} ")}

${
  education.length > 0
    ? `\\section*{Education}
${educationBlocks}`
    : ""
}

\\end{document}
`;
}

function renderTwoColumnTemplate(
  resume: TailoredResume,
  fontSize: 10 | 11 | 12,
  margin: string,
  sectionSpacing: string
): string {
  const { contact, summary, experiences, skills, education } = resume;

  const contactItems = [
    contact.email ? `\\item ${escapeLatex(contact.email)}` : "",
    contact.phone ? `\\item ${escapeLatex(contact.phone)}` : "",
    contact.location ? `\\item ${escapeLatex(contact.location)}` : "",
    contact.linkedin ? `\\item ${escapeLatex(contact.linkedin)}` : "",
    contact.github ? `\\item ${escapeLatex(contact.github)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const experienceBlocks = experiences
    .map(
      (exp) => `
\\textbf{${escapeLatex(exp.title)}} \\hfill ${escapeLatex(exp.dates)} \\\\
\\textit{${escapeLatex(exp.company)}}
\\begin{itemize}[leftmargin=*, nosep]
${exp.highlights.map((h) => `  \\item ${escapeLatex(h)}`).join("\n")}
\\end{itemize}
\\vspace{${sectionSpacing}}`
    )
    .join("\n");

  const educationBlocks = education
    .map(
      (edu) =>
        `\\textbf{${escapeLatex(edu.degree)}} \\\\\n${escapeLatex(edu.field)} \\\\\n\\textit{${escapeLatex(edu.institution)}} \\\\\n${escapeLatex(edu.date)}`
    )
    .join("\n\\vspace{4pt}\n");

  return `\\documentclass[${fontSize}pt, letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=${margin}]{geometry}
\\usepackage{enumitem}
\\usepackage{paracol}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\pagestyle{empty}
\\definecolor{accent}{HTML}{059669}
\\definecolor{sidebar}{HTML}{F3F4F6}

\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{${sectionSpacing}}{4pt}

\\begin{document}

{\\LARGE\\bfseries ${escapeLatex(contact.name)}} \\\\[2pt]
\\textit{${escapeLatex(summary)}}

\\vspace{8pt}
\\columnratio{0.7}
\\begin{paracol}{2}

\\section*{Experience}
${experienceBlocks}

${
  education.length > 0
    ? `\\section*{Education}
${educationBlocks}`
    : ""
}

\\switchcolumn

\\section*{Contact}
\\begin{itemize}[leftmargin=*, nosep]
${contactItems}
\\end{itemize}

\\section*{Skills}
\\begin{itemize}[leftmargin=*, nosep]
${skills.map((s) => `\\item ${escapeLatex(s)}`).join("\n")}
\\end{itemize}

\\end{paracol}

\\end{document}
`;
}

function renderMinimalTemplate(
  resume: TailoredResume,
  fontSize: 10 | 11 | 12,
  margin: string,
  sectionSpacing: string
): string {
  const { contact, summary, experiences, skills, education } = resume;

  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
  ]
    .filter(Boolean)
    .map((c) => escapeLatex(c!))
    .join(" \\quad ");

  const experienceBlocks = experiences
    .map(
      (exp) => `
\\noindent\\textbf{${escapeLatex(exp.title)}} --- ${escapeLatex(exp.company)} \\hfill ${escapeLatex(exp.dates)}

\\begin{itemize}[leftmargin=1.5em, nosep]
${exp.highlights.map((h) => `  \\item ${escapeLatex(h)}`).join("\n")}
\\end{itemize}
\\vspace{${sectionSpacing}}`
    )
    .join("\n");

  const educationBlocks = education
    .map(
      (edu) =>
        `\\noindent\\textbf{${escapeLatex(edu.degree)} in ${escapeLatex(edu.field)}} --- ${escapeLatex(edu.institution)} \\hfill ${escapeLatex(edu.date)}`
    )
    .join("\n\n");

  return `\\documentclass[${fontSize}pt, letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=${margin}]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\begin{document}

{\\Large\\bfseries ${escapeLatex(contact.name)}} \\\\[3pt]
{\\small ${contactLine}}

\\bigskip
\\hrule
\\bigskip

${escapeLatex(summary)}

\\bigskip
{\\large\\bfseries Experience}
\\medskip

${experienceBlocks}

{\\large\\bfseries Skills}
\\medskip

\\noindent ${skills.map((s) => escapeLatex(s)).join(", ")}

${
  education.length > 0
    ? `\\bigskip
{\\large\\bfseries Education}
\\medskip

${educationBlocks}`
    : ""
}

\\end{document}
`;
}

/**
 * Generate a LaTeX resume from a TailoredResume.
 */
export function generateResumeLatex(
  resume: TailoredResume,
  templateId: string = "modern",
  options: LatexOptions = {}
): string {
  const template = getLatexTemplate(templateId);
  const fontSize = options.fontSize ?? template.defaultFontSize;
  const sectionSpacing = options.sectionSpacing ?? "6pt";

  let margin = options.margin ?? template.defaultMargin;
  if (options.targetCharsPerLine) {
    margin = calculateMarginForCharsPerLine(options.targetCharsPerLine, fontSize);
  }

  switch (template.id) {
    case "two-column":
      return renderTwoColumnTemplate(resume, fontSize, margin, sectionSpacing);
    case "minimal":
      return renderMinimalTemplate(resume, fontSize, margin, sectionSpacing);
    case "modern":
    default:
      return renderModernTemplate(resume, fontSize, margin, sectionSpacing);
  }
}
