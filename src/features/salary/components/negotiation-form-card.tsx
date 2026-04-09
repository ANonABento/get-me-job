import { Loader2, Sparkles, TrendingUp } from "lucide-react";
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
import { SALARY_ROLES } from "@/features/salary/constants";
import type { NegotiationInputState } from "@/features/salary/types";

interface NegotiationFormCardProps {
  generatingScript: boolean;
  input: NegotiationInputState;
  onGenerate: () => void;
  onUpdateInput: (updates: Partial<NegotiationInputState>) => void;
}

export function NegotiationFormCard({
  generatingScript,
  input,
  onGenerate,
  onUpdateInput,
}: NegotiationFormCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="font-semibold mb-6 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Generate Negotiation Script
      </h2>

      <div className="space-y-4">
        <TextField
          label="Company"
          value={input.company}
          onChange={(company) => onUpdateInput({ company })}
          placeholder="e.g., Google"
        />
        <div>
          <Label className="mb-2 block">Role</Label>
          <Select value={input.role} onValueChange={(role) => onUpdateInput({ role })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
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
        <TextField
          label="Current Offer"
          type="number"
          value={input.currentOffer}
          onChange={(currentOffer) => onUpdateInput({ currentOffer })}
          placeholder="e.g., 150000"
        />
        <TextField
          label="Your Target"
          type="number"
          value={input.targetSalary}
          onChange={(targetSalary) => onUpdateInput({ targetSalary })}
          placeholder="e.g., 175000"
        />

        <Button
          onClick={onGenerate}
          disabled={!input.company || !input.currentOffer || !input.targetSalary || generatingScript}
          className="w-full mt-4 gradient-bg text-white hover:opacity-90"
        >
          {generatingScript ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate Script
        </Button>
      </div>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}

function TextField({ label, onChange, placeholder, type = "text", value }: TextFieldProps) {
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

