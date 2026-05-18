import type {
  BankEntry,
  BankCategory,
  ContactInfo,
  GroupedBankEntries,
  JobDescription,
  Profile,
  Skill,
} from "@/types";
import type { PromptQaFixture, PromptQaMockOutput } from "./types";

const createdAt = "2026-01-15T00:00:00.000Z";

function entry(
  id: string,
  category: BankCategory,
  content: Record<string, unknown>,
): BankEntry {
  return {
    id,
    userId: "prompt-qa",
    category,
    content,
    confidenceScore: 0.95,
    createdAt,
  };
}

function emptyBank(): GroupedBankEntries {
  return {
    experience: [],
    skill: [],
    project: [],
    education: [],
    paragraph: [],
    bullet: [],
    achievement: [],
    certification: [],
    hackathon: [],
  };
}

function skills(names: string[]): Skill[] {
  return names.map((name, index) => ({
    id: `skill-${index}`,
    name,
    category: "technical",
    proficiency: "intermediate",
  }));
}

function job(
  id: string,
  title: string,
  company: string,
  keywords: string[],
  description: string,
): JobDescription {
  return {
    id,
    title,
    company,
    type: "internship",
    description,
    requirements: keywords,
    responsibilities: ["Contribute to shipped student-facing product work"],
    keywords,
    status: "saved",
    createdAt,
  };
}

function baseOutputs(
  name: string,
  role: string,
  company: string,
  evidence: string[],
  supportedTerms: string[],
): PromptQaMockOutput {
  const proof = evidence.slice(0, 3).join(", ");
  const fit = supportedTerms.slice(0, 3).join(", ");
  return {
    resume_generation: `${name} is an early-career candidate for the ${role} internship at ${company}. Uses evidence from ${proof}. Connects supported fit terms ${fit} honestly, with concise bullets and no unsupported senior claims.`,
    tailor_autofix: `Rewrite summary and two bullets to emphasize ${proof} and supported fit terms ${fit}. Add only supported keywords, then suggest one next step: quantify the strongest project result before applying.`,
    cover_letter: `Dear ${company}, I am excited about the ${role} internship because my work with ${proof} matches ${fit}. I would bring curiosity, follow-through, and specific student project evidence. Thank you for your time.\n\nSincerely,\n${name}`,
    email: `{"subject":"${role} internship at ${company}","body":"Hi, I am ${name}. I noticed the ${role} internship and my background in ${proof} and ${fit} seems relevant. Would you be open to sharing the best next step for a student applicant? Thanks, ${name}"}`,
    interview: `Ask about a student project using ${proof} for a ${role} internship. Tie follow-up to ${fit}. Feedback: strong specific example; improve by naming the situation, action, result, and one metric in a tighter STAR answer.`,
  };
}

function fixture(args: {
  id: string;
  label: string;
  scenario: string;
  contact: ContactInfo;
  bankEntries: GroupedBankEntries;
  profile: Profile;
  job: JobDescription;
  expectedEvidence: string[];
  supportedJobTerms: string[];
  forbiddenClaims?: string[];
  mockOutputs?: Partial<PromptQaMockOutput>;
}): PromptQaFixture {
  const outputs = {
    ...baseOutputs(
      args.contact.name,
      args.job.title,
      args.job.company,
      args.expectedEvidence,
      args.supportedJobTerms,
    ),
    ...args.mockOutputs,
  };

  const resume = {
    contact: args.contact,
    summary: args.profile.summary || "",
    experiences: args.bankEntries.experience.map((item) => ({
      company: String(item.content.company || ""),
      title: String(item.content.title || ""),
      dates: "2025",
      highlights: Array.isArray(item.content.highlights)
        ? item.content.highlights.map(String)
        : [],
    })),
    skills: args.profile.skills.map((skill) => skill.name),
    education: args.bankEntries.education.map((item) => ({
      institution: String(item.content.institution || ""),
      degree: String(item.content.degree || ""),
      field: String(item.content.field || ""),
      date: String(item.content.endDate || ""),
    })),
  };

  return {
    ...args,
    forbiddenClaims: args.forbiddenClaims || [],
    resume,
    coverLetterInput: {
      jobDescription: args.job.description,
      jobTitle: args.job.title,
      company: args.job.company,
      bankEntries: args.bankEntries,
      userName: args.contact.name,
    },
    emailContext: {
      targetCompany: args.job.company,
      applyingRole: args.job.title,
      hookNote: `Student applicant with evidence in ${args.expectedEvidence[0]}`,
    },
    interviewAnswer: `I worked on ${args.expectedEvidence[0]} and learned to explain tradeoffs clearly.`,
    mockOutputs: outputs,
  };
}

