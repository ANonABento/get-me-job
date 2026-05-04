# Resume Parsing Verification Results

Generated: 2026-05-04T07:45:57.984Z

## Score Table

| Persona | Status | Recall | Precision | Field accuracy | Composite | Known limitations applied |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| standard-software-engineer | failed-to-process | 0% | 0% | 0% | 0% | None |
| career-changer | failed-to-process | 0% | 0% | 0% | 0% | None |
| entry-level | failed-to-process | 0% | 0% | 0% | 0% | None |
| executive | failed-to-process | 0% | 0% | 0% | 0% | None |
| contractor | failed-to-process | 0% | 0% | 0% | 0% | None |
| career-gap | failed-to-process | 0% | 0% | 0% | 0% | None |
| non-english | failed-to-process | 0% | 0% | 0% | 0% | None |
| scanned-pdf | failed-to-process | 0% | 0% | 0% | 0% | None |
| academic | failed-to-process | 0% | 0% | 0% | 0% | None |
| designer | failed-to-process | 0% | 0% | 0% | 0% | None |

## Top 5 Failure Modes by Frequency

- **Fixture dependency missing** (10, high): Missing fixture dependency for standard-software-engineer: expected resume.pdf and expected.json Personas: standard-software-engineer, career-changer, entry-level, executive, contractor, career-gap, non-english, scanned-pdf, academic, designer.

## Per-Persona Narrative

### standard-software-engineer

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for standard-software-engineer: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### career-changer

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for career-changer: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### entry-level

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for entry-level: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### executive

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for executive: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### contractor

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for contractor: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### career-gap

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for career-gap: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### non-english

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for non-english: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### scanned-pdf

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for scanned-pdf: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### academic

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for academic: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

### designer

What worked: Could not run parser for this persona.

What did not: Missing fixture dependency for designer: expected resume.pdf and expected.json

Surprising findings: Harness calls extractTextFromFile, smartParseResume, and extractBankEntries directly to mirror upload parsing without writing to the application database.

## Followup Tasks

Bento task creation MCP was unavailable in this session, so these task titles are queued for creation:

- [pending-mcp] Parsing fix — Fixture dependency missing — Missing fixture dependency for standard-software-engineer: expected resume.pdf and expected.json (high)
