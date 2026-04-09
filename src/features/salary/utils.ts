import { formatCurrency } from "@/lib/salary/calculator";
import type { NegotiationScript } from "@/features/salary/types";

export function buildNegotiationScriptText(script: NegotiationScript): string {
  return `
OPENING:
${script.opening}

VALUE POINTS:
${script.valuePoints.map((point, index) => `${index + 1}. ${point}`).join("\n")}

THE ASK:
${script.theAsk}

HANDLING PUSHBACK:
${script.pushbackResponses
  .map((entry) => `Q: "${entry.objection}"\nA: "${entry.response}"`)
  .join("\n\n")}

CLOSE:
${script.close}
  `.trim();
}

export function getSalaryRangeInsight(params: {
  location: string;
  range: {
    median: number;
    percentile75: number;
  };
  role: string;
  yearsExperience: string;
}) {
  const { location, range, role, yearsExperience } = params;

  return `Based on ${role} roles in ${location} with ${yearsExperience} years of experience. Aim for the median (${formatCurrency(range.median)}) as a baseline, and the 75th percentile (${formatCurrency(range.percentile75)}) if you have strong skills or competing offers.`;
}

