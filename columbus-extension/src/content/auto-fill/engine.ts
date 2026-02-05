// Auto-fill engine orchestrator

import type { DetectedField } from '@/shared/types';
import { FieldDetector } from './field-detector';
import { FieldMapper } from './field-mapper';

export interface FillResult {
  filled: number;
  skipped: number;
  errors: number;
  details: Array<{
    fieldType: string;
    filled: boolean;
    error?: string;
  }>;
}

export class AutoFillEngine {
  private detector: FieldDetector;
  private mapper: FieldMapper;

  constructor(detector: FieldDetector, mapper: FieldMapper) {
    this.detector = detector;
    this.mapper = mapper;
  }

  async fillForm(fields: DetectedField[]): Promise<FillResult> {
    const result: FillResult = {
      filled: 0,
      skipped: 0,
      errors: 0,
      details: [],
    };

    for (const field of fields) {
      try {
        const value = this.mapper.mapFieldToValue(field);

        if (!value) {
          result.skipped++;
          result.details.push({
            fieldType: field.fieldType,
            filled: false,
          });
          continue;
        }

        const filled = await this.fillField(field.element, value);

        if (filled) {
          result.filled++;
          result.details.push({
            fieldType: field.fieldType,
            filled: true,
          });
        } else {
          result.skipped++;
          result.details.push({
            fieldType: field.fieldType,
            filled: false,
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

  private async fillField(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value: string
  ): Promise<boolean> {
    const tagName = element.tagName.toLowerCase();
    const inputType = (element as HTMLInputElement).type?.toLowerCase() || 'text';

    // Handle different input types
    if (tagName === 'select') {
      return this.fillSelect(element as HTMLSelectElement, value);
    }

    if (tagName === 'textarea') {
      return this.fillTextInput(element as HTMLTextAreaElement, value);
    }

    if (tagName === 'input') {
      switch (inputType) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
        case 'number':
          return this.fillTextInput(element as HTMLInputElement, value);

        case 'checkbox':
          return this.fillCheckbox(element as HTMLInputElement, value);

        case 'radio':
          return this.fillRadio(element as HTMLInputElement, value);

        case 'date':
          return this.fillDateInput(element as HTMLInputElement, value);

        default:
          return this.fillTextInput(element as HTMLInputElement, value);
      }
    }

    return false;
  }

  private fillTextInput(element: HTMLInputElement | HTMLTextAreaElement, value: string): boolean {
    // Focus the element
    element.focus();

    // Clear existing value
    element.value = '';

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
      (opt) => opt.value.toLowerCase() === normalizedValue || opt.text.toLowerCase() === normalizedValue
    );

    // Try partial match
    if (!matchingOption) {
      matchingOption = options.find(
        (opt) =>
          opt.value.toLowerCase().includes(normalizedValue) ||
          opt.text.toLowerCase().includes(normalizedValue) ||
          normalizedValue.includes(opt.value.toLowerCase()) ||
          normalizedValue.includes(opt.text.toLowerCase())
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
    const shouldCheck = ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
    element.checked = shouldCheck;
    this.dispatchInputEvents(element);
    return true;
  }

  private fillRadio(element: HTMLInputElement, value: string): boolean {
    const normalizedValue = value.toLowerCase();

    // Find the radio group
    const name = element.name;
    if (!name) return false;

    const radios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);

    for (const radio of radios) {
      const radioInput = radio as HTMLInputElement;
      const radioValue = radioInput.value.toLowerCase();
      const radioLabel = this.getRadioLabel(radioInput)?.toLowerCase() || '';

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
    const formatted = date.toISOString().split('T')[0];
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
    const parent = radio.closest('label');
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
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    // For React controlled components
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter && element instanceof HTMLInputElement) {
      const value = element.value;
      nativeInputValueSetter.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
