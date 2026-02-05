// Detect and extract custom questions from forms

import { CUSTOM_QUESTION_INDICATORS } from '@/shared/field-patterns';

export interface DetectedQuestion {
  element: HTMLTextAreaElement | HTMLInputElement;
  question: string;
  type: 'short' | 'long';
}

export class QuestionDetector {
  /**
   * Find custom/open-ended questions in a form
   */
  detectQuestions(form: HTMLFormElement): DetectedQuestion[] {
    const questions: DetectedQuestion[] = [];

    // Look for textareas (typically long-form answers)
    const textareas = form.querySelectorAll('textarea');
    for (const textarea of textareas) {
      const question = this.extractQuestion(textarea as HTMLElement);
      if (question && this.isCustomQuestion(question)) {
        questions.push({
          element: textarea,
          question,
          type: 'long',
        });
      }
    }

    // Look for text inputs that might be short-answer questions
    const inputs = form.querySelectorAll('input[type="text"]');
    for (const input of inputs) {
      const question = this.extractQuestion(input as HTMLElement);
      if (question && this.isCustomQuestion(question)) {
        questions.push({
          element: input as HTMLInputElement,
          question,
          type: 'short',
        });
      }
    }

    return questions;
  }

  /**
   * Extract the question text associated with an input
   */
  private extractQuestion(element: HTMLElement): string | null {
    // Try label
    const label = this.findLabel(element);
    if (label && label.length > 10) return label;

    // Try aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.length > 10) return ariaLabel;

    // Try placeholder
    const placeholder = (element as HTMLInputElement).placeholder;
    if (placeholder && placeholder.length > 10) return placeholder;

    // Try nearby heading or paragraph
    const parent = element.closest('.form-group, .question, .field, [class*="question"]');
    if (parent) {
      const heading = parent.querySelector('h1, h2, h3, h4, h5, h6, p, label');
      if (heading?.textContent && heading.textContent.length > 10) {
        return heading.textContent.trim();
      }
    }

    return null;
  }

  /**
   * Find label element for an input
   */
  private findLabel(element: HTMLElement): string | null {
    // Explicit label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label?.textContent) return label.textContent.trim();
    }

    // Wrapping label
    const parentLabel = element.closest('label');
    if (parentLabel?.textContent) {
      const text = parentLabel.textContent.trim();
      const inputValue = (element as HTMLInputElement).value || '';
      return text.replace(inputValue, '').trim();
    }

    // aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl?.textContent) return labelEl.textContent.trim();
    }

    return null;
  }

  /**
   * Check if text looks like a custom/open-ended question
   */
  private isCustomQuestion(text: string): boolean {
    // Check against known patterns
    if (CUSTOM_QUESTION_INDICATORS.some((pattern) => pattern.test(text))) {
      return true;
    }

    // Check for question words/phrases
    const questionIndicators = [
      /^why\b/i,
      /^what\b/i,
      /^how\b/i,
      /^describe\b/i,
      /^tell\s+(us|me)\b/i,
      /^explain\b/i,
      /\?$/,
    ];

    return questionIndicators.some((pattern) => pattern.test(text));
  }
}
