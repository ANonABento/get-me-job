import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

const personas = [
  {
    slug: "entry-cs-grad",
    name: "Avery Chen",
    headline: "Computer Science Graduate",
    location: "Austin, TX",
    contact: "avery.chen@example.test | github.com/averychen | linkedin.com/in/averychen",
    purpose: "Avery is a new computer science graduate targeting junior frontend and full-stack roles. They want the app to turn internship and project work into credible entry-level applications. They care about jobs with mentorship, product engineering, and modern TypeScript stacks. Their resume is intentionally simple so parser tests can establish a clean baseline.",
    summary: "New computer science graduate with internship experience in React, Node.js, and data tooling.",
    experiences: [
      ["Software Engineering Intern", "Northstar Labs", "Austin, TX", "2025-05", "2025-08", "Built onboarding UI in React and added API contract tests for account setup flows."],
      ["Data Engineering Intern", "CivicByte Studio", "Remote", "2024-06", "2024-08", "Created Python scripts that normalized public records data for an internal analytics dashboard."],
    ],
    education: [["B.S. Computer Science", "Lone Star State University", "2022-09", "2026-05", "3.8"]],
    skills: ["TypeScript", "React", "Node.js", "Python", "SQLite", "Tailwind", "Vitest", "Git"],
    projects: [
      ["Campus Course Planner", "Degree planning app with prerequisite checks and schedule export.", ["TypeScript", "React", "SQLite"]],
      ["Study Buddy Bot", "Discord bot that schedules group reminders and flashcard reviews.", ["Node.js", "PostgreSQL"]],
      ["Trail Weather", "Mobile-friendly weather dashboard for local hiking routes.", ["React", "OpenWeather API"]],
    ],
    limitations: ["GPA may not parse depending on parser strategy."],
    jobLevel: "junior",
    jobTitles: ["Junior Frontend Engineer", "Associate Software Engineer", "Junior Full Stack Developer", "Frontend Platform Engineer I", "Software Engineer - New Grad"],
    tech: ["React", "TypeScript", "Node.js", "Tailwind", "Vitest"],
  },
  {
    slug: "mid-engineer",
    name: "Jordan Patel",
    headline: "Full Stack Software Engineer",
    location: "Denver, CO",
    contact: "jordan.patel@example.test | github.com/jordanpatel | linkedin.com/in/jordanpatel",
    purpose: "Jordan has four years of full-stack product engineering experience across two companies. They use the app to track mid-level roles that value steady delivery and pragmatic ownership. The fixture tests normal career progression, two job entries, and a traditional resume structure.",
    summary: "Full-stack engineer with four years of experience shipping SaaS workflows and internal platforms.",
    experiences: [
      ["Software Engineer II", "Brightforge Systems", "Denver, CO", "2023-03", "Present", "Owned billing workflow features, React component migration, and observability improvements."],
      ["Software Engineer", "Harbor Metrics", "Boulder, CO", "2021-07", "2023-02", "Built Node.js services for customer reporting and reduced dashboard load time by 34 percent."],
    ],
    education: [["B.S. Information Systems", "Rocky Mountain University", "2017-09", "2021-05", "3.6"]],
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL", "AWS", "Docker", "Playwright"],
    projects: [["Usage Insights CLI", "Command-line report exporter for product analytics teams.", ["Node.js", "PostgreSQL"]]],
    limitations: [],
    jobLevel: "mid",
    jobTitles: ["Full Stack Engineer", "Product Software Engineer", "Backend Engineer", "Frontend Engineer", "Platform Product Engineer"],
    tech: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    slug: "senior-ic",
    name: "Morgan Rivera",
    headline: "Staff Software Engineer",
    location: "Seattle, WA",
    contact: "morgan.rivera@example.test | github.com/morganrivera | linkedin.com/in/morganrivera",
    purpose: "Morgan is a senior individual contributor focused on architecture, reliability, and technical leadership without people management. They want the app to match staff-level roles and preserve evidence of scope. The resume spans two pages and includes multiple senior roles.",
    summary: "Staff engineer with 10 years of experience leading architecture for distributed product platforms.",
    experiences: [
      ["Staff Software Engineer", "Northpass Cloud", "Seattle, WA", "2022-01", "Present", "Led event-driven architecture for multi-region workflow automation and mentored six engineers."],
      ["Senior Software Engineer", "Bluejay Analytics", "Portland, OR", "2018-06", "2021-12", "Designed data ingestion services processing 45 million records per day with clear ownership boundaries."],
      ["Software Engineer", "Signal Yard", "Seattle, WA", "2014-08", "2018-05", "Shipped customer-facing APIs, incident tooling, and service reliability improvements."],
    ],
    education: [["M.S. Computer Science", "Cascadia Technical Institute", "2012-09", "2014-06", "3.9"], ["B.S. Mathematics", "Puget Sound College", "2008-09", "2012-05", "3.7"]],
    skills: ["TypeScript", "Go", "PostgreSQL", "Kafka", "Kubernetes", "AWS", "Architecture", "Mentorship"],
    projects: [["Reliability Playbook", "Operational guide and tooling templates adopted across five product teams.", ["Kubernetes", "OpenTelemetry"]]],
    limitations: ["Staff-level scope may be summarized differently by parser strategy."],
    jobLevel: "staff",
    jobTitles: ["Staff Software Engineer", "Principal Backend Engineer", "Staff Platform Engineer", "Senior Staff Engineer", "Technical Lead - Infrastructure"],
    tech: ["Go", "TypeScript", "Kafka", "Kubernetes", "PostgreSQL"],
  },
  {
    slug: "career-changer",
    name: "Samira Brooks",
    headline: "Software Engineer - Mechanical Engineering Background",
    location: "Pittsburgh, PA",
    contact: "samira.brooks@example.test | github.com/samirabrooks | linkedin.com/in/samirabrooks",
    purpose: "Samira moved from mechanical engineering into software through a certificate program and internal automation work. They use the app to reframe domain experience for software roles. The fixture checks educational pivots and prior non-software work.",
    summary: "Software engineer with a mechanical engineering background and strong automation experience.",
    experiences: [
      ["Software Developer", "Keystone Robotics", "Pittsburgh, PA", "2024-01", "Present", "Built Python and React tools for robot fleet diagnostics and manufacturing data review."],
      ["Mechanical Design Engineer", "Vector Pump Works", "Pittsburgh, PA", "2019-06", "2023-12", "Automated CAD validation workflows and collaborated with software teams on sensor dashboards."],
    ],
    education: [["Certificate, Software Engineering", "Three Rivers Coding Institute", "2023-01", "2023-12", "4.0"], ["B.S. Mechanical Engineering", "Allegheny State University", "2015-09", "2019-05", "3.5"]],
    skills: ["Python", "React", "TypeScript", "CAD Automation", "REST APIs", "SQL", "Testing", "Data Visualization"],
    projects: [["Maintenance Forecast", "Predictive maintenance dashboard for simulated pump telemetry.", ["Python", "React", "SQLite"]]],
    limitations: ["Prior mechanical role may be categorized as experience rather than adjacent domain history."],
    jobLevel: "mid",
    jobTitles: ["Software Engineer - Industrial Tools", "Full Stack Developer", "Automation Software Engineer", "Python Application Developer", "Manufacturing Systems Engineer"],
    tech: ["Python", "React", "TypeScript", "SQL", "Data Visualization"],
  },
  {
    slug: "multi-job-pm",
    name: "Taylor Kim",
    headline: "Product Manager",
    location: "New York, NY",
    contact: "taylor.kim@example.test | linkedin.com/in/taylorkim",
    purpose: "Taylor is a product manager with four short startup stints. They want the app to help position frequent moves as focused startup experience. The fixture tests repeated short-duration roles and product-oriented job targets.",
    summary: "Product manager with startup experience across onboarding, growth, marketplaces, and B2B workflows.",
    experiences: [
      ["Senior Product Manager", "Quartz Harbor", "New York, NY", "2024-01", "Present", "Led onboarding experiments that improved activated accounts by 18 percent."],
      ["Product Manager", "Mintwork", "Remote", "2022-07", "2023-12", "Owned roadmap for SMB invoicing and launched usage-based packaging."],
      ["Product Manager", "Pilot Orchard", "Brooklyn, NY", "2021-01", "2022-06", "Shipped marketplace trust features and vendor analytics."],
      ["Associate Product Manager", "Lumen Cart", "New York, NY", "2019-07", "2020-12", "Coordinated discovery and launch planning for mobile checkout improvements."],
    ],
    education: [["B.A. Economics", "Hudson Metropolitan College", "2015-09", "2019-05", "3.6"]],
    skills: ["Product Strategy", "Roadmapping", "SQL", "Experimentation", "Figma", "Analytics", "Stakeholder Management"],
    projects: [["Activation Metrics Pack", "Reusable dashboard template for funnel health and experiment readouts.", ["SQL", "Product Analytics"]]],
    limitations: ["Product skills may map to skills with category other."],
    jobLevel: "manager",
    jobTitles: ["Product Manager", "Senior Product Manager", "Growth Product Manager", "Platform Product Manager", "B2B Product Manager"],
    tech: ["SQL", "Figma", "Analytics", "Experimentation", "Roadmapping"],
  },
  {
    slug: "career-gap",
    name: "Casey Nguyen",
    headline: "Backend Software Engineer",
    location: "Minneapolis, MN",
    contact: "casey.nguyen@example.test | github.com/caseynguyen | linkedin.com/in/caseynguyen",
    purpose: "Casey has five years of backend experience with a two-year parental leave in the middle. They want the app to preserve the gap without treating it as an error. The fixture checks non-employment periods, current role parsing, and concise explanations.",
    summary: "Backend engineer experienced in APIs, queues, and data migrations, returning after a planned parental leave.",
    experiences: [
      ["Backend Engineer", "Prairie Ledger", "Minneapolis, MN", "2024-03", "Present", "Maintains payment reconciliation services and migration tooling for finance operations."],
      ["Planned Parental Leave", "Family Care", "Minneapolis, MN", "2022-02", "2024-02", "Planned career pause for parental leave and family care responsibilities."],
      ["Software Engineer", "Lakefront Health Tech", "Minneapolis, MN", "2018-08", "2022-01", "Built HIPAA-aware scheduling APIs and background job processing for care teams."],
    ],
    education: [["B.S. Software Engineering", "North Lakes University", "2014-09", "2018-05", "3.7"]],
    skills: ["Node.js", "PostgreSQL", "Redis", "Queues", "API Design", "TypeScript", "HIPAA Workflows"],
    projects: [["Returnship API Sandbox", "Sample service demonstrating idempotent webhook processing.", ["Node.js", "Redis"]]],
    limitations: ["Parental leave may parse as experience because it is intentionally represented as a dated resume entry."],
    jobLevel: "mid",
    jobTitles: ["Backend Engineer", "API Software Engineer", "Payments Platform Engineer", "Server-side TypeScript Engineer", "Data Migration Engineer"],
    tech: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "API Design"],
  },
  {
    slug: "non-english-spanish",
    name: "María García",
    headline: "Ingeniera de Software",
    location: "Montevideo, Uruguay",
    contact: "maria.garcia@example.test | github.com/mariagarcia | linkedin.com/in/mariagarcia",
    purpose: "María busca roles remotos de ingeniería frontend y full-stack para equipos de producto. Quiere que la app entienda fechas, títulos y descripciones en español latinoamericano. El fixture prueba acentos, ubicaciones regionales y texto no inglés.",
    summary: "Ingeniera de software con experiencia en productos web, accesibilidad y sistemas de diseño.",
    experiences: [
      ["Ingeniera Frontend", "Río Claro Digital", "Montevideo, Uruguay", "2022-04", "Present", "Desarrolló componentes accesibles en React y mejoró el rendimiento del portal de clientes."],
      ["Desarrolladora Web", "Nube Austral", "Remoto", "2020-03", "2022-03", "Construyó paneles internos con TypeScript, pruebas unitarias y documentación para soporte."],
    ],
    education: [["Licenciatura en Computación", "Universidad del Sur", "2016-03", "2020-12", "9.1/10"]],
    skills: ["TypeScript", "React", "Accesibilidad", "Pruebas unitarias", "Node.js", "CSS", "Diseño de sistemas"],
    projects: [["Biblioteca UI Inclusiva", "Sistema de componentes con guías de accesibilidad en español.", ["React", "TypeScript", "WCAG"]]],
    limitations: ["GPA-style score may not normalize across locales."],
    jobLevel: "mid",
    jobTitles: ["Ingeniera Frontend", "Desarrolladora Full Stack", "Frontend Engineer", "React Engineer", "Product Engineer"],
    tech: ["React", "TypeScript", "Node.js", "Accessibility", "CSS"],
  },
  {
    slug: "non-english-mandarin",
    name: "李伟",
    headline: "软件工程师",
    location: "上海, 中国",
    contact: "li.wei@example.test | github.com/liwei | linkedin.com/in/liwei",
    purpose: "李伟希望申请远程后端和平台工程岗位。这个样例用于验证中文姓名、中文公司描述、CJK 字符和日期字段的处理。目标岗位强调分布式系统、数据平台和云基础设施。",
    summary: "软件工程师，专注后端服务、数据平台和云端基础设施。",
    experiences: [
      ["后端软件工程师", "星桥科技", "上海, 中国", "2021-07", "Present", "负责订单服务、消息队列和监控平台，提升系统稳定性。"],
      ["软件开发实习生", "青云数据", "杭州, 中国", "2020-06", "2020-09", "开发数据清洗脚本和内部报表工具，支持运营团队。"],
    ],
    education: [["计算机科学学士", "东海理工大学", "2017-09", "2021-06", "3.7"]],
    skills: ["Java", "Go", "Kubernetes", "PostgreSQL", "Kafka", "云服务", "系统设计"],
    projects: [["实时库存平台", "基于事件流的库存同步系统，支持多仓库场景。", ["Go", "Kafka", "PostgreSQL"]]],
    limitations: ["Built-in PDF font may not visually render every CJK glyph even though fixture metadata contains Mandarin text."],
    jobLevel: "mid",
    jobTitles: ["Backend Software Engineer", "Platform Engineer", "Distributed Systems Engineer", "Data Platform Engineer", "Cloud Infrastructure Engineer"],
    tech: ["Go", "Java", "Kafka", "Kubernetes", "PostgreSQL"],
  },
  {
    slug: "heavy-formatting",
    name: "Riley Stone",
    headline: "Senior Frontend Engineer",
    location: "San Diego, CA",
    contact: "riley.stone@example.test | github.com/rileystone | linkedin.com/in/rileystone",
    purpose: "Riley has a visually dense resume with columns, skill tables, separators, and icon-like labels. They want the app to extract useful bank entries even when formatting is not linear. The PDF is intentionally structural rather than beautiful.",
    summary: "Senior frontend engineer specializing in design systems, editor tooling, and high-traffic web apps.",
    experiences: [
      ["Senior Frontend Engineer", "Canvas Harbor", "San Diego, CA", "2021-02", "Present", "Led design system migration, rich-text editor work, and accessibility audits across product surfaces."],
      ["Frontend Engineer", "Pixel Foundry", "Los Angeles, CA", "2018-05", "2021-01", "Built component libraries, dashboard shells, and performance budgets for client teams."],
    ],
    education: [["B.S. Human-Computer Interaction", "Pacific Design University", "2014-09", "2018-05", "3.8"]],
    skills: ["React", "TypeScript", "Design Systems", "Accessibility", "CSS", "Playwright", "ProseMirror", "Performance"],
    projects: [["Token Studio", "Design token documentation site with visual regression checks.", ["React", "Playwright", "CSS"]]],
    limitations: ["Column ordering may vary by parser text extraction strategy."],
    jobLevel: "senior",
    jobTitles: ["Senior Frontend Engineer", "Design Systems Engineer", "Frontend Infrastructure Engineer", "Editor Platform Engineer", "Accessibility Engineer"],
    tech: ["React", "TypeScript", "Design Systems", "Playwright", "Accessibility"],
    heavy: true,
  },
  {
    slug: "scanned-pdf",
    name: "Devon Moore",
    headline: "QA Automation Engineer",
    location: "Raleigh, NC",
    contact: "devon.moore@example.test | github.com/devonmoore | linkedin.com/in/devonmoore",
    purpose: "Devon has a scanned, flattened resume with no embedded text layer. They want the app to document whether OCR is wired correctly. This fixture should fail text-only parsing and pass only when OCR extraction is active.",
    summary: "QA automation engineer with experience in Playwright, release testing, and CI diagnostics.",
    experiences: [
      ["QA Automation Engineer", "Oakline Software", "Raleigh, NC", "2021-09", "Present", "Built Playwright suites, release smoke tests, and failure triage dashboards."],
      ["Test Analyst", "Carolina Claims Tech", "Raleigh, NC", "2019-06", "2021-08", "Created regression plans and automated API checks for claims workflows."],
    ],
    education: [["B.S. Information Technology", "Triangle State University", "2015-09", "2019-05", "3.5"]],
    skills: ["Playwright", "TypeScript", "API Testing", "CI", "Test Planning", "Accessibility Testing", "SQL"],
    projects: [["Flake Finder", "Test reporting utility that groups intermittent failures by signature.", ["TypeScript", "Playwright"]]],
    limitations: ["Requires OCR because resume.pdf is image-only with no embedded text layer."],
    jobLevel: "mid",
    jobTitles: ["QA Automation Engineer", "Software Development Engineer in Test", "Test Platform Engineer", "Automation Engineer", "Release Quality Engineer"],
    tech: ["Playwright", "TypeScript", "CI", "API Testing", "SQL"],
    scanned: true,
  },
];

