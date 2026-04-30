import path from "path";

/**
 * Application paths - centralized to avoid hardcoded paths throughout the codebase
 */
export const PATHS = {
  /** SQLite database file location */
  DATABASE:
    process.env.GET_ME_JOB_SQLITE_PATH ||
    path.join(process.cwd(), "data", "get-me-job.db"),
  /** Upload directory for user files */
  UPLOADS: path.join(process.cwd(), "uploads"),
  /** Generated resumes output directory */
  RESUMES_OUTPUT: path.join(process.cwd(), "public", "resumes"),
  /** Public directory root */
  PUBLIC: path.join(process.cwd(), "public"),
} as const;
