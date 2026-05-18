"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { CompanyEnrichmentDossier } from "@/components/research/company-enrichment-dossier";
import { OpportunityResearchSkeleton } from "@/components/skeletons/opportunity-research-skeleton";
import { Button } from "@/components/ui/button";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { ErrorEmptyState } from "@/components/ui/empty-states";
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
        const res = await fetch(`/api/opportunities/${jobId}`);
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
    return <OpportunityResearchSkeleton />;
  }

  if (error || !job) {
    return (
      <AppPage>
        <PageContent>
          <ErrorEmptyState
            title={error || "Opportunity not found"}
            description="Research needs an active opportunity. Open the tracker and choose a saved role."
            action={
              <Button asChild variant="outline">
                <Link href="/opportunities">Open Opportunities</Link>
              </Button>
            }
          />
        </PageContent>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        icon={Briefcase}
        title={job.company}
        variant="compact"
        meta={<span>· {job.title}</span>}
      />

      <PageContent>
        <CompanyEnrichmentDossier jobId={jobId} companyName={job.company} />
      </PageContent>
    </AppPage>
  );
}
