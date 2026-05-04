/**
 * Accessibility helper utilities used across the app and audit tooling.
 *
 * Shared constants:
 * - WCAG 2.1 AA touch-target floor (24x24 CSS px) per Success Criterion 2.5.8.
 * - Apple HIG / Material recommended minimum (44x44 CSS px) used internally
 *   for "comfortable" sizing. The app aims for the comfortable threshold but
 *   we accept anything >= the WCAG floor as compliant.
 */

export const TOUCH_TARGET_MIN_CSS_PX = 24;
export const TOUCH_TARGET_COMFORT_CSS_PX = 44;

export interface ElementBox {
  width: number;
  height: number;
}

export type TouchTargetVerdict = "pass" | "comfort-warning" | "fail";

export interface TouchTargetEvaluation {
  verdict: TouchTargetVerdict;
  reason: string;
}

export function evaluateTouchTarget(
  box: ElementBox | null | undefined,
): TouchTargetEvaluation {
  if (!box) {
    return {
      verdict: "fail",
      reason: "Element has no bounding box (not rendered or not visible)",
    };
  }

  const smallestSide = Math.min(box.width, box.height);

  if (smallestSide < TOUCH_TARGET_MIN_CSS_PX) {
    return {
      verdict: "fail",
      reason: `Smallest side ${smallestSide.toFixed(1)}px < WCAG 2.5.8 floor (${TOUCH_TARGET_MIN_CSS_PX}px)`,
    };
  }

  if (smallestSide < TOUCH_TARGET_COMFORT_CSS_PX) {
    return {
      verdict: "comfort-warning",
      reason: `Smallest side ${smallestSide.toFixed(1)}px < comfortable target (${TOUCH_TARGET_COMFORT_CSS_PX}px)`,
    };
  }

  return {
    verdict: "pass",
    reason: `Smallest side ${smallestSide.toFixed(1)}px meets ${TOUCH_TARGET_COMFORT_CSS_PX}px comfort target`,
  };
}

const HEADING_TAG_RE = /^H([1-6])$/i;

export interface HeadingDescriptor {
  level: number;
  text?: string;
}

export interface HeadingOrderIssue {
  index: number;
  level: number;
  previousLevel: number;
  text?: string;
}

export function parseHeadingLevel(tagName: string | null | undefined): number | null {
  if (!tagName) return null;
  const match = HEADING_TAG_RE.exec(tagName);
  if (!match) return null;
  return Number.parseInt(match[1]!, 10);
}

export function findHeadingOrderIssues(
  headings: HeadingDescriptor[],
): HeadingOrderIssue[] {
  const issues: HeadingOrderIssue[] = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    if (previousLevel > 0 && heading.level > previousLevel + 1) {
      issues.push({
        index,
        level: heading.level,
        previousLevel,
        text: heading.text,
      });
    }
    previousLevel = heading.level;
  });

  return issues;
}

export interface AccessibleNameInputs {
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  textContent?: string | null;
  title?: string | null;
}

export function hasAccessibleName(inputs: AccessibleNameInputs): boolean {
  const candidates = [
    inputs.ariaLabel,
    inputs.ariaLabelledBy,
    inputs.textContent,
    inputs.title,
  ];
  return candidates.some((value) => !!value && value.trim().length > 0);
}
