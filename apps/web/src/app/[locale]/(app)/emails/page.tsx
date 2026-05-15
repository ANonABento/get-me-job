import { redirect } from "next/navigation";

export default function EmailsCompatibilityPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/toolkit?tab=email`);
}
