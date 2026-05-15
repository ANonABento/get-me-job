import { ShieldCheck } from "lucide-react";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { getLocalizedPageMetadata } from "@/lib/seo";
import { AtsScannerPanel } from "./_components/ats-scanner-panel";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("ats", params.locale);
}

interface AtsPageProps {
  params: {
    locale: string;
  };
}

export default function AtsPage({ params }: AtsPageProps) {
  return (
    <AppPage>
      <PageHeader
        icon={ShieldCheck}
        title="ATS Scanner"
        description="Score a resume against an ATS rubric and (optionally) a job description. Save scans to your history so you can compare versions over time."
      />
      <PageContent>
        <AtsScannerPanel locale={params.locale} />
      </PageContent>
    </AppPage>
  );
}
