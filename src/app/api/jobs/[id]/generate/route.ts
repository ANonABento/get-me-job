import { deprecatedJobsApiResponse } from "../../deprecated";

export function GET(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}/generate`);
}

export function POST(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}/generate`);
}
