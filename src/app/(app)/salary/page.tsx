"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Calculator,
  TrendingUp,
  Briefcase,
  Plus,
  Trash2,
  Loader2,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Clock,
  Building2,
  Award,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useErrorToast } from "@/hooks/use-error-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SalaryRange {
  min: number;
  median: number;
  max: number;
  percentile25: number;
  percentile75: number;
}

interface CompensationOffer {
  id: string;
  company: string;
  role: string;
  baseSalary: number;
  signingBonus?: number;
  annualBonus?: number;
  equityValue?: number;
  vestingYears?: number;
}

interface NegotiationScript {
  opening: string;
  valuePoints: string[];
  theAsk: string;
  pushbackResponses: { objection: string; response: string }[];
  close: string;
}

const LOCATIONS = [
  "San Francisco",
  "New York",
  "Seattle",
  "Los Angeles",
  "Boston",
  "Austin",
  "Denver",
  "Chicago",
  "Atlanta",
  "Dallas",
  "Phoenix",
  "Remote",
];

const ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Product Manager",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Mobile Engineer",
  "QA Engineer",
  "UX Designer",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type TabType = "calculator" | "compare" | "negotiate";

export default function SalaryToolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("calculator");

  // Calculator state
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [salaryRange, setSalaryRange] = useState<SalaryRange | null>(null);
  const [calculatingRange, setCalculatingRange] = useState(false);

  // Compare state
  const [offers, setOffers] = useState<CompensationOffer[]>([]);
  const [newOffer, setNewOffer] = useState<Partial<CompensationOffer>>({});
  const [comparison, setComparison] = useState<{
    ranked: Array<{
      offer: CompensationOffer;
      totalComp: { totalAnnual: number; totalFourYear: number };
      rank: number;
    }>;
    bestOverall: string;
  } | null>(null);

  // Negotiate state
  const [negotiateCompany, setNegotiateCompany] = useState("");
  const [negotiateRole, setNegotiateRole] = useState("");
  const [currentOffer, setCurrentOffer] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  const [script, setScript] = useState<NegotiationScript | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const showErrorToast = useErrorToast();

  const calculateSalaryRange = async () => {
    if (!role || !location || !yearsExperience) return;

    setCalculatingRange(true);
    try {
      const res = await fetch("/api/salary/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "range",
          role,
          location,
          yearsExperience: parseInt(yearsExperience),
        }),
      });

      const data = await res.json();
      if (data.range) {
        setSalaryRange(data.range);
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not calculate salary range",
        fallbackDescription: "Please check the inputs and try again.",
      });
    } finally {
      setCalculatingRange(false);
    }
  };

  const addOffer = () => {
    if (!newOffer.company || !newOffer.baseSalary) return;

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

    setOffers([...offers, offer]);
    setNewOffer({});
  };

  const removeOffer = (id: string) => {
    setOffers(offers.filter((o) => o.id !== id));
    if (offers.length <= 2) {
      setComparison(null);
    }
  };

  const compareOffers = async () => {
    if (offers.length < 2) return;

    try {
      const res = await fetch("/api/salary/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "compare",
          offers,
        }),
      });

      const data = await res.json();
      if (data.comparison) {
        setComparison(data.comparison);
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not compare offers",
        fallbackDescription: "Please check the offer details and try again.",
      });
    }
  };

  const generateNegotiationScript = async () => {
    if (!negotiateCompany || !currentOffer || !targetSalary) return;

    setGeneratingScript(true);
    try {
      const res = await fetch("/api/salary/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: negotiateCompany,
          role: negotiateRole || "Software Engineer",
          currentOffer: parseInt(currentOffer),
          targetSalary: parseInt(targetSalary),
          marketMedian: salaryRange?.median || parseInt(targetSalary),
          marketMax: salaryRange?.max || parseInt(targetSalary) * 1.2,
        }),
      });

      const data = await res.json();
      if (data.script) {
        setScript(data.script);
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not generate negotiation script",
        fallbackDescription: "Please adjust the inputs and try again.",
      });
    } finally {
      setGeneratingScript(false);
    }
  };

  const copyScript = async () => {
    if (!script) return;

    const fullScript = `
OPENING:
${script.opening}

VALUE POINTS:
${script.valuePoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

THE ASK:
${script.theAsk}

HANDLING PUSHBACK:
${script.pushbackResponses.map((p) => `Q: "${p.objection}"\nA: "${p.response}"`).join("\n\n")}

CLOSE:
${script.close}
    `.trim();

    await navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "calculator" as TabType, label: "Salary Calculator", icon: Calculator },
    { id: "compare" as TabType, label: "Compare Offers", icon: BarChart3 },
    { id: "negotiate" as TabType, label: "Negotiate", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="space-y-4 animate-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Negotiation
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Salary Tools</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Research market rates, compare offers, and prepare for salary negotiations.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input */}
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
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger aria-label="Select role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
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
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger aria-label="Select location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
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
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>

                <Button
                  onClick={calculateSalaryRange}
                  disabled={!role || !location || !yearsExperience || calculatingRange}
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

            {/* Results */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold mb-6">Market Salary Range</h2>

              {salaryRange ? (
                <div className="space-y-6">
                  {/* Range visualization */}
                  <div className="relative pt-6 pb-2">
                    <div className="h-3 bg-gradient-to-r from-amber-400 via-success to-info rounded-full" />
                    <div className="absolute top-0 left-0 text-xs text-muted-foreground">
                      {formatCurrency(salaryRange.min)}
                    </div>
                    <div className="absolute top-0 right-0 text-xs text-muted-foreground">
                      {formatCurrency(salaryRange.max)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-warning/10 border border-warning/20">
                      <p className="text-xs text-muted-foreground mb-1">25th Percentile</p>
                      <p className="text-lg font-bold text-warning">
                        {formatCurrency(salaryRange.percentile25)}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-xs text-muted-foreground mb-1">Median</p>
                      <p className="text-xl font-bold text-success">
                        {formatCurrency(salaryRange.median)}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-info/10 border border-info/20">
                      <p className="text-xs text-muted-foreground mb-1">75th Percentile</p>
                      <p className="text-lg font-bold text-info">
                        {formatCurrency(salaryRange.percentile75)}
                      </p>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Based on {role} roles in {location} with {yearsExperience} years of experience.
                      Aim for the median ({formatCurrency(salaryRange.median)}) as a baseline, and the
                      75th percentile ({formatCurrency(salaryRange.percentile75)}) if you have strong
                      skills or competing offers.
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
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            {/* Add Offer Form */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Offer
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="mb-2 block">Company</Label>
                  <Input
                    value={newOffer.company || ""}
                    onChange={(e) => setNewOffer({ ...newOffer, company: e.target.value })}
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Base Salary</Label>
                  <Input
                    type="number"
                    value={newOffer.baseSalary || ""}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, baseSalary: parseInt(e.target.value) || undefined })
                    }
                    placeholder="e.g., 180000"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Signing Bonus</Label>
                  <Input
                    type="number"
                    value={newOffer.signingBonus || ""}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, signingBonus: parseInt(e.target.value) || undefined })
                    }
                    placeholder="e.g., 25000"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Annual Bonus</Label>
                  <Input
                    type="number"
                    value={newOffer.annualBonus || ""}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, annualBonus: parseInt(e.target.value) || undefined })
                    }
                    placeholder="e.g., 20000"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Equity Value (4yr)</Label>
                  <Input
                    type="number"
                    value={newOffer.equityValue || ""}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, equityValue: parseInt(e.target.value) || undefined })
                    }
                    placeholder="e.g., 200000"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addOffer}
                    disabled={!newOffer.company || !newOffer.baseSalary}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Offer
                  </Button>
                </div>
              </div>
            </div>

            {/* Offers List */}
            {offers.length > 0 && (
              <div className="rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Your Offers ({offers.length})
                  </h2>
                  {offers.length >= 2 && (
                    <Button onClick={compareOffers} size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Compare
                    </Button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offers.map((offer, index) => (
                    <div
                      key={offer.id}
                      className={cn(
                        "p-4 rounded-xl border relative",
                        comparison?.bestOverall === offer.company
                          ? "border-success bg-success/5"
                          : "bg-muted/30"
                      )}
                    >
                      {comparison?.bestOverall === offer.company && (
                        <div className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Best
                        </div>
                      )}
                      <button
                        onClick={() => removeOffer(offer.id)}
                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <h3 className="font-medium">{offer.company}</h3>
                      <p className="text-sm text-muted-foreground">{offer.role}</p>
                      <div className="mt-3 space-y-1 text-sm">
                        <p>Base: {formatCurrency(offer.baseSalary)}</p>
                        {offer.signingBonus && <p>Signing: {formatCurrency(offer.signingBonus)}</p>}
                        {offer.annualBonus && <p>Bonus: {formatCurrency(offer.annualBonus)}/yr</p>}
                        {offer.equityValue && <p>Equity: {formatCurrency(offer.equityValue)} (4yr)</p>}
                      </div>
                      {comparison && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">Total Annual Comp</p>
                          <p className="font-bold text-lg">
                            {formatCurrency(
                              comparison.ranked.find((r) => r.offer.id === offer.id)?.totalComp
                                .totalAnnual || 0
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rank: #{comparison.ranked.find((r) => r.offer.id === offer.id)?.rank}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {offers.length === 0 && (
              <div className="rounded-2xl border bg-card p-12 text-center">
                <div className="p-4 rounded-full bg-muted text-muted-foreground inline-block mb-4">
                  <Building2 className="h-8 w-8" />
                </div>
                <p className="text-muted-foreground">
                  Add at least 2 offers to compare total compensation
                </p>
              </div>
            )}
          </div>
        )}

        {/* Negotiate Tab */}
        {activeTab === "negotiate" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Generate Negotiation Script
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Company</Label>
                  <Input
                    value={negotiateCompany}
                    onChange={(e) => setNegotiateCompany(e.target.value)}
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Role</Label>
                  <Select value={negotiateRole} onValueChange={setNegotiateRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Current Offer</Label>
                  <Input
                    type="number"
                    value={currentOffer}
                    onChange={(e) => setCurrentOffer(e.target.value)}
                    placeholder="e.g., 150000"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Your Target</Label>
                  <Input
                    type="number"
                    value={targetSalary}
                    onChange={(e) => setTargetSalary(e.target.value)}
                    placeholder="e.g., 175000"
                  />
                </div>

                <Button
                  onClick={generateNegotiationScript}
                  disabled={!negotiateCompany || !currentOffer || !targetSalary || generatingScript}
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

            {/* Script */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">Your Negotiation Script</h2>
                {script && (
                  <Button variant="outline" size="sm" onClick={copyScript}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>

              {script ? (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  <div>
                    <h3 className="text-sm font-medium text-primary mb-2">Opening</h3>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{script.opening}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-primary mb-2">Value Points</h3>
                    <ul className="space-y-2">
                      {script.valuePoints.map((point, i) => (
                        <li key={i} className="text-sm bg-muted/50 p-3 rounded-lg flex items-start gap-2">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                            {i + 1}
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-primary mb-2">The Ask</h3>
                    <p className="text-sm bg-success/10 border border-success/20 p-3 rounded-lg">
                      {script.theAsk}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-primary mb-2">Handling Pushback</h3>
                    <div className="space-y-3">
                      {script.pushbackResponses.map((pr, i) => (
                        <div key={i} className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">If they say:</p>
                          <p className="text-sm font-medium mb-2">&ldquo;{pr.objection}&rdquo;</p>
                          <p className="text-xs text-muted-foreground mb-1">You respond:</p>
                          <p className="text-sm">{pr.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-primary mb-2">Close</h3>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{script.close}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-muted text-muted-foreground mb-4">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground">
                    Enter offer details to generate your personalized negotiation script
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
