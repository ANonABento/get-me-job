import { redirect } from "next/navigation";

export default function CoverLetterRedirectPage() {
  redirect("/studio?mode=cover-letter");
}
