import { Award, BarChart3, Building2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/salary/calculator";
import { cn } from "@/lib/utils";
import type { CompensationOffer, OfferComparison } from "@/features/salary/types";

interface OffersComparisonPanelProps {
  comparison: OfferComparison | null;
  newOffer: Partial<CompensationOffer>;
  offers: CompensationOffer[];
  onAddOffer: () => void;
  onCompareOffers: () => void;
  onRemoveOffer: (id: string) => void;
  onUpdateNewOffer: (updates: Partial<CompensationOffer>) => void;
}

export function OffersComparisonPanel({
  comparison,
  newOffer,
  offers,
  onAddOffer,
  onCompareOffers,
  onRemoveOffer,
  onUpdateNewOffer,
}: OffersComparisonPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add Offer
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OfferInputField
            label="Company"
            value={newOffer.company || ""}
            onChange={(value) => onUpdateNewOffer({ company: value })}
            placeholder="e.g., Google"
          />
          <OfferInputField
            label="Base Salary"
            type="number"
            value={newOffer.baseSalary || ""}
            onChange={(value) => onUpdateNewOffer({ baseSalary: parseNumberValue(value) })}
            placeholder="e.g., 180000"
          />
          <OfferInputField
            label="Signing Bonus"
            type="number"
            value={newOffer.signingBonus || ""}
            onChange={(value) => onUpdateNewOffer({ signingBonus: parseNumberValue(value) })}
            placeholder="e.g., 25000"
          />
          <OfferInputField
            label="Annual Bonus"
            type="number"
            value={newOffer.annualBonus || ""}
            onChange={(value) => onUpdateNewOffer({ annualBonus: parseNumberValue(value) })}
            placeholder="e.g., 20000"
          />
          <OfferInputField
            label="Equity Value (4yr)"
            type="number"
            value={newOffer.equityValue || ""}
            onChange={(value) => onUpdateNewOffer({ equityValue: parseNumberValue(value) })}
            placeholder="e.g., 200000"
          />
          <div className="flex items-end">
            <Button
              onClick={onAddOffer}
              disabled={!newOffer.company || !newOffer.baseSalary}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Button>
          </div>
        </div>
      </div>

      {offers.length > 0 ? (
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Your Offers ({offers.length})
            </h2>
            {offers.length >= 2 ? (
              <Button onClick={onCompareOffers} size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare
              </Button>
            ) : null}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                comparison={comparison}
                offer={offer}
                onRemove={() => onRemoveOffer(offer.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <div className="p-4 rounded-full bg-muted text-muted-foreground inline-block mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground">Add at least 2 offers to compare total compensation</p>
        </div>
      )}
    </div>
  );
}

function parseNumberValue(value: string) {
  return Number.parseInt(value, 10) || undefined;
}

interface OfferInputFieldProps {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: number | string;
}

function OfferInputField({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: OfferInputFieldProps) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

interface OfferCardProps {
  comparison: OfferComparison | null;
  offer: CompensationOffer;
  onRemove: () => void;
}

function OfferCard({ comparison, offer, onRemove }: OfferCardProps) {
  const rankedOffer = comparison?.ranked.find((entry) => entry.offer.id === offer.id);
  const isBestOverall = comparison?.bestOverall === offer.company;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border relative",
        isBestOverall ? "border-success bg-success/5" : "bg-muted/30"
      )}
    >
      {isBestOverall ? (
        <div className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Award className="h-3 w-3" />
          Best
        </div>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <h3 className="font-medium">{offer.company}</h3>
      <p className="text-sm text-muted-foreground">{offer.role}</p>
      <div className="mt-3 space-y-1 text-sm">
        <p>Base: {formatCurrency(offer.baseSalary)}</p>
        {offer.signingBonus ? <p>Signing: {formatCurrency(offer.signingBonus)}</p> : null}
        {offer.annualBonus ? <p>Bonus: {formatCurrency(offer.annualBonus)}/yr</p> : null}
        {offer.equityValue ? <p>Equity: {formatCurrency(offer.equityValue)} (4yr)</p> : null}
      </div>
      {rankedOffer ? (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">Total Annual Comp</p>
          <p className="font-bold text-lg">{formatCurrency(rankedOffer.totalComp.totalAnnual)}</p>
          <p className="text-xs text-muted-foreground mt-1">Rank: #{rankedOffer.rank}</p>
        </div>
      ) : null}
    </div>
  );
}

