import { FileText, Upload, type LucideIcon } from "lucide-react";

export interface QuickActionItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}

export interface QuickActionStats {
  documentsCount: number;
  resumesGenerated: number;
}

export function buildQuickActions(stats: QuickActionStats): QuickActionItem[] {
  const { documentsCount, resumesGenerated } = stats;
  const hasResumes = resumesGenerated > 0;

  return [
    {
      title: "Upload Resume",
      description: `${documentsCount} document${documentsCount !== 1 ? "s" : ""} uploaded`,
      href: "/bank",
      icon: Upload,
      gradient: "from-violet-500 to-purple-400",
    },
    {
      title: "Edit Profile",
      description: "Review and refine your career details",
      href: "/profile",
      icon: FileText,
      gradient: "from-rose-400 to-orange-400",
    },
    {
      title: hasResumes
        ? `${resumesGenerated} Resume${resumesGenerated !== 1 ? "s" : ""} Built`
        : "Open Document Studio",
      description: hasResumes
        ? "Build and export another resume"
        : "Build and export your first resume",
      href: "/studio",
      icon: FileText,
      gradient: "from-blue-500 to-indigo-400",
    },
  ];
}
