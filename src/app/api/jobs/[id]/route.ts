import { deprecatedJobsApiResponse } from "../deprecated";

export function GET(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}`);
}

export function PUT(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}`);
}

export function PATCH(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}`);
}

export function DELETE(_request: Request, { params }: { params: { id: string } }) {
  return deprecatedJobsApiResponse(`/api/opportunities/${params.id}`);
}
