import { deprecatedJobsApiResponse } from "./deprecated";

export function GET() {
  return deprecatedJobsApiResponse("/api/opportunities");
}

export function POST() {
  return deprecatedJobsApiResponse("/api/opportunities");
}