const frontendBank = emptyBank();
frontendBank.project = [
  entry("fe-project", "project", {
    name: "Campus Pantry Finder",
    description: "React app helping students find free food resources",
    technologies: ["React", "TypeScript", "accessibility testing"],
    highlights: ["Improved mobile search flow after usability feedback"],
  }),
];
frontendBank.skill = [
  entry("react", "skill", { name: "React" }),
  entry("ts", "skill", { name: "TypeScript" }),
  entry("a11y", "skill", { name: "accessibility testing" }),
];
frontendBank.education = [
  entry("edu-fe", "education", {
    institution: "State University",
    degree: "BS",
    field: "Computer Science",
    endDate: "2027",
  }),
];

const retailBank = emptyBank();
retailBank.experience = [
  entry("retail", "experience", {
    company: "Market Basket",
    title: "Retail Associate",
    highlights: ["Resolved customer issues and trained two new associates"],
  }),
];
retailBank.project = [
  entry("inventory", "project", {
    name: "Inventory Tracker",
    description: "Intro Python project for tracking shelf counts",
    technologies: ["Python", "CSV"],
  }),
];
retailBank.skill = [entry("python", "skill", { name: "Python" })];

const keywordBank = emptyBank();
keywordBank.project = [
  entry("todo", "project", {
    name: "Task Board",
    description: "Small JavaScript app with local storage",
    technologies: ["JavaScript", "HTML", "CSS"],
  }),
];
keywordBank.skill = [entry("js", "skill", { name: "JavaScript" })];

const dataBank = emptyBank();
dataBank.project = [
  entry("data", "project", {
    name: "Transit Delay Notebook",
    description: "Analyzed bus delay CSVs and presented charts",
    technologies: ["Python", "pandas", "Jupyter"],
  }),
];
dataBank.skill = [
  entry("pandas", "skill", { name: "pandas" }),
  entry("sql", "skill", { name: "SQL" }),
];

const thinBank = emptyBank();
thinBank.project = [
  entry("weather", "project", {
    name: "Weather Widget",
    description: "One React project consuming a public weather API",
    technologies: ["React", "API"],
  }),
];

const unsupportedBank = emptyBank();
unsupportedBank.project = [
  entry("landing", "project", {
    name: "Club Landing Page",
    description: "Static site for a student club",
    technologies: ["HTML", "CSS"],
  }),
];
unsupportedBank.skill = [entry("html", "skill", { name: "HTML" })];

