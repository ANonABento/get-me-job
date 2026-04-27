import { redirect } from "next/navigation";

interface BuilderRedirectPageProps {
  searchParams?: {
    mode?: string | string[];
  };
}

export default function BuilderRedirectPage({
  searchParams,
}: BuilderRedirectPageProps) {
  const mode = Array.isArray(searchParams?.mode)
    ? searchParams.mode[0]
    : searchParams?.mode;

  redirect(mode === "cover-letter" ? "/studio?mode=cover-letter" : "/studio");
}