function expectedFixture(persona) {
  return {
    personaSlug: persona.slug,
    expectedExperiences: persona.experiences.map(([title, company, location, startDate, endDate, summary]) => ({
      title,
      company,
      startDate,
      endDate,
      location,
      summary,
      category: "experience",
    })),
    expectedEducation: persona.education.map(([degree, school, startDate, endDate, gpa]) => ({
      degree,
      school,
      startDate,
      endDate,
      gpa,
    })),
    expectedSkills: persona.skills,
    expectedProjects: persona.projects.map(([name, description, technologies]) => ({
      name,
      description,
      technologies,
    })),
    expectedTotalEntryCount:
      persona.experiences.length + persona.education.length + persona.skills.length + persona.projects.length,
    knownLimitations: persona.limitations,
  };
}

function jobsFor(persona) {
  const companies = ["Plausible Product Co", "North Loop Systems", "Atlas Finch", "Copperline Labs", "Evergreen Workflow"];
  const locations = ["Remote - US", "Hybrid - New York, NY", "Remote - Americas", "Onsite - Austin, TX", "Hybrid - Seattle, WA"];
  const remoteTypes = ["remote", "hybrid", "remote", "onsite", "hybrid"];
  const baseSalary = {
    junior: 90000,
    mid: 125000,
    senior: 155000,
    staff: 185000,
    manager: 145000,
  }[persona.jobLevel] ?? 120000;

  return persona.jobTitles.map((title, index) => ({
    title,
    company: companies[index],
    location: locations[index],
    remoteType: remoteTypes[index],
    level: persona.jobLevel,
    salaryMin: baseSalary + index * 5000,
    salaryMax: baseSalary + 30000 + index * 6000,
    currency: "USD",
    techStack: persona.tech,
    summary: `Synthetic posting for ${title.toLowerCase()} work aligned with ${persona.name}'s background in ${persona.tech.slice(0, 3).join(", ")}.`,
    url: `https://${companies[index].toLowerCase().replaceAll(" ", "-")}.example.com/careers/${persona.slug}-${index + 1}`,
  }));
}

