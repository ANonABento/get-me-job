/**
 * Auto-tag rules engine. Spec:
 * docs/opportunity-customization-spec.md §4 bucket E.
 *
 * Pure function — takes a freshly-imported opportunity + the user's
 * rules and returns the deduped list of tags to merge into the
 * opportunity's keywords. Caller is responsible for the merge + persist.
 *
 * Adding a trigger type: extend AUTO_TAG_TRIGGER_TYPES in
 * @slothing/shared/schemas + add a case below.
 */
import type {
  AutoTagTriggerType,
  OpportunityAutoTagRule,
} from "@slothing/shared/schemas";
import type { Opportunity } from "@/types/opportunity";

/**
 * Snapshot of the opportunity fields the rule engine reads. We pass a
 * narrow shape so we don't tightly couple to the full Opportunity
 * interface — easier to call from the import path where we have a
 * `JobDescription` rather than a hydrated `Opportunity`.
 */
export interface AutoTagInput {
  source?: string;
  title?: string;
  workTerm?: string;
  level?: string;
}

/**
 * Returns the deduped, ordered list of tags that should be applied to
 * this opportunity. Disabled rules are skipped. Tags from later rules
 * append after earlier ones; duplicates are removed but original order
 * is preserved.
 */
export function applyAutoTagRules(
  input: AutoTagInput,
  rules: readonly OpportunityAutoTagRule[],
): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (!ruleMatches(rule.trigger, rule.triggerValue, input)) continue;
    for (const raw of rule.tags) {
      const tag = raw.trim();
      if (!tag) continue;
      // Case-insensitive dedupe so "co-op" and "Co-op" don't both
      // attach. Persist the first-seen casing.
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags;
}

function ruleMatches(
  trigger: AutoTagTriggerType,
  triggerValue: string,
  input: AutoTagInput,
): boolean {
  const needle = triggerValue.trim();
  if (!needle) return false;
  switch (trigger) {
    case "source-equals":
      return (input.source ?? "").toLowerCase() === needle.toLowerCase();
    case "title-includes":
      return (input.title ?? "").toLowerCase().includes(needle.toLowerCase());
    case "work-term-includes":
      return (input.workTerm ?? "")
        .toLowerCase()
        .includes(needle.toLowerCase());
    case "level-equals":
      return (input.level ?? "").toLowerCase() === needle.toLowerCase();
    default: {
      // Exhaustiveness sentinel — every trigger in the union above must
      // be handled, otherwise TS narrows `trigger` to `never` here.
      const _exhaust: never = trigger;
      return _exhaust;
    }
  }
}

/**
 * Convenience for callers that have a full Opportunity in hand (e.g.
 * the review-queue "preview matches" button in the rules builder UI).
 */
export function applyAutoTagRulesToOpportunity(
  opportunity: Opportunity,
  rules: readonly OpportunityAutoTagRule[],
): string[] {
  return applyAutoTagRules(
    {
      source: opportunity.source,
      title: opportunity.title,
      workTerm: opportunity.workTerm,
      level: opportunity.level,
    },
    rules,
  );
}
