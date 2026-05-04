# Resume Parsing Verification Results

Generated: 2026-05-04T07:54:22.235Z

## Score Table

| Persona | Status | Recall | Precision | Field accuracy | Composite | Known limitations applied |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| career-changer | processed | 0% | 0% | 0% | 0% | None |
| career-gap | processed | 0% | 0% | 0% | 0% | Parental leave may parse as experience because it is intentionally represented as a dated resume entry. |
| entry-cs-grad | processed | 0% | 0% | 0% | 0% | None |
| heavy-formatting | processed | 0% | 0% | 0% | 0% | None |
| mid-engineer | processed | 0% | 0% | 0% | 0% | None |
| multi-job-pm | processed | 0% | 0% | 0% | 0% | None |
| non-english-mandarin | processed | 0% | 0% | 0% | 0% | None |
| non-english-spanish | processed | 0% | 0% | 0% | 0% | None |
| scanned-pdf | processed | 0% | 0% | 0% | 0% | None |
| senior-ic | processed | 0% | 0% | 0% | 0% | None |

## Top 5 Failure Modes by Frequency

- **Parser limitation** (23, medium): Missed expected experience: Software Developer at Keystone Robotics Personas: career-changer, career-gap, entry-cs-grad, heavy-formatting, mid-engineer, multi-job-pm, non-english-mandarin, non-english-spanish, scanned-pdf, senior-ic.

## Per-Persona Narrative

### career-changer

What worked: 0/2 expected experience entries matched.

What did not: Missed expected experience: Software Developer at Keystone Robotics Missed expected experience: Mechanical Design Engineer at Vector Pump Works

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### career-gap

What worked: 0/3 expected experience entries matched.

What did not: Missed expected experience: Backend Engineer at Prairie Ledger Missed expected experience: Software Engineer at Lakefront Health Tech

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### entry-cs-grad

What worked: 0/2 expected experience entries matched.

What did not: Missed expected experience: Software Engineering Intern at Northstar Labs Missed expected experience: Data Engineering Intern at CivicByte Studio

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### heavy-formatting

What worked: 0/2 expected experience entries matched.

What did not: Missed expected experience: Senior Frontend Engineer at Canvas Harbor Missed expected experience: Frontend Engineer at Pixel Foundry

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### mid-engineer

What worked: 0/2 expected experience entries matched.

What did not: Missed expected experience: Software Engineer II at Brightforge Systems Missed expected experience: Software Engineer at Harbor Metrics

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### multi-job-pm

What worked: 0/4 expected experience entries matched.

What did not: Missed expected experience: Senior Product Manager at Quartz Harbor Missed expected experience: Product Manager at Mintwork Missed expected experience: Product Manager at Pilot Orchard Missed expected experience: Associate Product Manager at Lumen Cart

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### non-english-mandarin

What worked: 0/2 expected experience entries matched.

What did not: Missed expected experience: 后端软件工程师 at 星桥科技 Missed expected experience: 软件开发实习生 at 青云数据

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### non-english-spanish

What worked: 0/2 expected experience entries matched.

What did not: Missed expected experience: Ingeniera Frontend at Río Claro Digital Missed expected experience: Desarrolladora Web at Nube Austral

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

### scanned-pdf

What worked: 0/2 expected experience entries matched.

What did not: Missed expected experience: QA Automation Engineer at Oakline Software Missed expected experience: Test Analyst at Carolina Claims Tech

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. No work experience detected

### senior-ic

What worked: 0/3 expected experience entries matched.

What did not: Missed expected experience: Staff Software Engineer at Northpass Cloud Missed expected experience: Senior Software Engineer at Bluejay Analytics Missed expected experience: Software Engineer at Signal Yard

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database. Low confidence parse — resume may be poorly formatted or non-standard No work experience detected No education detected

## Followup Tasks

Bento task creation MCP was unavailable in this session, so these task titles are queued for creation:

- [pending-mcp] Parsing fix — Parser limitation — Missed expected experience: Software Developer at Keystone Robotics (medium)
