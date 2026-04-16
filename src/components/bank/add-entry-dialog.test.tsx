import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddEntryDialog } from "./add-entry-dialog";

describe("AddEntryDialog", () => {
  it("should render the trigger button", () => {
    render(<AddEntryDialog onCreate={vi.fn()} />);
    expect(screen.getByText("Add Entry")).toBeInTheDocument();
  });

  it("should open dialog when trigger is clicked", () => {
    render(<AddEntryDialog onCreate={vi.fn()} />);
    fireEvent.click(screen.getByText("Add Entry"));
    expect(screen.getByText("Add New Entry")).toBeInTheDocument();
    expect(screen.getByText("Manually add an entry to your profile bank.")).toBeInTheDocument();
  });

  it("should show category picker with all categories", () => {
    render(<AddEntryDialog onCreate={vi.fn()} />);
    fireEvent.click(screen.getByText("Add Entry"));

    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Skill")).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Achievement")).toBeInTheDocument();
    expect(screen.getByText("Certification")).toBeInTheDocument();
  });

  it("should show experience fields by default", () => {
    render(<AddEntryDialog onCreate={vi.fn()} />);
    fireEvent.click(screen.getByText("Add Entry"));

    expect(screen.getByLabelText("Job Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
  });

  it("should switch fields when category changes", () => {
    render(<AddEntryDialog onCreate={vi.fn()} />);
    fireEvent.click(screen.getByText("Add Entry"));

    // Switch to Skill
    fireEvent.click(screen.getByText("Skill"));

    expect(screen.getByLabelText("Skill Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Proficiency")).toBeInTheDocument();
    // Experience fields should be gone
    expect(screen.queryByLabelText("Job Title")).not.toBeInTheDocument();
  });

  it("should call onCreate with correct category and content", () => {
    const onCreate = vi.fn();
    render(<AddEntryDialog onCreate={onCreate} />);
    fireEvent.click(screen.getByText("Add Entry"));

    // Switch to skill
    fireEvent.click(screen.getByText("Skill"));

    // Fill in skill name
    fireEvent.change(screen.getByLabelText("Skill Name"), {
      target: { value: "React" },
    });

    // Submit - there are two "Add Entry" buttons (trigger + submit)
    const buttons = screen.getAllByText("Add Entry");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(onCreate).toHaveBeenCalledWith("skill", expect.objectContaining({
      name: "React",
    }));
  });
});
