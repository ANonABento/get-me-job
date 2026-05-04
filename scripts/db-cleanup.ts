/**
 * `npm run db:cleanup`
 *
 * Manually run the dedupe backfill migration. Schema.ts also runs this on
 * app startup, so this script is mostly useful for local cleanup and
 * verifying the database is clean.
 */
process.env.GET_ME_JOB_SKIP_DEDUPE_BACKFILL = "true";

async function main() {
  const { default: db } = await import("../src/lib/db/schema");
  const { runDedupeBackfillMigration } = await import("../src/lib/db/dedupe-backfill");

  const result = runDedupeBackfillMigration(db);

  if (result.duplicateSourceFilesRemoved === 0 && result.duplicateBankEntriesRemoved === 0) {
    console.log("[db:cleanup] Database is clean — no duplicates removed.");
  } else {
    console.log(
      `[db:cleanup] Done. Removed ${result.duplicateSourceFilesRemoved} duplicate documents and ${result.duplicateBankEntriesRemoved} duplicate bank entries.`
    );
  }
}

main().catch((error) => {
  console.error("[db:cleanup] failed:", error);
  process.exitCode = 1;
});
