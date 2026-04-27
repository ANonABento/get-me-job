import { redirect } from "next/navigation";

export default function TailorRedirectPage() {
  redirect("/studio?mode=tailored");
}