function resumeLines(persona) {
  return [
    persona.name,
    persona.headline,
    `${persona.location} | ${persona.contact}`,
    "",
    "SUMMARY",
    persona.summary,
    "",
    "EXPERIENCE",
    ...persona.experiences.flatMap(([title, company, location, startDate, endDate, summary]) => [
      `${title} - ${company} - ${location} - ${startDate} to ${endDate}`,
      summary,
    ]),
    "",
    "EDUCATION",
    ...persona.education.map(([degree, school, startDate, endDate, gpa]) => `${degree} - ${school} - ${startDate} to ${endDate} - GPA ${gpa}`),
    "",
    "SKILLS",
    persona.skills.join(", "),
    "",
    "PROJECTS",
    ...persona.projects.flatMap(([name, description, technologies]) => [
      `${name} - ${technologies.join(", ")}`,
      description,
    ]),
  ];
}

function utf16Hex(text) {
  const buffer = Buffer.alloc(2 + text.length * 2);
  buffer[0] = 0xfe;
  buffer[1] = 0xff;
  for (let index = 0; index < text.length; index += 1) {
    buffer.writeUInt16BE(text.charCodeAt(index), 2 + index * 2);
  }
  return buffer.toString("hex").toUpperCase();
}

function wrapLine(line, width) {
  if (line.length <= width) return [line];
  const words = line.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function objectsToPdf(objects) {
  const chunks = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(Buffer.from(`${index + 1} 0 obj\n`, "ascii"));
    chunks.push(Buffer.isBuffer(object) ? object : Buffer.from(object, "binary"));
    chunks.push(Buffer.from("\nendobj\n", "ascii"));
  }
  const xrefOffset = Buffer.concat(chunks).length;
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  for (let index = 1; index < offsets.length; index += 1) {
    xref.push(`${String(offsets[index]).padStart(10, "0")} 00000 n `);
  }
  xref.push("trailer", `<< /Size ${objects.length + 1} /Root 1 0 R >>`, "startxref", String(xrefOffset), "%%EOF");
  chunks.push(Buffer.from(`${xref.join("\n")}\n`, "ascii"));
  return Buffer.concat(chunks);
}

