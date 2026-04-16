/**
 * @route GET /api/google/contacts
 * @route POST /api/google/contacts
 * @description List/search Google contacts or create a new contact
 * @auth Required
 * @request { type?: string, name: string, email?: string, company?: string, title?: string, phone?: string, notes?: string, jobTitle?: string, department?: string }
 * @response GoogleContactsResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  listContacts,
  createContact,
  createRecruiterContact,
  createHiringManagerContact,
  searchContactsByCompany,
  searchContactsByEmailDomain,
} from "@/lib/google/contacts";
import { isGoogleConnected } from "@/lib/google/client";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "Google account not connected" },
      { status: 400 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const company = searchParams.get("company");
    const domain = searchParams.get("domain");
    const query = searchParams.get("query");
    const limit = parseInt(searchParams.get("limit") || "100");

    let contacts;

    if (company) {
      contacts = await searchContactsByCompany(company);
    } else if (domain) {
      contacts = await searchContactsByEmailDomain(domain);
    } else {
      contacts = await listContacts(limit, query || undefined);
    }

    return NextResponse.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Contacts list error:", error);
    return NextResponse.json(
      { error: "Failed to list contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "Google account not connected" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { type, name, email, company, title, phone, notes, jobTitle, department } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    let resourceName: string | null = null;

    switch (type) {
      case "recruiter":
        if (!email || !company) {
          return NextResponse.json(
            { error: "Recruiter contacts require: email, company" },
            { status: 400 }
          );
        }
        resourceName = await createRecruiterContact(name, email, company, jobTitle);
        break;

      case "hiring_manager":
        if (!email || !company) {
          return NextResponse.json(
            { error: "Hiring manager contacts require: email, company" },
            { status: 400 }
          );
        }
        resourceName = await createHiringManagerContact(name, email, company, department);
        break;

      case "custom":
      default:
        resourceName = await createContact({
          name,
          email,
          phone,
          company,
          title,
          notes,
        });
        break;
    }

    if (!resourceName) {
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resourceName,
    });
  } catch (error) {
    console.error("Contact create error:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
