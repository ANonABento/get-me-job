import type { TestCase } from "./types.js";

export const TEST_CASES: TestCase[] = [
  {
    id: "tc-001",
    label: "Junior SWE → Frontend role at startup",
    candidateProfile: `
Software Engineer, 2 years experience
Skills: JavaScript, React, HTML/CSS, Git, Node.js basics
Experience: Built internal dashboard at small agency using React and REST APIs.
Reduced page load times by 30% through code splitting.
Education: BS Computer Science, State University 2022
Projects: Open-source todo app (500 GitHub stars), personal portfolio site
    `.trim(),
    jobDescription: `
Frontend Engineer at TechStartup
We're looking for a frontend engineer to build delightful user interfaces.
Requirements: React, TypeScript, Tailwind CSS, performance optimization experience.
Nice to have: GraphQL, testing with Jest/Playwright, design system experience.
You'll work closely with our design team to ship features used by 50K+ users.
    `.trim(),
  },
  {
    id: "tc-002",
    label: "Marketing Manager → Senior Marketing Director",
    candidateProfile: `
Marketing Manager, 5 years experience
Skills: Digital marketing, SEO/SEM, content strategy, analytics (Google Analytics, Mixpanel)
Experience: Managed $500K annual ad budget. Grew organic traffic 120% YoY.
Led team of 3 marketing coordinators. Launched 2 product campaigns.
Education: BA Marketing, University of Michigan 2019
    `.trim(),
    jobDescription: `
Senior Director of Marketing
Drive brand strategy and demand generation for our B2B SaaS platform.
Requirements: 7+ years marketing experience, team leadership (5+ reports), P&L ownership.
Experience with account-based marketing, Salesforce/HubSpot, and $2M+ budget management.
Must have: history of scaling pipeline from $10M to $50M ARR.
    `.trim(),
  },
  {
    id: "tc-003",
    label: "Data Analyst → Data Scientist at tech company",
    candidateProfile: `
Data Analyst, 3 years experience
Skills: SQL, Python (pandas, matplotlib), Excel, Tableau, basic statistics
Experience: Built executive dashboards for e-commerce metrics. Ran A/B tests for checkout flow,
resulting in 8% conversion lift. Created automated weekly reports saving 10 hours/week.
Education: BS Statistics, UCLA 2021
    `.trim(),
    jobDescription: `
Data Scientist
Use machine learning to drive product decisions at scale.
Requirements: Python (scikit-learn, PyTorch/TensorFlow), statistical modeling, A/B testing at scale.
Experience with recommendation systems, NLP, or forecasting models preferred.
Must be comfortable with ambiguity and defining your own research questions.
    `.trim(),
  },
  {
    id: "tc-004",
    label: "Product Manager → Senior PM at FAANG",
    candidateProfile: `
Product Manager, 4 years experience
Skills: Product roadmapping, user research, agile/scrum, data analysis, stakeholder management
Experience: Launched mobile app feature used by 200K users. Improved user retention by 15%
through onboarding redesign. Led cross-functional team of 8 (eng, design, data).
Education: MBA, Georgetown University 2020; BS Engineering 2018
    `.trim(),
    jobDescription: `
Senior Product Manager, Growth
Drive user acquisition and retention for our consumer platform (10M+ users).
Requirements: 5+ years PM experience, growth product background, strong analytical skills.
Experience with experimentation platforms, funnel optimization, monetization.
You'll define strategy, write PRDs, and partner with engineering leads.
    `.trim(),
  },
  {
    id: "tc-005",
    label: "UX Designer → Lead Designer at agency",
    candidateProfile: `
UX/UI Designer, 3 years experience
Skills: Figma, user research, wireframing, prototyping, design systems, accessibility (WCAG)
Experience: Redesigned onboarding flow reducing drop-off by 25%. Built design system with 60+ components.
Led user interviews and usability testing sessions for 3 products.
Education: BFA Interaction Design, RISD 2021
    `.trim(),
    jobDescription: `
Lead UX Designer
Own design for our suite of enterprise SaaS products.
Requirements: 5+ years UX experience, strong portfolio, experience leading junior designers.
Expertise in complex data visualization, enterprise workflows, and design ops.
Must be able to present to C-suite stakeholders and champion user-centered design.
    `.trim(),
  },
  {
    id: "tc-006",
    label: "Sales Rep → Account Executive at SaaS",
    candidateProfile: `
Sales Development Representative, 2 years experience
Skills: Cold outreach, CRM (Salesforce), discovery calls, pipeline management, objection handling
Experience: Generated $2M in qualified pipeline. Booked 15 meetings/month consistently.
Top SDR for Q3 2024. Promoted from BDR after 6 months.
Education: BA Business Administration, Ohio State 2022
    `.trim(),
    jobDescription: `
Account Executive, Mid-Market
Close new business and expand accounts in the $50K-$200K ACV range.
Requirements: 3+ years closing experience, SaaS sales background, strong discovery skills.
Quota: $1.2M ARR. You'll own full sales cycle from prospecting to close.
Nice to have: MEDDIC/MEDDPICC, experience selling to VP/C-suite buyers.
    `.trim(),
  },
  {
    id: "tc-007",
    label: "Recent CS grad → Backend Engineer",
    candidateProfile: `
Computer Science graduate, May 2025
Skills: Python, Java, Go (coursework), SQL, REST APIs, Docker basics, AWS (certified Cloud Practitioner)
Experience: Internship at fintech startup - built payment webhook processor handling 1K events/day.
Capstone project: distributed task queue in Go with Redis.
Education: BS Computer Science, Carnegie Mellon University 2025, GPA 3.7
    `.trim(),
    jobDescription: `
Backend Software Engineer
Build scalable services for our payments infrastructure (processing $1B+ annually).
Requirements: Proficiency in Go or Python, experience with distributed systems, PostgreSQL, message queues.
Experience with high-throughput event processing and financial systems a plus.
We value pragmatism, clean code, and engineers who own their services end-to-end.
    `.trim(),
  },
  {
    id: "tc-008",
    label: "Financial Analyst → Investment Banking Analyst",
    candidateProfile: `
Financial Analyst, 2 years at corporate finance department
Skills: Financial modeling (DCF, LBO), Excel, PowerPoint, Bloomberg terminal, GAAP accounting
Experience: Built 3-statement model for $50M acquisition analysis. Prepared board materials
for quarterly earnings. Supported FP&A for $200M revenue business unit.
Education: BS Finance, Wharton School 2023
    `.trim(),
    jobDescription: `
Investment Banking Analyst, M&A
Support senior bankers on live deals including M&A advisory and capital raises.
Requirements: Strong financial modeling (merger model, LBO, DCF), excellent presentation skills.
Experience: 1-2 years in finance/accounting or top academic background.
Expect 70-80 hour weeks on live transactions; CFA Level 1 preferred.
    `.trim(),
  },
  {
    id: "tc-009",
    label: "HR Generalist → HR Business Partner",
    candidateProfile: `
HR Generalist, 3 years experience
Skills: HRIS (Workday), employee relations, recruiting coordination, onboarding, benefits administration
Experience: Supported 150-person organization. Reduced time-to-hire by 20% through process improvements.
Resolved 30+ employee relations cases annually. Led open enrollment for 200 employees.
Education: BA Psychology, University of Washington 2022; SHRM-CP certified
    `.trim(),
    jobDescription: `
Senior HR Business Partner
Partner with engineering and product leaders (300+ employees) to drive people strategy.
Requirements: 5+ years HR experience, HRBP background, strong business acumen.
Experience with workforce planning, performance management, and organizational design.
Must be comfortable in fast-paced tech environment and influencing without authority.
    `.trim(),
  },
  {
    id: "tc-010",
    label: "DevOps Engineer → Site Reliability Engineer",
    candidateProfile: `
DevOps Engineer, 3 years experience
Skills: AWS (EC2, ECS, RDS, S3), Terraform, Docker, Kubernetes basics, CI/CD (GitHub Actions, Jenkins),
Python scripting, monitoring (Datadog, PagerDuty)
Experience: Migrated monolith to microservices on ECS, reducing deployment time from 2 hours to 15 minutes.
Maintained 99.5% uptime for production services. Built on-call runbooks for 15 incident types.
Education: BS Computer Engineering, Georgia Tech 2022
    `.trim(),
    jobDescription: `
Site Reliability Engineer
Ensure reliability, scalability, and performance of our infrastructure serving 5M+ users.
Requirements: Strong Kubernetes, Go or Python, distributed systems troubleshooting.
Experience with SLOs/SLIs/error budgets, chaos engineering, and capacity planning.
You'll own reliability of critical systems and drive engineering culture around observability.
    `.trim(),
  },
];
