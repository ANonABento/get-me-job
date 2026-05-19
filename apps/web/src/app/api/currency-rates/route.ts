/**
 * @route GET /api/currency-rates
 * @description Returns the cached FX-rate map for the pay-normalization
 *   renderer (bucket G.1). Updated daily by /api/cron/currency-rates.
 *   No auth — rates are global, public reference data.
 *
 * Response: `{ rates: { USD: { CAD: 1.36, EUR: 0.92, ... }, ... } }`.
 * Empty `{ rates: {} }` is valid — the client falls back to source-
 * currency rendering until the cron has run once.
 */
import { NextResponse } from "next/server";
import { getAllRates } from "@/lib/db/currency-rates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rates = getAllRates();
    return NextResponse.json({ rates });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message, rates: {} },
      { status: 500 },
    );
  }
}
