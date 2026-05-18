// Auto-fill engine orchestrator

import type { DetectedField } from "@/shared/types";
import { FieldDetector } from "./field-detector";
import { FieldMapper } from "./field-mapper";
import {
  applyYellowMarker,
  classifyConfidence,
  createColdBadge,
  showColdPopover,
  type ColdCandidate,
  type ConfidenceZone,
} from "../ui/confidence-band";

export interface FillResult {
  filled: number;
  skipped: number;
  errors: number;
  alreadyFilled: number;
  conflicts: number;
  /** Count of fields placed in the cold zone (skipped fill, badge attached). */
  cold: number;
  /** Count of fields filled with a yellow-band marker. */
  yellow: number;
  details: Array<{
    fieldType: string;
    filled: boolean;
    alreadyFilled?: boolean;
    conflict?: FillConflict;
    overwritten?: boolean;
    zone?: ConfidenceZone;
    error?: string;
  }>;
}

export interface FillConflict {
  fieldType: string;
  currentValue: string;
  suggestedValue: string;
  label?: string;
}

/**
 * Optional per-field callback fired when a field has been filled successfully.
 * Used by the corrections tracker (#33) to register the original suggestion
 * so later edits can be diff'd against it.
 */
export type OnFilledCallback = (info: {
  field: DetectedField;
  value: string;
}) => void;

export interface FillFormOptions {
  /**
   * Cold-zone floor. Fields with confidence below this value are ignored
   * entirely (no fill, no badge). Mirrors `settings.minimumConfidence`.
   * Defaults to 0 so callers without settings still see the cold badge.
   */
  minimumConfidence?: number;
  /** Fired after each successful fill (corrections tracking — #33). */
  onFilled?: OnFilledCallback;
  /** When true, non-empty fields may be replaced by Slothing suggestions. */
  overwriteExisting?: boolean;
}

export class AutoFillEngine {
  private detector: FieldDetector;
  private mapper: FieldMapper;

  constructor(detector: FieldDetector, mapper: FieldMapper) {
    this.detector = detector;
    this.mapper = mapper;
  }

  async fillForm(
    fields: DetectedField[],
    options: FillFormOptions = {},
  ): Promise<FillResult> {
    const result: FillResult = {
      filled: 0,
      skipped: 0,
      errors: 0,
      alreadyFilled: 0,
      conflicts: 0,
      cold: 0,
      yellow: 0,
      details: [],
    };

    const minimumConfidence = options.minimumConfidence ?? 0;

    for (const field of fields) {
      try {
        const value = this.mapper.mapFieldToValue(field);
        const zone = classifyConfidence(field.confidence);

        if (zone === "cold") {
          // Cold zone: don't fill. Optionally add a "?" badge so the user can
          // pick from candidates. Fields below the minimumConfidence floor get
          // no badge either (existing semantics: settings.minimumConfidence is
          // now the cold-zone floor).
          result.skipped++;
          result.details.push({
            fieldType: field.fieldType,
            filled: false,
            zone,
          });
          if (field.confidence >= minimumConfidence && value) {
            this.attachColdBadge(field, value);
            result.cold++;
          }
          continue;
        }

        if (!value) {
          result.skipped++;
          result.details.push({
            fieldType: field.fieldType,
            filled: false,
            zone,
          });
          continue;
        }

        const currentValue = this.getCurrentValue(field.element);
        const hadExistingValue = this.hasMeaningfulExistingValue(field.element);
        const wouldOverwriteExisting =
          hadExistingValue &&
          !this.valuesEquivalent(field.element, currentValue, value);
        if (hadExistingValue) {
          if (this.valuesEquivalent(field.element, currentValue, value)) {
            result.alreadyFilled++;
            result.skipped++;
            result.details.push({
              fieldType: field.fieldType,
              filled: false,
              alreadyFilled: true,
              zone,
            });
            continue;
          }

          const conflict: FillConflict = {
            fieldType: field.fieldType,
            currentValue,
            suggestedValue: value,
            label: field.label,
          };

          if (!options.overwriteExisting) {
            result.conflicts++;
            result.skipped++;
            result.details.push({
              fieldType: field.fieldType,
              filled: false,
              conflict,
              zone,
            });
            continue;
          }
        }

        const filled = await this.fillField(field.element, value);

        if (filled) {
          result.filled++;
          result.details.push({
            fieldType: field.fieldType,
            filled: true,
            overwritten: options.overwriteExisting && wouldOverwriteExisting,
            zone,
          });
          if (zone === "yellow") {
            applyYellowMarker(field.element);
            result.yellow++;
          }
          try {
            options.onFilled?.({ field, value });
          } catch (cbErr) {
            console.error("[Slothing] onFilled callback failed:", cbErr);
          }
        } else {
          result.skipped++;
          result.details.push({
            fieldType: field.fieldType,
            filled: false,
            zone,
          });
        }
      } catch (err) {
        result.errors++;
        result.details.push({
          fieldType: field.fieldType,
          filled: false,
          error: (err as Error).message,
        });
      }
    }

    return result;
  }

