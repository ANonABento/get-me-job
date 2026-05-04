# Persona Journey Results

Generated for Test 1.3 on 2026-05-04.

## Scope

The reproducible Playwright specs were added under `tests/e2e/persona-*.spec.ts`
and are included by the root Playwright config.
Each spec checks for the required Test 1.1 persona fixture files before executing:

- `tests/fixtures/personas/<slug>/resume.pdf`
- `tests/fixtures/personas/<slug>/expected.json`
- `tests/fixtures/personas/<slug>/target-jobs/job-1.json`

Those fixtures are not present in this worktree, and the local dependency branch available here does not contain them. The specs therefore skip with an explicit prerequisite message until Test 1.1's fixture output is available.

When the fixtures are present, each spec:

- captures a screenshot and DOM snapshot for every completed step
- uploads `resume.pdf` through the Bank UI
- compares rendered Bank page text against values extracted from `expected.json`
- creates the target opportunity through the Add Opportunity dialog using `target-jobs/job-1.json`
- captures API state for Bank, Opportunity, and Analytics checkpoints

## career-switcher

| Step                   | Expected                                                | Actual        | Divergence                     | Severity | RCA                                             |
| ---------------------- | ------------------------------------------------------- | ------------- | ------------------------------ | -------- | ----------------------------------------------- |
| Sign up                | Unique email reaches authenticated app shell.           | Not executed. | Missing prerequisite fixtures. | Blocker  | Test 1.1 persona fixture directory unavailable. |
| Onboarding             | Completes or skips onboarding with reasonable defaults. | Not executed. | Missing prerequisite fixtures. | Blocker  | Same prerequisite failure.                      |
| Upload resume          | Uploads `resume.pdf` and creates parsed data.           | Not executed. | Missing prerequisite fixtures. | Blocker  | `resume.pdf` unavailable.                       |
| Verify bank            | Rendered entries match `expected.json`.                 | Not executed. | Missing prerequisite fixtures. | Blocker  | `expected.json` unavailable.                    |
| Add target opportunity | Adds `target-jobs/job-1.json`.                          | Not executed. | Missing prerequisite fixtures. | Blocker  | Target job fixture unavailable.                 |
| Tailor resume          | Studio generates a tailored resume.                     | Not executed. | Missing prerequisite fixtures. | Blocker  | Upstream steps unavailable.                     |
| Generate cover letter  | Cover letter is generated for the opportunity.          | Not executed. | Missing prerequisite fixtures. | Blocker  | Upstream steps unavailable.                     |
| Run ATS scan           | ATS scanner returns a score/result.                     | Not executed. | Missing prerequisite fixtures. | Blocker  | Upstream steps unavailable.                     |
| Check analytics        | Funnel includes the new application.                    | Not executed. | Missing prerequisite fixtures. | Blocker  | Upstream steps unavailable.                     |

## new-grad

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## laid-off-senior

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## returning-parent

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## visa-sponsorship

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## remote-only

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## executive

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## contractor

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## nonprofit-to-tech

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## disabled-candidate

Same result as `career-switcher`: all journey steps are skipped because the Test 1.1 fixture files are absent.

## Aggregated Insights

- Most frequent failure mode: missing Test 1.1 persona fixture files, affecting 10 of 10 personas before UI execution.
- Step most affected: all steps, because the prerequisite check runs before sign-up to avoid false journey results.
- Personas surfacing the most issues: all 10 personas are tied with the same blocker.
- Screenshot status: no journey screenshots were captured because no persona journey could start without the required fixture files. The specs write screenshots to `tests/journey-screenshots/<persona-slug>/<step>.png` after each completed step and attach DOM snapshots to the Playwright report.

## Followup Tasks

Medium+ severity issues identified:

- `Journey fix — Fixture setup — Publish Test 1.1 persona fixtures to tests/fixtures/personas`
- `Journey fix — Auth setup — Document or implement the E2E sign-up/auth bypass for persona specs`

Task creation note: this session does not expose the bento-ya MCP `create_task` tool, so the required follow-up task titles are recorded here for creation when that connector is available.
