"use client";

import { useState } from "react";
import { buildNegotiationScriptText } from "@/features/salary/utils";
import type {
  CalculatorInputState,
  CompensationOffer,
  NegotiationInputState,
  NegotiationScript,
  OfferComparison,
  SalaryRange,
  SalaryToolTab,
} from "@/features/salary/types";

const DEFAULT_CALCULATOR_INPUT: CalculatorInputState = {
  role: "",
  location: "",
  yearsExperience: "",
};

const DEFAULT_NEGOTIATION_INPUT: NegotiationInputState = {
  company: "",
  role: "",
  currentOffer: "",
  targetSalary: "",
};

export function useSalaryTools() {
  const [activeTab, setActiveTab] = useState<SalaryToolTab>("calculator");
  const [calculatorInput, setCalculatorInput] =
    useState<CalculatorInputState>(DEFAULT_CALCULATOR_INPUT);
  const [salaryRange, setSalaryRange] = useState<SalaryRange | null>(null);
  const [calculatingRange, setCalculatingRange] = useState(false);
  const [offers, setOffers] = useState<CompensationOffer[]>([]);
  const [newOffer, setNewOffer] = useState<Partial<CompensationOffer>>({});
  const [comparison, setComparison] = useState<OfferComparison | null>(null);
  const [negotiationInput, setNegotiationInput] =
    useState<NegotiationInputState>(DEFAULT_NEGOTIATION_INPUT);
  const [script, setScript] = useState<NegotiationScript | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [copied, setCopied] = useState(false);

  function updateCalculatorInput(updates: Partial<CalculatorInputState>) {
    setCalculatorInput((current) => ({ ...current, ...updates }));
  }

  function updateNewOffer(updates: Partial<CompensationOffer>) {
    setNewOffer((current) => ({ ...current, ...updates }));
  }

  function updateNegotiationInput(updates: Partial<NegotiationInputState>) {
    setNegotiationInput((current) => ({ ...current, ...updates }));
  }

  async function calculateSalaryRange() {
    const { location, role, yearsExperience } = calculatorInput;

    if (!role || !location || !yearsExperience) {
      return;
    }

    setCalculatingRange(true);

    try {
      const response = await fetch("/api/salary/calculate", {
        body: JSON.stringify({
          action: "range",
          location,
          role,
          yearsExperience: Number.parseInt(yearsExperience, 10),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { range?: SalaryRange };

      if (data.range) {
        setSalaryRange(data.range);
      }
    } catch (error) {
      console.error("Failed to calculate salary range:", error);
    } finally {
      setCalculatingRange(false);
    }
  }

  function addOffer() {
    if (!newOffer.company || !newOffer.baseSalary) {
      return;
    }

    const offer: CompensationOffer = {
      id: crypto.randomUUID(),
      company: newOffer.company,
      role: newOffer.role || "Software Engineer",
      baseSalary: newOffer.baseSalary,
      signingBonus: newOffer.signingBonus,
      annualBonus: newOffer.annualBonus,
      equityValue: newOffer.equityValue,
      vestingYears: newOffer.vestingYears || 4,
    };

    setOffers((currentOffers) => [...currentOffers, offer]);
    setNewOffer({});
  }

  function removeOffer(id: string) {
    setOffers((currentOffers) => {
      const nextOffers = currentOffers.filter((offer) => offer.id !== id);

      if (nextOffers.length < 2) {
        setComparison(null);
      }

      return nextOffers;
    });
  }

  async function compareOffers() {
    if (offers.length < 2) {
      return;
    }

    try {
      const response = await fetch("/api/salary/calculate", {
        body: JSON.stringify({
          action: "compare",
          offers,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { comparison?: OfferComparison };

      if (data.comparison) {
        setComparison(data.comparison);
      }
    } catch (error) {
      console.error("Failed to compare offers:", error);
    }
  }

  async function generateNegotiationScript() {
    const { company, currentOffer, role, targetSalary } = negotiationInput;

    if (!company || !currentOffer || !targetSalary) {
      return;
    }

    setGeneratingScript(true);

    try {
      const response = await fetch("/api/salary/negotiate", {
        body: JSON.stringify({
          company,
          currentOffer: Number.parseInt(currentOffer, 10),
          marketMax: salaryRange?.max || Number.parseInt(targetSalary, 10) * 1.2,
          marketMedian: salaryRange?.median || Number.parseInt(targetSalary, 10),
          role: role || "Software Engineer",
          targetSalary: Number.parseInt(targetSalary, 10),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { script?: NegotiationScript };

      if (data.script) {
        setScript(data.script);
      }
    } catch (error) {
      console.error("Failed to generate script:", error);
    } finally {
      setGeneratingScript(false);
    }
  }

  async function copyScript() {
    if (!script) {
      return;
    }

    await navigator.clipboard.writeText(buildNegotiationScriptText(script));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return {
    activeTab,
    addOffer,
    calculateSalaryRange,
    calculatingRange,
    calculatorInput,
    compareOffers,
    comparison,
    copied,
    copyScript,
    generateNegotiationScript,
    generatingScript,
    newOffer,
    negotiationInput,
    offers,
    removeOffer,
    salaryRange,
    script,
    setActiveTab,
    updateCalculatorInput,
    updateNegotiationInput,
    updateNewOffer,
  };
}
