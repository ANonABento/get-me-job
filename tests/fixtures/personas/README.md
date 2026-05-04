# Synthetic Persona Fixtures

These fixtures are fully synthetic and are intended for parser, bank, and opportunity E2E tests. Each persona folder contains a generated resume PDF, expected parser output, a short persona brief, and five matching synthetic job postings.

| Persona | Resume Focus | Purpose |
| --- | --- | --- |
| `entry-cs-grad` | Computer Science Graduate | Avery is a new computer science graduate targeting junior frontend and full-stack roles. |
| `mid-engineer` | Full Stack Software Engineer | Jordan has four years of full-stack product engineering experience across two companies. |
| `senior-ic` | Staff Software Engineer | Morgan is a senior individual contributor focused on architecture, reliability, and technical leadership without people management. |
| `career-changer` | Software Engineer - Mechanical Engineering Background | Samira moved from mechanical engineering into software through a certificate program and internal automation work. |
| `multi-job-pm` | Product Manager | Taylor is a product manager with four short startup stints. |
| `career-gap` | Backend Software Engineer | Casey has five years of backend experience with a two-year parental leave in the middle. |
| `non-english-spanish` | Ingeniera de Software | María busca roles remotos de ingeniería frontend y full-stack para equipos de producto. |
| `non-english-mandarin` | 软件工程师 | 李伟希望申请远程后端和平台工程岗位。这个样例用于验证中文姓名、中文公司描述、CJK 字符和日期字段的处理。目标岗位强调分布式系统、数据平台和云基础设施。 |
| `heavy-formatting` | Senior Frontend Engineer | Riley has a visually dense resume with columns, skill tables, separators, and icon-like labels. |
| `scanned-pdf` | QA Automation Engineer | Devon has a scanned, flattened resume with no embedded text layer. |

## Schema

Expected parser outputs are validated by `tests/fixtures/persona-schema.ts`. Target job JSON files use the same schema file so future fixture additions keep a stable contract.
