export interface AnalyticsSkillsSummary {
  total: number;
}

export function shouldShowSkillsOverview(
  skills: AnalyticsSkillsSummary,
): boolean {
  return skills.total > 0;
}

export function getPipelineSkillsGridClass(
  showSkillsOverview: boolean,
): string {
  return showSkillsOverview ? "grid gap-6 lg:grid-cols-2" : "grid gap-6";
}
