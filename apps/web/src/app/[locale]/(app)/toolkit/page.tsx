import { Wrench } from "lucide-react";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { ToolkitTabs } from "./_components/toolkit-tabs";

export default function ToolkitPage() {
  return (
    <AppPage>
      <PageHeader
        icon={Wrench}
        title="Toolkit"
        description="Quick-reach tools for the offer and comms phase — email templates for the outbox, salary research for the table."
      />
      <PageContent>
        <ToolkitTabs />
      </PageContent>
    </AppPage>
  );
}
