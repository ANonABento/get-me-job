import { redirect } from "next/navigation";

interface BuilderRedirectPageProps {
  searchParams?: {
    mode?: string | string[];
  };
}

export default function BuilderRedirectPage(
  _props: BuilderRedirectPageProps
) {
  redirect("/studio");
}
