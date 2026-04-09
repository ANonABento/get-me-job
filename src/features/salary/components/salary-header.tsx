import Link from "next/link";
import { ArrowLeft, DollarSign } from "lucide-react";

export function SalaryHeader() {
  return (
    <div className="hero-gradient border-b">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-4 animate-in">
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
  );
}