function textPdf(persona) {
  const allLines = resumeLines(persona);
  const pages = [];
  let current = [];
  for (const line of allLines) {
    const wrapped = line ? wrapLine(line, persona.heavy ? 46 : 88) : [""];
    for (const wrappedLine of wrapped) {
      current.push(wrappedLine);
      if (current.length >= (persona.heavy ? 42 : 48)) {
        pages.push(current);
        current = [];
      }
    }
  }
  if (current.length) pages.push(current);

  const objects = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(null);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const pageRefs = [];
  for (const [pageIndex, lines] of pages.entries()) {
    const operations = [];
    if (persona.heavy) {
      operations.push("0.90 0.90 0.90 RG 0.5 w");
      operations.push("300 40 m 300 760 l S");
      for (let y = 625; y >= 340; y -= 22) operations.push(`50 ${y} m 550 ${y} l S`);
      operations.push("0.12 0.32 0.55 RG 2 w 50 735 m 550 735 l S");
    }

    let y = 752;
    const leftLines = persona.heavy ? lines.filter((_, index) => index % 2 === 0) : lines;
    const rightLines = persona.heavy ? lines.filter((_, index) => index % 2 === 1) : [];
    const drawText = (lineSet, x) => {
      let localY = y;
      for (const line of lineSet) {
        const isTitle = line === persona.name;
        const isSection = /^[A-Z][A-Z ]+$/.test(line);
        const size = isTitle ? 18 : isSection ? 11 : 9;
        const gap = isTitle ? 20 : isSection ? 16 : 12;
        operations.push(`BT /F1 ${size} Tf 1 0 0 1 ${x} ${localY} Tm <${utf16Hex(line)}> Tj ET`);
        localY -= gap;
      }
    };
    drawText(leftLines, 50);
    if (persona.heavy) drawText(rightLines, 320);

    if (pageIndex > 0) {
      operations.push(`BT /F1 8 Tf 1 0 0 1 520 24 Tm <${utf16Hex(`Page ${pageIndex + 1}`)}> Tj ET`);
    }

    const content = operations.join("\n");
    const contentId = objects.length + 1;
    objects.push(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
    const pageId = objects.length + 1;
    pageRefs.push(`${pageId} 0 R`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
  }

  objects[1] = `<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.join(" ")}] >>`;
  return objectsToPdf(objects);
}

const font = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["10010", "10010", "10010", "11111", "00010", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
};

function drawTextBitmap(pixels, width, x, y, text, scale = 3) {
  let cursor = x;
  for (const raw of text.toUpperCase()) {
    if (raw === " ") {
      cursor += 4 * scale;
      continue;
    }
    const glyph = font[raw] ?? font["-"];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let column = 0; column < glyph[row].length; column += 1) {
        if (glyph[row][column] !== "1") continue;
        for (let sy = 0; sy < scale; sy += 1) {
          for (let sx = 0; sx < scale; sx += 1) {
            const px = cursor + column * scale + sx;
            const py = y + row * scale + sy;
            if (px >= 0 && px < width && py >= 0) pixels[py * width + px] = 0;
          }
        }
      }
    }
    cursor += 6 * scale;
  }
}

