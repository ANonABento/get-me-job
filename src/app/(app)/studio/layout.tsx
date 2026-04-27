import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("studio");

<<<<<<< HEAD
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
=======
export default function Layout({ children }: { children: React.ReactNode }) {
>>>>>>> 0e974c5 (Consolidate document routes into studio)
  return children;
}
