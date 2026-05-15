import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Clipboard, Globe } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { PasteBox, type PasteBoxHandle } from "./paste-box";

describe("PasteBox", () => {
  it("renders the title, subtitle, and placeholder", () => {
    render(
      <PasteBox
        icon={Clipboard}
        title="Paste a job description"
        subtitle="Slothing scores it against your profile."
        placeholder="Drop JD here"
      />,
    );
    expect(screen.getByText("Paste a job description")).toBeVisible();
    expect(
      screen.getByText("Slothing scores it against your profile."),
    ).toBeVisible();
    expect(screen.getByPlaceholderText("Drop JD here")).toBeVisible();
  });

  it("starts with the submit button disabled (too short)", () => {
    render(<PasteBox icon={Clipboard} title="x" />);
    expect(screen.getByRole("button", { name: "Score this" })).toBeDisabled();
  });

  it("enables the submit button after enough text is entered", () => {
    render(<PasteBox icon={Clipboard} title="x" minLength={4} />);
    const textarea = screen.getByPlaceholderText(/paste here/i);
    fireEvent.change(textarea, { target: { value: "abcdef" } });
    expect(screen.getByRole("button", { name: "Score this" })).toBeEnabled();
  });

  it("invokes onSubmit with the trimmed value", () => {
    const onSubmit = vi.fn();
    render(
      <PasteBox icon={Clipboard} title="x" minLength={3} onSubmit={onSubmit} />,
    );
    const textarea = screen.getByPlaceholderText(/paste here/i);
    fireEvent.change(textarea, { target: { value: "  hello  " } });
    fireEvent.click(screen.getByRole("button", { name: "Score this" }));
    expect(onSubmit).toHaveBeenCalledWith("hello");
  });

  it("supports controlled value + onChange", () => {
    const onChange = vi.fn();
    render(
      <PasteBox
        icon={Clipboard}
        title="x"
        value="initial"
        onChange={onChange}
      />,
    );
    const textarea = screen.getByDisplayValue("initial");
    fireEvent.change(textarea, { target: { value: "next" } });
    expect(onChange).toHaveBeenCalledWith("next");
  });

  it("renders source chips when provided", () => {
    render(
      <PasteBox
        icon={Clipboard}
        title="x"
        sources={[
          { id: "url", label: "URL", icon: Globe },
          { id: "ext", label: "Extension" },
        ]}
      />,
    );
    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByText("Extension")).toBeInTheDocument();
  });

  it("exposes focus / clear / setValue via imperative handle", () => {
    const ref = createRef<PasteBoxHandle>();
    const onChange = vi.fn();
    render(
      <PasteBox ref={ref} icon={Clipboard} title="x" onChange={onChange} />,
    );
    ref.current?.setValue("hydrated");
    expect(onChange).toHaveBeenCalledWith("hydrated");
    ref.current?.clear();
    expect(onChange).toHaveBeenCalledWith("");
  });
});