  private attachColdBadge(field: DetectedField, primary: string): void {
    if (typeof document === "undefined") return;
    const anchor = field.element;
    if (!anchor.parentElement) return;

    // De-dupe: if a badge already exists for this field, leave it alone.
    const existing = anchor.parentElement.querySelector(
      `[data-slothing-badge-for="${cssEscape(fieldKey(field))}"]`,
    );
    if (existing) return;

    const candidates: ColdCandidate[] = [
      { label: field.fieldType, value: primary },
    ];

    const badge = createColdBadge({
      candidateCount: candidates.length,
      onPick: () => {
        showColdPopover({
          anchor: badge,
          candidates,
          onSelect: (chosen) => {
            void this.fillField(anchor, chosen);
          },
        });
      },
    });
    badge.setAttribute("data-slothing-badge-for", fieldKey(field));

    // Place the badge in a small wrapper so it can be positioned next to the
    // field without disturbing the host layout. If the field already has a
    // positioned parent, append directly.
    anchor.parentElement.appendChild(badge);
  }

  private async fillField(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value: string,
  ): Promise<boolean> {
    const tagName = element.tagName.toLowerCase();
    const inputType =
      (element as HTMLInputElement).type?.toLowerCase() || "text";

    // Handle different input types
    if (tagName === "select") {
      return this.fillSelect(element as HTMLSelectElement, value);
    }

    if (tagName === "textarea") {
      return this.fillTextInput(element as HTMLTextAreaElement, value);
    }

    if (tagName === "input") {
      switch (inputType) {
        case "text":
        case "email":
        case "tel":
        case "url":
        case "number":
          return this.fillTextInput(element as HTMLInputElement, value);

        case "checkbox":
          return this.fillCheckbox(element as HTMLInputElement, value);

        case "radio":
          return this.fillRadio(element as HTMLInputElement, value);

        case "date":
          return this.fillDateInput(element as HTMLInputElement, value);

        default:
          return this.fillTextInput(element as HTMLInputElement, value);
      }
    }

    return false;
  }

  private getCurrentValue(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  ): string {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "select") {
      const select = element as HTMLSelectElement;
      const option = select.selectedOptions[0];
      return option?.value || option?.text || "";
    }

    if (element instanceof HTMLInputElement) {
      const type = element.type?.toLowerCase() || "text";
      if (type === "checkbox") {
        return element.checked ? "true" : "false";
      }
      if (type === "radio") {
        const selected = element.name
          ? document.querySelector<HTMLInputElement>(
              `input[type="radio"][name="${cssEscape(element.name)}"]:checked`,
            )
          : element.checked
            ? element
            : null;
        return selected?.value || "";
      }
    }

