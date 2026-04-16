import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("calendar");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