export const PROMPT_QA_FIXTURES: PromptQaFixture[] = [
  fixture({
    id: "strong-frontend-student",
    label: "Strong frontend student",
    scenario:
      "Frontend intern with specific project evidence and supported skills.",
    contact: { name: "Ava Chen", email: "ava@example.com" },
    bankEntries: frontendBank,
    profile: {
      id: "ava",
      contact: { name: "Ava Chen", email: "ava@example.com" },
      summary: "CS student focused on accessible React interfaces.",
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      skills: skills(["React", "TypeScript", "accessibility testing"]),
    },
    job: job(
      "job-fe",
      "Frontend Engineer Intern",
      "BrightApps",
      ["React", "TypeScript", "accessibility"],
      "Build accessible React interfaces with TypeScript for student users.",
    ),
    expectedEvidence: ["Campus Pantry Finder", "React", "TypeScript"],
    supportedJobTerms: ["React", "TypeScript", "accessibility"],
    forbiddenClaims: ["senior engineer", "AWS", "Kubernetes"],
  }),
  fixture({
    id: "weak-retail-to-tech-student",
    label: "Weak retail-to-tech student",
    scenario:
      "Retail student needs honest bridge language and practical next steps.",
    contact: { name: "Maya Brooks", email: "maya@example.com" },
    bankEntries: retailBank,
    profile: {
      id: "maya",
      contact: { name: "Maya Brooks", email: "maya@example.com" },
      summary: "Retail associate learning software through small projects.",
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      skills: skills(["Python"]),
    },
    job: job(
      "job-support",
      "IT Support Intern",
      "Campus Tech",
      ["troubleshooting", "Python", "communication"],
      "Support students, document issues, and automate small support tasks.",
    ),
    expectedEvidence: ["Retail Associate", "Inventory Tracker", "Python"],
    supportedJobTerms: ["Python", "communication", "support"],
    forbiddenClaims: ["software engineer", "production systems"],
  }),
  fixture({
    id: "keyword-stuffed-resume",
    label: "Keyword-stuffed resume",
    scenario: "Student has noisy keywords but limited evidence.",
    contact: { name: "Leo Patel", email: "leo@example.com" },
    bankEntries: keywordBank,
    profile: {
      id: "leo",
      contact: { name: "Leo Patel", email: "leo@example.com" },
      summary: "Student experimenting with web basics.",
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      skills: skills(["JavaScript"]),
    },
    job: job(
      "job-fullstack",
      "Software Engineering Intern",
      "Northstar",
      ["JavaScript", "testing", "APIs"],
      "Internship for students who can explain web fundamentals and testing.",
    ),
    expectedEvidence: ["Task Board", "JavaScript", "local storage"],
    supportedJobTerms: ["JavaScript", "testing", "APIs"],
    forbiddenClaims: ["microservices", "machine learning", "Kubernetes"],
  }),
  fixture({
    id: "unrelated-data-role",
    label: "Unrelated data role",
    scenario: "Data-oriented student targeting a frontend internship.",
    contact: { name: "Nora Kim", email: "nora@example.com" },
    bankEntries: dataBank,
    profile: {
      id: "nora",
      contact: { name: "Nora Kim", email: "nora@example.com" },
      summary: "Student interested in data analysis and clear reporting.",
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      skills: skills(["Python", "pandas", "SQL"]),
    },
    job: job(
      "job-ui",
      "Frontend Intern",
      "Designly",
      ["HTML", "CSS", "React"],
      "Help prototype customer-facing UI screens with a frontend team.",
    ),
    expectedEvidence: ["Transit Delay Notebook", "pandas", "Jupyter"],
    supportedJobTerms: ["HTML", "CSS", "prototype"],
    forbiddenClaims: ["React expert", "designer", "production frontend"],
  }),
  fixture({
    id: "thin-profile-one-project",
    label: "Thin profile with one project",
    scenario:
      "Sparse student profile should stay concrete and suggest filling gaps.",
    contact: { name: "Sam Rivera", email: "sam@example.com" },
    bankEntries: thinBank,
    profile: {
      id: "sam",
      contact: { name: "Sam Rivera", email: "sam@example.com" },
      summary: "Student with one React API project.",
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      skills: skills(["React"]),
    },
    job: job(
      "job-web",
      "Web Development Intern",
      "Civic Labs",
      ["React", "API", "documentation"],
      "Maintain small web features and document implementation choices.",
    ),
    expectedEvidence: ["Weather Widget", "React", "public weather API"],
    supportedJobTerms: ["React", "API", "documentation"],
    forbiddenClaims: ["multiple internships", "team lead"],
  }),
  fixture({
    id: "unsupported-keyword-request",
    label: "Unsupported keyword request",
    scenario: "Job asks for keywords absent from the student's evidence.",
    contact: { name: "Iris Morgan", email: "iris@example.com" },
    bankEntries: unsupportedBank,
    profile: {
      id: "iris",
      contact: { name: "Iris Morgan", email: "iris@example.com" },
      summary: "Student with static website experience.",
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      skills: skills(["HTML", "CSS"]),
    },
    job: job(
      "job-platform",
      "Platform Engineering Intern",
      "CloudForge",
      ["Kubernetes", "AWS", "Terraform"],
      "Assist with cloud infrastructure automation and deployment tooling.",
    ),
    expectedEvidence: ["Club Landing Page", "HTML", "CSS"],
    supportedJobTerms: ["HTML", "CSS"],
    forbiddenClaims: ["Kubernetes", "AWS", "Terraform", "cloud infrastructure"],
    mockOutputs: {
      tailor_autofix:
        "Rewrite the resume to say Iris built Kubernetes clusters on AWS with Terraform. Add a next step to discuss deployments.",
    },
  }),
];
