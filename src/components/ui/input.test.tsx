import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("should render input element", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("should handle text input", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "Hello World" } });
    expect(input).toHaveValue("Hello World");
  });

  it("should handle onChange events", () => {
    const handleChange = vi.fn();
    render(<Input data-testid="input" onChange={handleChange} />);
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "test" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("should display placeholder text", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input data-testid="input" disabled />);
    expect(screen.getByTestId("input")).toBeDisabled();
  });

  it("should accept different input types", () => {
    const { rerender } = render(<Input data-testid="input" type="text" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "text");

    rerender(<Input data-testid="input" type="email" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");

    rerender(<Input data-testid="input" type="password" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "password");

    rerender(<Input data-testid="input" type="number" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "number");
  });

  it("should have proper base classes", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("flex");
    expect(input.className).toContain("h-10");
    expect(input.className).toContain("w-full");
    expect(input.className).toContain("rounded-[var(--radius)]");
    expect(input.className).toContain("border-[length:var(--border-width)]");
    expect(input.className).toContain("[letter-spacing:var(--letter-spacing)]");
  });

  it("should merge custom className", () => {
    render(<Input data-testid="input" className="custom-input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("custom-input");
  });

  it("should forward ref to input element", () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("should pass through additional HTML attributes", () => {
    render(
      <Input
        data-testid="input"
        id="username"
        name="username"
        autoComplete="username"
        required
        maxLength={50}
      />,
    );
    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("id", "username");
    expect(input).toHaveAttribute("name", "username");
    expect(input).toHaveAttribute("autoComplete", "username");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("maxLength", "50");
  });

  it("should handle focus and blur events", () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(
      <Input data-testid="input" onFocus={handleFocus} onBlur={handleBlur} />,
    );
    const input = screen.getByTestId("input");

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("should accept a value prop for controlled input", () => {
    render(
      <Input
        data-testid="input"
        value="controlled value"
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId("input")).toHaveValue("controlled value");
  });

  it("should accept defaultValue for uncontrolled input", () => {
    render(<Input data-testid="input" defaultValue="default value" />);
    expect(screen.getByTestId("input")).toHaveValue("default value");
  });
});
