import { NextResponse } from "next/server";

export function deprecatedJobsApiResponse(replacement: string) {
  return NextResponse.json(
    {
      error: "The /api/jobs API has been deprecated.",
      replacement,
    },
    {
      status: 410,
      headers: {
        Deprecation: "true",
        Link: `<${replacement}>; rel="successor-version"`,
      },
    },
  );
}
