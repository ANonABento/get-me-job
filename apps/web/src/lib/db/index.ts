import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

type LegacyStatement = {
  all: (...args: unknown[]) => Promise<Record<string, unknown>[]>;
  get: (...args: unknown[]) => Promise<Record<string, unknown> | undefined>;
  run: (
    ...args: unknown[]
  ) => Promise<{ changes: number; lastInsertRowid?: number }>;
};

type LegacySqlSurface = {
  exec: (sql: string) => Promise<void>;
  prepare: (sql: string) => LegacyStatement;
};

let clientInstance: Client | undefined;
let dbInstance: (LibSQLDatabase<typeof schema> & LegacySqlSurface) | undefined;
const dbWarningGlobal = globalThis as typeof globalThis & {
  __slothingVecBootstrapWarned?: boolean;
};

export function getLibsqlConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const url = env.TURSO_DATABASE_URL?.trim() || "file:./.local.db";
  const authToken = env.TURSO_AUTH_TOKEN?.trim();
  return authToken ? { url, authToken } : { url };
}

export function getClient(): Client {
  clientInstance ??= createClient(getLibsqlConfig());
  return clientInstance;
}

function createLegacySurface(client: Client): LegacySqlSurface {
  return {
    async exec(sql: string) {
      await client.executeMultiple(sql);
    },
    prepare(sql: string) {
      return {
        async all(...args: unknown[]) {
          const result = await client.execute({ sql, args: args as any[] });
          return result.rows as Record<string, unknown>[];
        },
        async get(...args: unknown[]) {
          const result = await client.execute({ sql, args: args as any[] });
          return result.rows[0] as Record<string, unknown> | undefined;
        },
        async run(...args: unknown[]) {
          const result = await client.execute({ sql, args: args as any[] });
          return {
            changes: result.rowsAffected,
            lastInsertRowid:
              typeof result.lastInsertRowid === "bigint"
                ? Number(result.lastInsertRowid)
                : result.lastInsertRowid,
          };
        },
      };
    },
  };
}

async function bootstrapVirtualTables(client: Client): Promise<void> {
  // sqlite-vec virtual tables can't be expressed in Drizzle schema;
  // create on first connection. Idempotent via IF NOT EXISTS.
  // Falls back silently if sqlite-vec extension is unavailable — knowledge-bank
  // vector paths will fail at query time, but unrelated paths keep working.
  try {
    await client.execute(
      "CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(embedding float[1536])",
    );
  } catch (error) {
    const shouldWarn =
      process.env.NODE_ENV !== "test" &&
      process.env.NEXT_PHASE !== "phase-production-build" &&
      process.env.npm_lifecycle_event !== "build" &&
      !dbWarningGlobal.__slothingVecBootstrapWarned;

    if (shouldWarn) {
      dbWarningGlobal.__slothingVecBootstrapWarned = true;
      console.warn(
        "[db] chunks_vec bootstrap skipped:",
        (error as Error).message,
      );
    }
  }
}

export function getDb(): LibSQLDatabase<typeof schema> & LegacySqlSurface {
  if (!dbInstance) {
    const client = getClient();
    dbInstance = Object.assign(
      drizzle(client, { schema }),
      createLegacySurface(client),
    );
    void bootstrapVirtualTables(client);
  }
  return dbInstance;
}

export const db = new Proxy(
  {} as LibSQLDatabase<typeof schema> & LegacySqlSurface,
  {
    get(_target, property) {
      const realDb = getDb();
      const value = Reflect.get(realDb as object, property, realDb);
      return typeof value === "function" ? value.bind(realDb) : value;
    },
  },
);

export default db;

export {
  DEFAULT_USER_ID,
  DEFAULT_PROFILE_ID,
  settings,
  documents,
  documentArtifacts,
  documentParseRuns,
  profile,
  experiences,
  education,
  skills,
  projects,
  certifications,
  jobs,
  generatedResumes,
  interviewSessions,
  interviewAnswers,
  reminders,
  notifications,
  externalCalendarEvents,
  suggestedStatusUpdates,
  companyResearch,
  coverLetters,
  llmSettings,
  stripeCustomers,
  subscriptions,
  creditBalances,
  creditTransactions,
  emailDrafts,
  analyticsSnapshots,
  jobStatusHistory,
  salaryOffers,
  atsScanHistory,
  customTemplates,
  profileBank,
  profileVersions,
  chunks,
  knowledgeChunks,
  extensionSessions,
  answerBank,
  answerBankVersions,
  fieldMappings,
  resumeAbTracking,
  promptVariants,
  promptVariantResults,
  userActivity,
  achievementUnlocks,
  sharedResumes,
} from "./schema";
export * from "./queries";
export * from "./jobs";
export * from "./interviews";
export * from "./resumes";
export * from "./reminders";
export * from "./notifications";
export * from "./external-calendar-events";
export * from "./suggested-status-updates";
export * from "./custom-templates";
export * from "./profile-bank";
export * from "./document-artifacts";
export * from "./document-parse-runs";
export * from "./answer-bank";
export * from "./answer-bank-versions";
export * from "./answer-bank-migration";
export * from "./profile-versions";
export * from "./knowledge-bank";
export * from "./subscriptions";
export * from "./credits";
export * from "./streak";

export {
  eq,
  and,
  or,
  desc,
  asc,
  like,
  sql as sqlOp,
  isNull,
  isNotNull,
} from "drizzle-orm";
