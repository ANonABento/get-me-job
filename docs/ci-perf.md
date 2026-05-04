# CI Performance

## Baseline

Measured from recent GitHub Actions CI runs on May 4, 2026.

| Run | Workflow result | Wall time |
| --- | --- | ---: |
| 25307707084 | success | 6m 0s |
| 25307470953 | success | 4m 20s |
| 25307273996 | success | 4m 21s |
| 25307232373 | success | 4m 36s |
| 25307149408 | success | 4m 27s |

Detailed profile for run `25307707084`:

| Step | Duration |
| --- | ---: |
| Checkout repository | 3s |
| Setup Node.js | 11s |
| Install dependencies | 2m 3s |
| Type check | 23s |
| Run tests | 1m 18s |
| Lint | 8s |

The previous workflow serialized type-check, tests, and lint in one job. Dependency installation was the largest visible step and ran before all gates.

## Changes

- Split CI into parallel matrix jobs for `Type check`, `Test`, and `Lint`.
- Added workflow concurrency so superseded PR runs are cancelled.
- Added a path filter so docs-only changes skip type-check, tests, and lint while `CI Result` still completes.
- Restored `node_modules`, `.next/cache`, and the Vitest cache directory with `actions/cache`.
- Kept `actions/setup-node` npm cache enabled for the package download cache.

## Expected Result

On a warm dependency cache, each parallel job should skip `npm ci` and run only its gate. Based on the baseline step times, warm PR CI should be bounded by the test job and complete in roughly 1 to 2 minutes plus runner startup/cache restore time.

On a cold dependency cache, the three jobs may each install dependencies once because they start in parallel and cannot share a cache produced later in the same run. Subsequent runs with unchanged `package.json` and `package-lock.json` should have an exact dependency cache hit, targeting an unchanged-deps cache hit rate above 80%.

## Follow-up Verification

Remote timing requires pushed commits:

| Scenario | Expected behavior |
| --- | --- |
| No-op/code commit | `Type check`, `Test`, and `Lint` run in parallel |
| Docs-only commit | `Type check`, `Test`, and `Lint` are skipped; `CI Result` passes |
| Unchanged dependencies | `Restore dependency and tool caches` reports an exact hit |

After the first pushed run populates the cache, record the actual after-timing here.
