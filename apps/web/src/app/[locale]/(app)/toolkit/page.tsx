import { Wrench } from "lucide-react";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { ToolkitTabs } from "./_components/toolkit-tabs";

export default function ToolkitPage() {
  return (
    <AppPage>
      <PageHeader
        icon={Wrench}
        title="Toolkit"
        description="Email, salary, and recruiter utilities for active opportunities."
        variant="compact"
      />
      <PageContent>
        <ToolkitTabs />
      </PageContent>
    </AppPage>
  );
}
