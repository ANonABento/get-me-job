import { NextRequest, NextResponse } from "next/server";
import {
  calculateSalaryRange,
  calculateTotalCompensation,
  compareOffers,
  generateCounterOffer,
  type SalaryInput,
  type CompensationOffer,
} from "@/lib/salary/calculator";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "range": {
        const input: SalaryInput = {
          role: body.role,
          location: body.location,
          yearsExperience: body.yearsExperience,
          skills: body.skills,
        };

        if (!input.role || !input.location || input.yearsExperience === undefined) {
          return NextResponse.json(
            { error: "Missing required fields: role, location, yearsExperience" },
            { status: 400 }
          );
        }

        const range = calculateSalaryRange(input);
        return NextResponse.json({ range, input });
      }

      case "total": {
        const offer: CompensationOffer = body.offer;
        if (!offer || !offer.baseSalary) {
          return NextResponse.json(
            { error: "Missing required offer with baseSalary" },
            { status: 400 }
          );
        }

        const totalComp = calculateTotalCompensation(offer);
        return NextResponse.json({ totalCompensation: totalComp, offer });
      }

      case "compare": {
        const offers: CompensationOffer[] = body.offers;
        if (!offers || !Array.isArray(offers) || offers.length < 2) {
          return NextResponse.json(
            { error: "Need at least 2 offers to compare" },
            { status: 400 }
          );
        }

        const comparison = compareOffers(offers);
        return NextResponse.json({ comparison });
      }

      case "counter": {
        const { offer, marketRange, targetPercentile } = body;
        if (!offer || !marketRange) {
          return NextResponse.json(
            { error: "Missing offer or marketRange" },
            { status: 400 }
          );
        }

        const counter = generateCounterOffer(offer, marketRange, targetPercentile);
        return NextResponse.json({ counter });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: range, total, compare, or counter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Salary calculation error:", error);
    return NextResponse.json(
      { error: "Failed to process salary calculation" },
      { status: 500 }
    );
  }
}
