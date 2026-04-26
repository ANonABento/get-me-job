import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("studio");

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
