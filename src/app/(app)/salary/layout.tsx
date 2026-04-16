import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("salary");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
