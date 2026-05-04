import { deprecatedJobsApiResponse } from "../../deprecated";

export function GET(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}/resumes`);
}

export function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}/resumes`);
}
