// Field detection for auto-fill

import type { DetectedField, FieldType, FieldSignals } from '@/shared/types';
import { FIELD_PATTERNS, CUSTOM_QUESTION_INDICATORS } from '@/shared/field-patterns';

export class FieldDetector {
  detectFields(form: HTMLFormElement): DetectedField[] {
    const fields: DetectedField[] = [];
    const inputs = form.querySelectorAll('input, textarea, select');

    for (const input of inputs) {
      const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

      // Skip hidden, disabled, or submit inputs
      if (this.shouldSkipElement(element)) continue;

      const detection = this.detectFieldType(element);
      if (detection.fieldType !== 'unknown' || detection.confidence > 0.1) {
        fields.push(detection);
      }
    }

    return fields;
  }

  private shouldSkipElement(element: HTMLElement): boolean {
    const input = element as HTMLInputElement;

    // Check computed style for visibility
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }

    // Check disabled state
    if (input.disabled) return true;

    // Check input type
    const skipTypes = ['hidden', 'submit', 'button', 'reset', 'image', 'file'];
    if (skipTypes.includes(input.type)) return true;

    // Check if it's a CSRF/token field
    if (input.name?.includes('csrf') || input.name?.includes('token')) {
      return true;
    }

    return false;
  }

  detectFieldType(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): DetectedField {
    const signals = this.gatherSignals(element);
    const scores = this.scoreAllPatterns(signals);

    // Get best match
    scores.sort((a, b) => b.confidence - a.confidence);
    const best = scores[0];

    // Determine if this is a custom question
    let fieldType: FieldType = best?.fieldType || 'unknown';
    let confidence = best?.confidence || 0;

    if (confidence < 0.3) {
      // Check if it looks like a custom question
      if (this.looksLikeCustomQuestion(signals)) {
        fieldType = 'customQuestion';
        confidence = 0.5;
      }
    }

    return {
      element,
      fieldType,
      confidence,
      label: signals.label || undefined,
      placeholder: signals.placeholder || undefined,
    };
  }

  private gatherSignals(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldSignals {
    return {
      name: element.name?.toLowerCase() || '',
      id: element.id?.toLowerCase() || '',
      type: (element as HTMLInputElement).type || 'text',
      placeholder: (element as HTMLInputElement).placeholder?.toLowerCase() || '',
      autocomplete: element.autocomplete || '',
      label: this.findLabel(element)?.toLowerCase() || '',
      ariaLabel: element.getAttribute('aria-label')?.toLowerCase() || '',
      nearbyText: this.getNearbyText(element)?.toLowerCase() || '',
      parentClasses: this.getParentClasses(element),
    };
  }

  private scoreAllPatterns(signals: FieldSignals): Array<{ fieldType: FieldType; confidence: number }> {
    return FIELD_PATTERNS.map((pattern) => ({
      fieldType: pattern.type,
      confidence: this.calculateConfidence(signals, pattern),
    }));
  }

  private calculateConfidence(signals: FieldSignals, pattern: typeof FIELD_PATTERNS[0]): number {
    let score = 0;
    let maxScore = 0;

    // Weight different signals
    const weights = {
      autocomplete: 0.4,
      name: 0.2,
      id: 0.15,
      label: 0.15,
      placeholder: 0.1,
      ariaLabel: 0.1,
    };

    // Check autocomplete attribute (most reliable)
    if (signals.autocomplete && pattern.autocompleteValues?.includes(signals.autocomplete)) {
      score += weights.autocomplete;
    }
    maxScore += weights.autocomplete;

    // Check name attribute
    if (pattern.namePatterns?.some((p) => p.test(signals.name))) {
      score += weights.name;
    }
    maxScore += weights.name;

    // Check ID
    if (pattern.idPatterns?.some((p) => p.test(signals.id))) {
      score += weights.id;
    }
    maxScore += weights.id;

    // Check label
    if (pattern.labelPatterns?.some((p) => p.test(signals.label))) {
      score += weights.label;
    }
    maxScore += weights.label;

    // Check placeholder
    if (pattern.placeholderPatterns?.some((p) => p.test(signals.placeholder))) {
      score += weights.placeholder;
    }
    maxScore += weights.placeholder;

    // Check aria-label
    if (pattern.labelPatterns?.some((p) => p.test(signals.ariaLabel))) {
      score += weights.ariaLabel;
    }
    maxScore += weights.ariaLabel;

    // Negative signals (reduce confidence if found)
    if (
      pattern.negativePatterns?.some(
        (p) => p.test(signals.name) || p.test(signals.label) || p.test(signals.id)
      )
    ) {
      score -= 0.3;
    }

    return Math.max(0, maxScore > 0 ? score / maxScore : 0);
  }

  private findLabel(element: HTMLElement): string | null {
    // Method 1: Explicit label via for attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label?.textContent) return label.textContent.trim();
    }

    // Method 2: Wrapping label
    const parentLabel = element.closest('label');
    if (parentLabel?.textContent) {
      // Remove the input's value from label text
      const text = parentLabel.textContent.trim();
      const inputValue = (element as HTMLInputElement).value || '';
      return text.replace(inputValue, '').trim();
    }

    // Method 3: aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl?.textContent) return labelEl.textContent.trim();
    }

    // Method 4: Previous sibling label
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === 'LABEL') {
        return sibling.textContent?.trim() || null;
      }
      sibling = sibling.previousElementSibling;
    }

    // Method 5: Parent's previous sibling label
    const parent = element.parentElement;
    if (parent) {
      let parentSibling = parent.previousElementSibling;
      if (parentSibling?.tagName === 'LABEL') {
        return parentSibling.textContent?.trim() || null;
      }
    }

    return null;
  }

  private getNearbyText(element: HTMLElement): string | null {
    const parent = element.closest('.form-group, .field, .input-wrapper, [class*="field"], [class*="input"]');
    if (parent) {
      const text = parent.textContent?.trim();
      if (text && text.length < 200) return text;
    }
    return null;
  }

  private getParentClasses(element: HTMLElement): string[] {
    const classes: string[] = [];
    let current = element.parentElement;
    let depth = 0;

    while (current && depth < 3) {
      if (current.className) {
        classes.push(...current.className.split(' ').filter(Boolean));
      }
      current = current.parentElement;
      depth++;
    }

    return classes;
  }

  private looksLikeCustomQuestion(signals: FieldSignals): boolean {
    const text = `${signals.label} ${signals.placeholder} ${signals.nearbyText}`;
    return CUSTOM_QUESTION_INDICATORS.some((pattern) => pattern.test(text));
  }
}
