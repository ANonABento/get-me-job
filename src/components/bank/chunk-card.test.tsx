import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ChunkCard,
  getEntryTitle,
  getEntryPreview,
  listToText,
  textToList,
  cleanContent,
  CATEGORY_FIELDS,
} from "./chunk-card";
import type { BankEntry } from "@/types";

function makeBankEntry(overrides: Partial<BankEntry> = {}): BankEntry {
  return {
    id: "test-1",
    userId: "default",
    category: "experience",
    content: { title: "Engineer", company: "Acme Corp", description: "Built things" },
    confidenceScore: 0.9,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("getEntryTitle", () => {
  it("should return title at company for experience", () => {
    const entry = makeBankEntry({
      category: "experience",
      content: { title: "Engineer", company: "Acme" },
    });
    expect(getEntryTitle(entry)).toBe("Engineer at Acme");
  });

  it("should return degree — institution for education", () => {
    const entry = makeBankEntry({
      category: "education",
      content: { degree: "BS CS", institution: "MIT" },
    });
    expect(getEntryTitle(entry)).toBe("BS CS — MIT");
  });

  it("should return name for skill", () => {
    const entry = makeBankEntry({
      category: "skill",
      content: { name: "TypeScript" },
    });
    expect(getEntryTitle(entry)).toBe("TypeScript");
  });

  it("should return name for project", () => {
    const entry = makeBankEntry({
      category: "project",
      content: { name: "Cool App" },
    });
    expect(getEntryTitle(entry)).toBe("Cool App");
  });

  it("should return name — issuer for certification", () => {
    const entry = makeBankEntry({
      category: "certification",
      content: { name: "AWS Cert", issuer: "Amazon" },
    });
    expect(getEntryTitle(entry)).toBe("AWS Cert — Amazon");
  });

  it("should return description for achievement", () => {
    const entry = makeBankEntry({
      category: "achievement",
      content: { description: "Won hackathon" },
    });
    expect(getEntryTitle(entry)).toBe("Won hackathon");
  });

  it("should fallback gracefully for empty content", () => {
    const entry = makeBankEntry({ category: "skill", content: {} });
    expect(getEntryTitle(entry)).toBe("Skill");
  });
});

describe("getEntryPreview", () => {
  it("should show date range for experience", () => {
    const entry = makeBankEntry({
      category: "experience",
      content: { startDate: "2020", endDate: "2023", description: "Did things" },
    });
    const preview = getEntryPreview(entry);
    expect(preview).toContain("2020");
    expect(preview).toContain("2023");
    expect(preview).toContain("Did things");
  });

  it("should show Present for current experience", () => {
    const entry = makeBankEntry({
      category: "experience",
      content: { startDate: "2020", current: true },
    });
    expect(getEntryPreview(entry)).toContain("Present");
  });

  it("should show category and proficiency for skill", () => {
    const entry = makeBankEntry({
      category: "skill",
      content: { name: "Go", category: "technical", proficiency: "advanced" },
    });
    const preview = getEntryPreview(entry);
    expect(preview).toContain("technical");
    expect(preview).toContain("advanced");
  });

  it("should show description for project", () => {
    const entry = makeBankEntry({
      category: "project",
      content: { name: "App", description: "A cool project" },
    });
    expect(getEntryPreview(entry)).toContain("A cool project");
  });
});

describe("listToText", () => {
  it("should join array items with newlines", () => {
    expect(listToText(["a", "b", "c"])).toBe("a\nb\nc");
  });

  it("should return empty string for non-array", () => {
    expect(listToText("hello")).toBe("");
    expect(listToText(undefined)).toBe("");
    expect(listToText(null)).toBe("");
  });

  it("should return empty string for empty array", () => {
    expect(listToText([])).toBe("");
  });
});

describe("textToList", () => {
  it("should split text by newlines", () => {
    expect(textToList("a\nb\nc")).toEqual(["a", "b", "c"]);
  });

  it("should preserve empty lines", () => {
    expect(textToList("a\n\nc")).toEqual(["a", "", "c"]);
  });

  it("should handle single line", () => {
    expect(textToList("hello")).toEqual(["hello"]);
  });
});

describe("cleanContent", () => {
  it("should filter empty list items", () => {
    const fields = CATEGORY_FIELDS.experience;
    const content = { title: "Engineer", highlights: ["Built API", "", "Led team", ""] };
    const cleaned = cleanContent(content, fields);
    expect(cleaned.highlights).toEqual(["Built API", "Led team"]);
  });

  it("should trim text values", () => {
    const fields = CATEGORY_FIELDS.experience;
    const content = { title: "  Engineer  ", company: "Acme " };
    const cleaned = cleanContent(content, fields);
    expect(cleaned.title).toBe("Engineer");
    expect(cleaned.company).toBe("Acme");
  });

  it("should remove empty string values", () => {
    const fields = CATEGORY_FIELDS.experience;
    const content = { title: "Engineer", company: "", location: "" };
    const cleaned = cleanContent(content, fields);
    expect(cleaned.title).toBe("Engineer");
    expect(cleaned).not.toHaveProperty("company");
    expect(cleaned).not.toHaveProperty("location");
  });
});

describe("ChunkCard", () => {
  it("should render entry title and category badge", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Engineer at Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
  });

  it("should show high confidence badge when score >= 0.9", () => {
    const entry = makeBankEntry({ confidenceScore: 0.95 });
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("High confidence")).toBeInTheDocument();
  });

  it("should not show high confidence badge when score < 0.9", () => {
    const entry = makeBankEntry({ confidenceScore: 0.7 });
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText("High confidence")).not.toBeInTheDocument();
  });

  it("should expand on click and show content fields", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByText("Engineer at Acme Corp"));

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    // Should show structured field labels
    expect(screen.getByText(/Job Title:/)).toBeInTheDocument();
    expect(screen.getByText(/Company:/)).toBeInTheDocument();
  });

  it("should enter edit mode with structured fields", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    // Expand
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    // Edit
    fireEvent.click(screen.getByText("Edit"));

    // Should show labeled inputs for experience fields
    expect(screen.getByLabelText("Job Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();

    // Values should be populated
    expect(screen.getByLabelText("Job Title")).toHaveValue("Engineer");
    expect(screen.getByLabelText("Company")).toHaveValue("Acme Corp");
  });

  it("should save edited fields via onUpdate", () => {
    const onUpdate = vi.fn();
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={onUpdate} onDelete={vi.fn()} />);

    // Expand → Edit
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    fireEvent.click(screen.getByText("Edit"));

    // Change title
    fireEvent.change(screen.getByLabelText("Job Title"), {
      target: { value: "Senior Engineer" },
    });
    fireEvent.click(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith("test-1", expect.objectContaining({
      title: "Senior Engineer",
      company: "Acme Corp",
    }));
  });

  it("should cancel edit mode", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    // Expand -> Edit -> Cancel
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Cancel"));

    // Should be back to view mode with Edit button
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should require delete confirmation", () => {
    const onDelete = vi.fn();
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={onDelete} />);

    // Expand
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    // Click delete — should show confirmation
    fireEvent.click(screen.getByText("Delete"));

    expect(screen.getByText("Delete this entry?")).toBeInTheDocument();
    expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    // Should NOT have called onDelete yet
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("should call onDelete after confirmation", () => {
    const onDelete = vi.fn();
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={onDelete} />);

    // Expand → Delete → Confirm
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("Yes, Delete"));

    expect(onDelete).toHaveBeenCalledWith("test-1");
  });

  it("should cancel delete confirmation", () => {
    const onDelete = vi.fn();
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={onDelete} />);

    // Expand → Delete → Cancel
    fireEvent.click(screen.getByText("Engineer at Acme Corp"));
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("No"));

    // Should be back to normal view with Delete button
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("should render skill fields correctly in edit mode", () => {
    const entry = makeBankEntry({
      category: "skill",
      content: { name: "TypeScript", category: "technical", proficiency: "advanced" },
    });
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    // Expand → Edit
    fireEvent.click(screen.getByText("TypeScript"));
    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByLabelText("Skill Name")).toHaveValue("TypeScript");
    expect(screen.getByLabelText("Category")).toHaveValue("technical");
    expect(screen.getByLabelText("Proficiency")).toHaveValue("advanced");
  });

  it("should render checkbox when onToggleSelect is provided", () => {
    const entry = makeBankEntry();
    render(
      <ChunkCard
        entry={entry}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onToggleSelect={vi.fn()}
        selected={false}
        anySelected={false}
      />
    );
    expect(screen.getByRole("checkbox", { name: /Select Engineer at Acme Corp/ })).toBeInTheDocument();
  });

  it("should not render checkbox when onToggleSelect is not provided", () => {
    const entry = makeBankEntry();
    render(<ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("should call onToggleSelect when checkbox is clicked", () => {
    const onToggleSelect = vi.fn();
    const entry = makeBankEntry();
    render(
      <ChunkCard
        entry={entry}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onToggleSelect={onToggleSelect}
        selected={false}
        anySelected={false}
      />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggleSelect).toHaveBeenCalledWith("test-1");
  });

  it("should show checkbox as checked when selected", () => {
    const entry = makeBankEntry();
    render(
      <ChunkCard
        entry={entry}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onToggleSelect={vi.fn()}
        selected={true}
        anySelected={true}
      />
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("should apply highlight ring when highlighted", () => {
    const entry = makeBankEntry();
    const { container } = render(
      <ChunkCard
        entry={entry}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        highlighted={true}
      />
    );
    const card = container.querySelector("[data-entry-id]");
    expect(card?.className).toContain("ring-2");
  });

  it("should have data-entry-id attribute", () => {
    const entry = makeBankEntry();
    const { container } = render(
      <ChunkCard entry={entry} onUpdate={vi.fn()} onDelete={vi.fn()} />
    );
    expect(container.querySelector('[data-entry-id="test-1"]')).toBeInTheDocument();
  });
});
