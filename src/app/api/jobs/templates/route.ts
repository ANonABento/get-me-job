import { deprecatedJobsApiResponse } from "../deprecated";

export function GET() {
  return deprecatedJobsApiResponse("/api/opportunities/templates");
}
