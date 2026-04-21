export interface QuickActionItem {
  title: string;
  description: string;
  href: string;
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
      gradient: "from-violet-500 to-purple-400",
    },
    {
      title: "Edit Profile",
      description: "Review and refine your career details",
      href: "/profile",
      gradient: "from-rose-400 to-orange-400",
    },
    {
      title: hasResumes
        ? `${resumesGenerated} Resume${resumesGenerated !== 1 ? "s" : ""} Built`
        : "Build a Resume",
      description: hasResumes
        ? "Generate more tailored resumes"
        : "Add a job to generate your first tailored resume",
      href: "/builder",
      gradient: "from-blue-500 to-indigo-400",
    },
  ];
}
