"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";
import { CompanyResearchCard } from "@/components/research/company-research-card";
import type { JobDescription } from "@/types";

export default function CompanyResearchPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch job");
        }
        setJob(data.job);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading research...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Link>
          <div className="rounded-2xl border bg-card p-12 text-center">
            <p className="text-red-500">{error || "Job not found"}</p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Opportunities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="hero-gradient border-b">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{job.company}</h1>
              <p className="text-muted-foreground">{job.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Research Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <CompanyResearchCard companyName={job.company} jobId={jobId} />
      </div>
    </div>
  );
}
