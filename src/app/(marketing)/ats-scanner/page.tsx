import type { Metadata } from "next";
import { ScannerForm } from "@/components/ats/scanner-form";
import { ShieldCheck, Zap, Eye, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker | Get Me Job",
  description:
    "Check your resume's ATS compatibility score for free. Get instant feedback on formatting, structure, content, and keyword optimization.",
  keywords: [
    "free ATS resume checker",
    "ATS score checker",
    "resume scanner",
    "applicant tracking system",
    "resume optimization",
  ],
  openGraph: {
    title: "Free ATS Resume Checker",
    description:
      "Instant ATS compatibility score with actionable improvement suggestions. No sign-up required.",
    type: "website",
  },
};

const BENEFITS = [
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get your ATS score in seconds, no signup required",
  },
  {
    icon: Eye,
    title: "Detailed Breakdown",
    description: "See exactly what ATS systems check for",
  },
  {
    icon: DollarSign,
    title: "100% Free",
    description: "No hidden fees, no credit card needed",
  },
];

export default function ATSScannerPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Free ATS Resume Scanner
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Over 75% of resumes are rejected by ATS before a human ever sees them.
            Check yours in seconds.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center p-4">
              <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="font-medium text-sm">{title}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
          ))}
        </div>

        {/* Scanner Form */}
        <ScannerForm />
      </div>
    </div>
  );
}
