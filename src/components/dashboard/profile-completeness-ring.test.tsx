import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileCompletenessRing } from "./profile-completeness-ring";
import type { ProfileCompletenessResult } from "@/lib/profile-completeness";

const profileCompleteness: ProfileCompletenessResult = {
  percentage: 60,
  sections: [
    {
      key: "contact",
      label: "Contact Info",
      complete: true,
      weight: 20,
      href: "/profile#contact",
    },
    {
      key: "summary",
      label: "Professional Summary",
      complete: false,
      weight: 15,
      href: "/profile#summary",
    },
  ],
  nextAction: {
    key: "summary",
    label: "Professional Summary",
    complete: false,
    weight: 15,
    href: "/profile#summary",
  },
};

describe("ProfileCompletenessRing", () => {
  it("uses an instance-scoped SVG gradient id", () => {
    const { container } = render(
      <>
        <ProfileCompletenessRing data={profileCompleteness} />
        <ProfileCompletenessRing data={profileCompleteness} />
      </>,
    );

    const gradients = Array.from(container.querySelectorAll("linearGradient"));
    const gradientIds = gradients.map((gradient) => gradient.id);
    const progressCircles = Array.from(
      container.querySelectorAll("circle[stroke^='url']"),
    );

    expect(gradientIds).toHaveLength(2);
    expect(new Set(gradientIds).size).toBe(2);
    expect(
      progressCircles.map((circle) => circle.getAttribute("stroke")),
    ).toEqual(gradientIds.map((id) => `url(#${id})`));
  });
});
