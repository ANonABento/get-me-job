# User Scoping Audit - 2026-05-18

Scope: targeted review of raw/local SQL access in `apps/web/src/app` and
`apps/web/src/lib`, with focus on routes and query helpers that read or mutate
user-owned records.

Commands used:

```bash
rg -l "db\.prepare\(" apps/web/src/app
rg -l "db\.prepare\(" apps/web/src/lib
rg -n "SELECT \* FROM [a-z_]+ WHERE id = \?|UPDATE [a-z_]+.*WHERE id = \?|DELETE FROM [a-z_]+ WHERE id = \?" apps/web/src/lib/db apps/web/src/app -S
```

## Result

No cross-user read/write bug was found in the reviewed route surface or primary
query-layer helpers.

The direct raw-SQL API route surface is limited to:

- `api/extension/auth`: creates/revokes extension sessions only after
  `requireAuth()`, then writes or deletes rows with the authenticated `userId`.
- `api/extension/auth/verify`: looks up by extension token because the token is
  the bearer credential; subsequent expiry cleanup and last-used updates include
  the session `user_id`.
- `api/extension/field-mappings/correct`: validates `X-Extension-Token`, then
  reads and writes mappings with `user_id = authResult.userId`.

The primary user-owned helpers reviewed require `userId` on reads and writes:

- Opportunities/jobs, generated resumes, cover letters, email drafts/sends,
  documents/profile, component bank entries, templates, analytics, interviews,
  salary offers, notifications, reminders, company research, contacts,
  prompt variants, ATS scans, status suggestions, profile versions, credit
  balances, subscriptions by user, and account deletion.

## Intentional Exceptions

These raw queries are intentionally not scoped by caller `userId`:

- Public share links in `shared-resumes.ts` look up by high-entropy share token.
- Public opportunity OpenGraph images call `getJobByIdAnyUser`; this is limited
  to title/company preview metadata for exact opportunity URLs.
- Extension token verification looks up by token because possession of the token
  authenticates the extension session.
- Stripe webhook helpers look up subscriptions and customers by Stripe IDs from
  webhook payloads, not by an interactive app user.
- Cron, cleanup, migration, waitlist, and schema/bootstrap helpers operate
  across users by design.

## Follow-Up Watchlist

`knowledge-bank.ts` still exposes low-level helpers such as `supersedChunk(id,
supersededBy)` and `insertChunkVector(chunkId, embedding)` without a `userId`
argument. Current references are tests only, but if this older chunk store is
reintroduced into a user-facing route, require a user-scoped wrapper before use.
