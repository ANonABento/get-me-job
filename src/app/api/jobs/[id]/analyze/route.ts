import { deprecatedJobsApiResponse } from "../../deprecated";

export function POST(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}/analyze`);
}
