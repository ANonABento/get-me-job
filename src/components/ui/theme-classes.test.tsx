import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardDescription, CardTitle } from "./card";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";

describe("theme variable classes", () => {
  it("applies theme variables to Card surfaces and text", () => {
    render(
      <Card data-testid="card">
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card.className).toContain("rounded-[var(--radius)]");
    expect(card.className).toContain("border-[length:var(--border-width)]");
    expect(card.className).toContain("shadow-[var(--shadow-card)]");
    expect(card.className).toContain("[backdrop-filter:var(--backdrop-blur)]");
    expect(screen.getByText("Title").className).toContain(
      "[text-transform:var(--text-transform)]",
    );
    expect(screen.getByText("Description").className).toContain(
      "[letter-spacing:var(--letter-spacing)]",
    );
  });

  it("applies theme variables to Textarea and Label text controls", () => {
    render(
      <>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" data-testid="textarea" />
      </>,
    );

    expect(screen.getByText("Notes").className).toContain(
      "[letter-spacing:var(--letter-spacing)]",
    );
    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("rounded-[var(--radius)]");
    expect(textarea.className).toContain("border-[length:var(--border-width)]");
    expect(textarea.className).toContain(
      "[letter-spacing:var(--letter-spacing)]",
    );
  });

  it("applies theme variables to Select trigger and popover content", () => {
    render(
      <Select open value="one">
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent data-testid="content">
          <SelectItem value="one">One</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByTestId("trigger");
    expect(trigger.className).toContain("rounded-[var(--radius)]");
    expect(trigger.className).toContain("border-[length:var(--border-width)]");
    expect(trigger.className).toContain(
      "[letter-spacing:var(--letter-spacing)]",
    );

    const content = screen.getByTestId("content");
    expect(content.className).toContain("rounded-[var(--radius)]");
    expect(content.className).toContain("border-[length:var(--border-width)]");
    expect(content.className).toContain("shadow-[var(--shadow-elevated)]");
    expect(content.className).toContain(
      "[backdrop-filter:var(--backdrop-blur)]",
    );
  });
});
