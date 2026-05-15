import { redirect } from "next/navigation";

export default function SalaryCompatibilityPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/toolkit?tab=salary`);
}
