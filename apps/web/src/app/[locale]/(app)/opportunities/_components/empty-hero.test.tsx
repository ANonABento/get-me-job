import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OpportunitiesEmptyHero } from "./empty-hero";

describe("OpportunitiesEmptyHero", () => {
  it("renders copy and wires both calls to action", () => {
    const onAdd = vi.fn();
    const onImport = vi.fn();

    render(<OpportunitiesEmptyHero onAdd={onAdd} onImport={onImport} />);

    expect(
      screen.getByRole("heading", { name: "Track your first opportunity" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Save a role to start tracking applications, deadlines, and tailored documents.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "/illustrations/empty/opportunities-zero.svg",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: /manually add/i }));
    fireEvent.click(screen.getByRole("button", { name: /import job/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
