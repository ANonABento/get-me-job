"use client";

import { Loader2 } from "lucide-react";
import { CalculatorFormCard } from "@/features/salary/components/calculator-form-card";
import { NegotiationFormCard } from "@/features/salary/components/negotiation-form-card";
import { NegotiationScriptCard } from "@/features/salary/components/negotiation-script-card";
import { OffersComparisonPanel } from "@/features/salary/components/offers-comparison-panel";
import { SalaryHeader } from "@/features/salary/components/salary-header";
import { SalaryRangeCard } from "@/features/salary/components/salary-range-card";
import { SalaryTabs } from "@/features/salary/components/salary-tabs";
import { useSalaryTools } from "@/features/salary/hooks/use-salary-tools";

export default function SalaryToolsPage() {
  const {
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
    negotiationInput,
    newOffer,
    offers,
    removeOffer,
    salaryRange,
    script,
    setActiveTab,
    updateCalculatorInput,
    updateNegotiationInput,
    updateNewOffer,
  } = useSalaryTools();

  return (
    <div className="min-h-screen pb-24">
      <SalaryHeader />
      <SalaryTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <CalculatorFormCard
              calculatingRange={calculatingRange}
              input={calculatorInput}
              onCalculate={calculateSalaryRange}
              onUpdateInput={updateCalculatorInput}
            />
            <SalaryRangeCard input={calculatorInput} range={salaryRange} />
          </div>
        )}

        {activeTab === "compare" && (
          <OffersComparisonPanel
            comparison={comparison}
            newOffer={newOffer}
            offers={offers}
            onAddOffer={addOffer}
            onCompareOffers={compareOffers}
            onRemoveOffer={removeOffer}
            onUpdateNewOffer={updateNewOffer}
          />
        )}

        {activeTab === "negotiate" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <NegotiationFormCard
              generatingScript={generatingScript}
              input={negotiationInput}
              onGenerate={generateNegotiationScript}
              onUpdateInput={updateNegotiationInput}
            />
            <NegotiationScriptCard copied={copied} onCopy={copyScript} script={script} />
          </div>
        )}
      </div>
    </div>
  );
}
