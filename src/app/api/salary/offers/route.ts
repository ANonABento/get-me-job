import { NextRequest, NextResponse } from "next/server";
import {
  getSalaryOffers,
  createSalaryOffer,
  getSalaryStats,
} from "@/lib/db/salary";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - List all salary offers
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const offers = getSalaryOffers();
    const stats = getSalaryStats();

    return NextResponse.json({ offers, stats });
  } catch (error) {
    console.error("Get salary offers error:", error);
    return NextResponse.json(
      { error: "Failed to get salary offers" },
      { status: 500 }
    );
  }
}

// POST - Create a new salary offer
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const {
      jobId,
      company,
      role,
      baseSalary,
      signingBonus,
      annualBonus,
      equityValue,
      vestingYears,
      location,
      notes,
    } = await request.json();

    if (!company || !role || baseSalary === undefined) {
      return NextResponse.json(
        { error: "company, role, and baseSalary are required" },
        { status: 400 }
      );
    }

    const offer = createSalaryOffer({
      jobId,
      company,
      role,
      baseSalary,
      signingBonus,
      annualBonus,
      equityValue,
      vestingYears,
      location,
      notes,
    });

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Create salary offer error:", error);
    return NextResponse.json(
      { error: "Failed to create salary offer" },
      { status: 500 }
    );
  }
}
