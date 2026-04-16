import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("interview");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
