import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("emails");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
