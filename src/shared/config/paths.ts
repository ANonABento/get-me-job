import path from "path";

export const PATHS = {
  DATABASE: path.join(process.cwd(), "data", "get-me-job.db"),
  UPLOADS: path.join(process.cwd(), "uploads"),
  RESUMES_OUTPUT: path.join(process.cwd(), "public", "resumes"),
  PUBLIC: path.join(process.cwd(), "public"),
} as const;
