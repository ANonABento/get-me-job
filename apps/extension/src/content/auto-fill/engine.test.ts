// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import type { DetectedField } from "@/shared/types";
import { AutoFillEngine } from "./engine";

function field(
  element: DetectedField["element"],
  fieldType: DetectedField["fieldType"] = "firstName",
): DetectedField {
  return {
    element,
    fieldType,
    confidence: 1,
    label: "First name",
  };
}

function engineFor(value: string) {
  return new AutoFillEngine(
    {} as never,
    {
      mapFieldToValue: () => value,
    } as never,
  );
}

describe("AutoFillEngine overwrite safety", () => {
  it("fills empty text inputs", async () => {
    document.body.innerHTML = `<input id="firstName" />`;
    const input = document.querySelector<HTMLInputElement>("#firstName")!;

    const result = await engineFor("Riley").fillForm([field(input)]);

    expect(input.value).toBe("Riley");
    expect(result.filled).toBe(1);
    expect(result.conflicts).toBe(0);
  });

  it("does not clear a non-empty text input by default", async () => {
    document.body.innerHTML = `<input id="firstName" value="Alex" />`;
    const input = document.querySelector<HTMLInputElement>("#firstName")!;
    const onFilled = vi.fn();

    const result = await engineFor("Riley").fillForm([field(input)], {
      onFilled,
    });

    expect(input.value).toBe("Alex");
    expect(result.filled).toBe(0);
    expect(result.conflicts).toBe(1);
    expect(result.details[0]?.conflict).toMatchObject({
      currentValue: "Alex",
      suggestedValue: "Riley",
    });
    expect(onFilled).not.toHaveBeenCalled();
  });

  it("overwrites a non-empty text input only when requested", async () => {
    document.body.innerHTML = `<input id="firstName" value="Alex" />`;
    const input = document.querySelector<HTMLInputElement>("#firstName")!;

    const result = await engineFor("Riley").fillForm([field(input)], {
      overwriteExisting: true,
    });

    expect(input.value).toBe("Riley");
    expect(result.filled).toBe(1);
    expect(result.details[0]?.overwritten).toBe(true);
  });

  it("counts exact existing matches as already filled without rewriting", async () => {
    document.body.innerHTML = `<input id="firstName" value="Riley" />`;
    const input = document.querySelector<HTMLInputElement>("#firstName")!;
    const onFilled = vi.fn();

    const result = await engineFor("Riley").fillForm([field(input)], {
      onFilled,
    });

    expect(result.alreadyFilled).toBe(1);
    expect(result.conflicts).toBe(0);
    expect(onFilled).not.toHaveBeenCalled();
  });

  it("preserves existing select values by default", async () => {
    document.body.innerHTML = `
      <select id="country">
        <option value="">Select...</option>
        <option value="US" selected>United States</option>
        <option value="CA">Canada</option>
      </select>
    `;
    const select = document.querySelector<HTMLSelectElement>("#country")!;

    const result = await engineFor("Canada").fillForm([
      field(select, "country"),
    ]);

    expect(select.value).toBe("US");
    expect(result.conflicts).toBe(1);
  });

  it("preserves existing radio choices by default", async () => {
    document.body.innerHTML = `
      <label><input type="radio" name="workAuth" value="yes" checked /> Yes</label>
      <label><input type="radio" name="workAuth" value="no" /> No</label>
    `;
    const first = document.querySelector<HTMLInputElement>(
      'input[name="workAuth"]',
    )!;

    const result = await engineFor("no").fillForm([
      field(first, "workAuthorization"),
    ]);

    expect(
      document.querySelector<HTMLInputElement>(
        'input[name="workAuth"][value="yes"]',
      )?.checked,
    ).toBe(true);
    expect(result.conflicts).toBe(1);
  });
});
