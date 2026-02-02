import { NextRequest, NextResponse } from "next/server";
import {
  getSalaryOffer,
  updateSalaryOffer,
  deleteSalaryOffer,
} from "@/lib/db/salary";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - Get a specific salary offer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const offer = getSalaryOffer(params.id);

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Get salary offer error:", error);
    return NextResponse.json(
      { error: "Failed to get salary offer" },
      { status: 500 }
    );
  }
}

// PUT - Update a salary offer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const {
      baseSalary,
      signingBonus,
      annualBonus,
      equityValue,
      vestingYears,
      location,
      status,
      notes,
      negotiationOutcome,
      finalBaseSalary,
      finalTotalComp,
    } = await request.json();

    const offer = updateSalaryOffer(params.id, {
      baseSalary,
      signingBonus,
      annualBonus,
      equityValue,
      vestingYears,
      location,
      status,
      notes,
      negotiationOutcome,
      finalBaseSalary,
      finalTotalComp,
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Update salary offer error:", error);
    return NextResponse.json(
      { error: "Failed to update salary offer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a salary offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const success = deleteSalaryOffer(params.id);

    if (!success) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete salary offer error:", error);
    return NextResponse.json(
      { error: "Failed to delete salary offer" },
      { status: 500 }
    );
  }
}
