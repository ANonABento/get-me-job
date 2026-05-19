import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/currency-rates", () => ({
  SUPPORTED_CURRENCIES: ["USD", "CAD", "EUR", "GBP"],
  upsertRate: vi.fn(),
}));

import { upsertRate } from "@/lib/db/currency-rates";
import { refreshCurrencyRates } from "./currency-rates";

describe("refreshCurrencyRates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts every supported pair from a successful frankfurter response", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        amount: 1,
        base: "USD",
        date: "2026-05-19",
        rates: { CAD: 1.36, EUR: 0.92, GBP: 0.79 },
      }),
    })) as unknown as typeof fetch;

    const result = await refreshCurrencyRates({
      fetcher,
      now: () => "2026-05-19T00:00:00.000Z",
    });

    expect(result.errors).toEqual([]);
    // 4 USD pairs (USD→USD/CAD/EUR/GBP) plus 3 derived bases × 4 targets
    // each = 4 + 12 = 16.
    expect(result.pairsUpdated).toBe(16);
    expect(upsertRate).toHaveBeenCalledWith("USD", "CAD", 1.36);
    expect(upsertRate).toHaveBeenCalledWith("USD", "USD", 1);

    // Derived: CAD→USD = 1/1.36 ≈ 0.735
    const cadToUsdCall = (
      upsertRate as ReturnType<typeof vi.fn>
    ).mock.calls.find(([base, target]) => base === "CAD" && target === "USD");
    expect(cadToUsdCall).toBeDefined();
    expect(cadToUsdCall![2]).toBeCloseTo(0.735, 2);

    // CAD→EUR = (1/1.36) * 0.92 ≈ 0.676
    const cadToEurCall = (
      upsertRate as ReturnType<typeof vi.fn>
    ).mock.calls.find(([base, target]) => base === "CAD" && target === "EUR");
    expect(cadToEurCall![2]).toBeCloseTo(0.676, 2);
  });

  it("returns errors[] when fetch fails and updates zero pairs other than identity", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;

    const result = await refreshCurrencyRates({ fetcher });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("network down");
    // The identity USD→USD row is the only thing we can safely write
    // when the upstream is down (no derivation possible without rates).
    expect(result.pairsUpdated).toBe(1);
    expect(upsertRate).toHaveBeenCalledWith("USD", "USD", 1);
  });

  it("treats a non-200 response as an error without throwing", async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const result = await refreshCurrencyRates({ fetcher });
    expect(result.errors[0]).toContain("503");
  });
});
