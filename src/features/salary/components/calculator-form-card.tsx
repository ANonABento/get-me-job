import { Briefcase, Calculator, Clock, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SALARY_LOCATIONS, SALARY_ROLES } from "@/features/salary/constants";
import type { CalculatorInputState } from "@/features/salary/types";

interface CalculatorFormCardProps {
  calculatingRange: boolean;
  input: CalculatorInputState;
  onCalculate: () => void;
  onUpdateInput: (updates: Partial<CalculatorInputState>) => void;
}

export function CalculatorFormCard({
  calculatingRange,
  input,
  onCalculate,
  onUpdateInput,
}: CalculatorFormCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="font-semibold mb-6 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        Market Rate Calculator
      </h2>

      <div className="space-y-4">
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Role
          </Label>
          <Select value={input.role} onValueChange={(role) => onUpdateInput({ role })}>
            <SelectTrigger aria-label="Select role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {SALARY_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Location
          </Label>
          <Select value={input.location} onValueChange={(location) => onUpdateInput({ location })}>
            <SelectTrigger aria-label="Select location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {SALARY_LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Years of Experience
          </Label>
          <Input
            type="number"
            min="0"
            max="40"
            value={input.yearsExperience}
            onChange={(event) => onUpdateInput({ yearsExperience: event.target.value })}
            placeholder="e.g., 5"
          />
        </div>

        <Button
          onClick={onCalculate}
          disabled={!input.role || !input.location || !input.yearsExperience || calculatingRange}
          className="w-full mt-4 gradient-bg text-white hover:opacity-90"
        >
          {calculatingRange ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Calculator className="h-4 w-4 mr-2" />
          )}
          Calculate Range
        </Button>
      </div>
    </div>
  );
}

