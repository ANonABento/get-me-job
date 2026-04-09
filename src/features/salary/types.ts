import type {
  CompensationOffer,
  SalaryRange,
  TotalCompensation,
} from "@/lib/salary/calculator";

export type SalaryToolTab = "calculator" | "compare" | "negotiate";

export interface NegotiationScript {
  opening: string;
  valuePoints: string[];
  theAsk: string;
  pushbackResponses: { objection: string; response: string }[];
  close: string;
}

export interface OfferComparison {
  ranked: Array<{
    offer: CompensationOffer;
    totalComp: TotalCompensation;
    rank: number;
  }>;
  bestOverall: string;
  bestBase: string;
  bestEquity: string;
}

export interface CalculatorInputState {
  role: string;
  location: string;
  yearsExperience: string;
}

export interface NegotiationInputState {
  company: string;
  role: string;
  currentOffer: string;
  targetSalary: string;
}

export type {
  CompensationOffer,
  SalaryRange,
  TotalCompensation,
} from "@/lib/salary/calculator";

