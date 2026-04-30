/**
 * @route GET /api/contacts
 * @description List contacts with optional search, follow-up filter, and pagination
 * @route POST /api/contacts
 * @description Create a networking contact
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  CONTACT_FOLLOW_UP_FILTERS,
  createContactSchema,
  type ContactFollowUpFilter,
} from "@/lib/constants";
import { createContact, getContacts } from "@/lib/db/contacts";

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const followUpParam = searchParams.get("followUp");
    const followUpFilter = CONTACT_FOLLOW_UP_FILTERS.includes(
      followUpParam as ContactFollowUpFilter
    )
      ? (followUpParam as ContactFollowUpFilter)
      : "all";

    const result = getContacts(
      {
        page: parsePositiveInt(searchParams.get("page")),
        pageSize: parsePositiveInt(searchParams.get("pageSize")),
        query: searchParams.get("q") || undefined,
        followUpFilter,
      },
      authResult.userId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json({ error: "Failed to get contacts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parseResult = createContactSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          errors: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const contact = createContact(parseResult.data, authResult.userId);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