function scannedPdf(persona) {
  const width = 900;
  const height = 1200;
  const pixels = Buffer.alloc(width * height, 255);
  const lines = resumeLines(persona).map((line) => line.replace(/[^a-zA-Z0-9 .:/-]/g, ""));
  let y = 50;
  for (const line of lines.flatMap((line) => wrapLine(line, 48))) {
    drawTextBitmap(pixels, width, 55, y, line, line === persona.name ? 4 : 3);
    y += line === "" ? 22 : 34;
    if (y > height - 70) break;
  }

  const image = zlib.deflateSync(pixels);
  const imageStream = Buffer.concat([
    Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${image.length} >>\nstream\n`, "ascii"),
    image,
    Buffer.from("\nendstream", "ascii"),
  ]);
  const content = `q 540 0 0 720 36 36 cm /Im1 Do Q`;
  return objectsToPdf([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>`,
    imageStream,
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ]);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writePersona(persona) {
  const personaDir = path.join(root, persona.slug);
  fs.mkdirSync(path.join(personaDir, "target-jobs"), { recursive: true });

  fs.writeFileSync(path.join(personaDir, "resume.pdf"), persona.scanned ? scannedPdf(persona) : textPdf(persona));
  writeJson(path.join(personaDir, "expected.json"), expectedFixture(persona));
  fs.writeFileSync(
    path.join(personaDir, "persona.md"),
    `# ${persona.name}\n\n${persona.purpose}\n`
  );

  for (const [index, job] of jobsFor(persona).entries()) {
    writeJson(path.join(personaDir, "target-jobs", `job-${index + 1}.json`), job);
  }
}

for (const persona of personas) {
  writePersona(persona);
}

const table = personas
  .map((persona) => {
    const purposeLead = persona.purpose.split(".")[0];
    const punctuation = /[.!?。]$/.test(purposeLead) ? "" : ".";
    return `| \`${persona.slug}\` | ${persona.headline} | ${purposeLead}${punctuation} |`;
  })
  .join("\n");
fs.writeFileSync(
  path.join(root, "README.md"),
  `# Synthetic Persona Fixtures\n\nThese fixtures are fully synthetic and are intended for parser, bank, and opportunity E2E tests. Each persona folder contains a generated resume PDF, expected parser output, a short persona brief, and five matching synthetic job postings.\n\n| Persona | Resume Focus | Purpose |\n| --- | --- | --- |\n${table}\n\n## Schema\n\nExpected parser outputs are validated by \`tests/fixtures/persona-schema.ts\`. Target job JSON files use the same schema file so future fixture additions keep a stable contract.\n`
);