    return element.value || "";
  }

  private hasMeaningfulExistingValue(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  ): boolean {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "select") {
      return Boolean((element as HTMLSelectElement).value.trim());
    }

    if (element instanceof HTMLInputElement) {
      const type = element.type?.toLowerCase() || "text";
      if (type === "checkbox") return element.checked;
      if (type === "radio") {
        if (!element.name) return element.checked;
        return Boolean(
          document.querySelector(
            `input[type="radio"][name="${cssEscape(element.name)}"]:checked`,
          ),
        );
      }
    }

    return element.value.trim().length > 0;
  }

  private valuesEquivalent(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    current: string,
    suggested: string,
  ): boolean {
    const normalizedCurrent = normalizeValue(current);
    const normalizedSuggested = normalizeValue(suggested);
    if (normalizedCurrent === normalizedSuggested) return true;

    if (element instanceof HTMLSelectElement) {
      const option = element.selectedOptions[0];
      return Boolean(
        option &&
        (normalizeValue(option.value) === normalizedSuggested ||
          normalizeValue(option.text) === normalizedSuggested),
      );
    }

    if (element instanceof HTMLInputElement) {
      const type = element.type?.toLowerCase() || "text";
      if (type === "checkbox") {
        return element.checked === parseBooleanSuggestion(suggested);
      }
      if (type === "radio") {
        const selected = element.name
          ? document.querySelector<HTMLInputElement>(
              `input[type="radio"][name="${cssEscape(element.name)}"]:checked`,
            )
          : element.checked
            ? element
            : null;
        if (!selected) return false;
        const label = this.getRadioLabel(selected) || "";
        return (
          normalizeValue(selected.value) === normalizedSuggested ||
          normalizeValue(label).includes(normalizedSuggested) ||
          normalizedSuggested.includes(normalizeValue(selected.value))
        );
      }
    }

    return false;
  }

  private fillTextInput(
    element: HTMLInputElement | HTMLTextAreaElement,
    value: string,
  ): boolean {
    // Focus the element
    element.focus();

    // Clear existing value
    element.value = "";

    // Set new value
    element.value = value;

    // Dispatch events to trigger validation and frameworks
    this.dispatchInputEvents(element);

    return element.value === value;
  }

  private fillSelect(element: HTMLSelectElement, value: string): boolean {
    const options = Array.from(element.options);
    const normalizedValue = value.toLowerCase();

    // Try exact match first
    let matchingOption = options.find(
      (opt) =>
        opt.value.toLowerCase() === normalizedValue ||
        opt.text.toLowerCase() === normalizedValue,
    );

    // Try partial match
    if (!matchingOption) {
      matchingOption = options.find(
        (opt) =>
          opt.value.toLowerCase().includes(normalizedValue) ||
          opt.text.toLowerCase().includes(normalizedValue) ||
          normalizedValue.includes(opt.value.toLowerCase()) ||
          normalizedValue.includes(opt.text.toLowerCase()),
      );
    }

    if (matchingOption) {
      element.value = matchingOption.value;
      this.dispatchInputEvents(element);
      return true;
    }

    return false;
  }

  private fillCheckbox(element: HTMLInputElement, value: string): boolean {
    const shouldCheck = parseBooleanSuggestion(value);
    element.checked = shouldCheck;
    this.dispatchInputEvents(element);
    return true;
  }

  private fillRadio(element: HTMLInputElement, value: string): boolean {
    const normalizedValue = value.toLowerCase();

    // Find the radio group
    const name = element.name;
    if (!name) return false;

    const radios = document.querySelectorAll(
      `input[type="radio"][name="${name}"]`,
    );

    for (const radio of radios) {
      const radioInput = radio as HTMLInputElement;
      const radioValue = radioInput.value.toLowerCase();
      const radioLabel = this.getRadioLabel(radioInput)?.toLowerCase() || "";

      if (
        radioValue === normalizedValue ||
        radioLabel.includes(normalizedValue) ||
        normalizedValue.includes(radioValue)
      ) {
        radioInput.checked = true;
        this.dispatchInputEvents(radioInput);
        return true;
      }
    }

    return false;
  }

  private fillDateInput(element: HTMLInputElement, value: string): boolean {
    // Try to parse and format the date
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;

    // Format as YYYY-MM-DD for date input
    const formatted = date.toISOString().split("T")[0];
    element.value = formatted;
    this.dispatchInputEvents(element);
    return true;
  }

  private getRadioLabel(radio: HTMLInputElement): string | null {
    // Check for associated label
    if (radio.id) {
      const label = document.querySelector(`label[for="${radio.id}"]`);
      if (label) return label.textContent?.trim() || null;
    }

    // Check for wrapping label
    const parent = radio.closest("label");
    if (parent) {
      return parent.textContent?.trim() || null;
    }

    // Check for next sibling text
    const next = radio.nextSibling;
    if (next?.nodeType === Node.TEXT_NODE) {
      return next.textContent?.trim() || null;
    }

    return null;
  }

  private dispatchInputEvents(element: HTMLElement): void {
    // Dispatch events in order that most frameworks expect
    element.dispatchEvent(new Event("focus", { bubbles: true }));
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));

    // For React controlled components
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;

    if (nativeInputValueSetter && element instanceof HTMLInputElement) {
      const value = element.value;
      nativeInputValueSetter.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseBooleanSuggestion(value: string): boolean {
  return ["true", "yes", "1", "on"].includes(value.trim().toLowerCase());
}

function fieldKey(field: DetectedField): string {
  // Stable per-field marker so repeat fills don't stack badges.
  const el = field.element;
  return el.id || el.name || `${field.fieldType}-${el.tagName}`;
}

function cssEscape(value: string): string {
  // Minimal escape sufficient for attribute selectors built from element ids /
  // names. Avoids pulling in a polyfill for environments without CSS.escape.
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/(["\\\[\]])/g, "\\$1");
}
