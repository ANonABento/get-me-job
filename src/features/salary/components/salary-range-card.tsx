import { Calculator } from "lucide-react";
import { getSalaryRangeInsight } from "@/features/salary/utils";
import { formatCurrency } from "@/lib/salary/calculator";
import type { CalculatorInputState, SalaryRange } from "@/features/salary/types";

interface SalaryRangeCardProps {
  input: CalculatorInputState;
  range: SalaryRange | null;
}

export function SalaryRangeCard({ input, range }: SalaryRangeCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="font-semibold mb-6">Market Salary Range</h2>

      {range ? (
        <div className="space-y-6">
          <div className="relative pt-6 pb-2">
            <div className="h-3 bg-gradient-to-r from-amber-400 via-success to-info rounded-full" />
            <div className="absolute top-0 left-0 text-xs text-muted-foreground">
              {formatCurrency(range.min)}
            </div>
            <div className="absolute top-0 right-0 text-xs text-muted-foreground">
              {formatCurrency(range.max)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <SalaryStatCard
              label="25th Percentile"
              value={formatCurrency(range.percentile25)}
              className="bg-warning/10 border-warning/20 text-warning"
            />
            <SalaryStatCard
              label="Median"
              value={formatCurrency(range.median)}
              className="bg-success/10 border-success/20 text-success"
              valueClassName="text-xl"
            />
            <SalaryStatCard
              label="75th Percentile"
              value={formatCurrency(range.percentile75)}
              className="bg-info/10 border-info/20 text-info"
            />
          </div>

          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground">
              {getSalaryRangeInsight({
                location: input.location,
                range,
                role: input.role,
                yearsExperience: input.yearsExperience,
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted text-muted-foreground mb-4">
            <Calculator className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground">
            Enter your role, location, and experience to see market rates
          </p>
        </div>
      )}
    </div>
  );
}

interface SalaryStatCardProps {
  className: string;
  label: string;
  value: string;
  valueClassName?: string;
}

function SalaryStatCard({
  className,
  label,
  value,
  valueClassName = "text-lg",
}: SalaryStatCardProps) {
  return (
    <div className={`text-center p-4 rounded-xl border ${className}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`${valueClassName} font-bold`}>{value}</p>
    </div>
  );
}

