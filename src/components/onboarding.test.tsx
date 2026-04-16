import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  OnboardingDialog,
  ProgressDots,
  ONBOARDING_STEP_COUNT,
  useOnboarding,
} from "./onboarding";
import { STORAGE_KEYS } from "@/lib/constants";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

/** Helper: find visible (non-sr-only) heading text in the dialog */
function getVisibleHeading(text: string) {
  const all = screen.getAllByText(text);
  // Return the one that is NOT sr-only (the step component heading)
  return all.find((el) => !el.className.includes("sr-only")) ?? all[0];
}

function hasVisibleHeading(text: string) {
  const all = screen.queryAllByText(text);
  return all.some((el) => !el.className.includes("sr-only"));
}

describe("ONBOARDING_STEP_COUNT", () => {
  it("should be 5", () => {
    expect(ONBOARDING_STEP_COUNT).toBe(5);
  });
});

describe("ProgressDots", () => {
  it("should render the correct number of dots", () => {
    const { container } = render(<ProgressDots total={5} current={0} />);
    const group = container.querySelector("[role='group']")!;
    expect(group.children).toHaveLength(5);
  });

  it("should mark current dot with wider width class", () => {
    const { container } = render(<ProgressDots total={5} current={2} />);
    const group = container.querySelector("[role='group']")!;
    const dots = group.children;
    expect(dots[2].className).toContain("w-6");
    expect(dots[0].className).toContain("w-1.5");
    expect(dots[4].className).toContain("w-1.5");
  });

  it("should mark completed dots with primary/50 opacity", () => {
    const { container } = render(<ProgressDots total={5} current={3} />);
    const group = container.querySelector("[role='group']")!;
    const dots = group.children;
    expect(dots[0].className).toContain("bg-primary/50");
    expect(dots[1].className).toContain("bg-primary/50");
    expect(dots[2].className).toContain("bg-primary/50");
    expect(dots[3].className).toContain("bg-primary");
    expect(dots[3].className).not.toContain("bg-primary/50");
    expect(dots[4].className).toContain("bg-muted");
  });

  it("should have accessible aria-labels", () => {
    render(<ProgressDots total={3} current={1} />);
    expect(screen.getByLabelText("Step 1 of 3, completed")).toBeInTheDocument();
    expect(screen.getByLabelText("Step 2 of 3, current")).toBeInTheDocument();
    expect(screen.getByLabelText("Step 3 of 3")).toBeInTheDocument();
  });
});

describe("OnboardingDialog", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function openDialog() {
    render(<OnboardingDialog />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
  }

  it("should not show when onboarding is already completed", () => {
    localStorageMock.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
    render(<OnboardingDialog />);
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(hasVisibleHeading("Welcome to Taida")).toBe(false);
  });

  it("should show after delay when onboarding is not completed", () => {
    render(<OnboardingDialog />);
    expect(hasVisibleHeading("Welcome to Taida")).toBe(false);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(hasVisibleHeading("Welcome to Taida")).toBe(true);
  });

  it("should show step 1 (Welcome) initially", () => {
    openDialog();
    expect(getVisibleHeading("Welcome to Taida")).toBeInTheDocument();
  });

  it("should advance to next step on Continue click", () => {
    openDialog();
    expect(getVisibleHeading("Welcome to Taida")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Continue"));

    expect(getVisibleHeading("Upload Your Resume")).toBeInTheDocument();
  });

  it("should show Skip setup button on non-last steps", () => {
    openDialog();
    expect(screen.getByText("Skip setup")).toBeInTheDocument();
  });

  it("should persist completed flag and close on skip", () => {
    openDialog();
    fireEvent.click(screen.getByText("Skip setup"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      "true"
    );
  });

  it("should persist completed flag on X button click", () => {
    openDialog();
    fireEvent.click(screen.getByLabelText("Skip onboarding"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      "true"
    );
  });

  it("should show Get Started on last step and complete on click", () => {
    openDialog();

    for (let i = 0; i < ONBOARDING_STEP_COUNT - 1; i++) {
      fireEvent.click(screen.getByText("Continue"));
    }

    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.queryByText("Skip setup")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Get Started"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      "true"
    );
  });

  it("should render all 5 steps when navigating through", () => {
    openDialog();

    const stepTexts = [
      "Welcome to Taida",
      "Upload Your Resume",
      "Review Your Profile",
      "Configure AI (Optional)",
    ];

    for (let i = 0; i < stepTexts.length; i++) {
      expect(getVisibleHeading(stepTexts[i])).toBeInTheDocument();
      fireEvent.click(screen.getByText("Continue"));
    }

    // Last step uses an apostrophe entity
    expect(hasVisibleHeading("You\u2019re All Set!") || hasVisibleHeading("You're All Set!")).toBe(true);
  });

  it("should render progress dots with correct count", () => {
    openDialog();
    const group = document.querySelector("[role='group']")!;
    expect(group.children).toHaveLength(ONBOARDING_STEP_COUNT);
  });
});

describe("useOnboarding", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should return isCompleted false when not set", () => {
    let result: ReturnType<typeof useOnboarding>;
    function TestComponent() {
      result = useOnboarding();
      return null;
    }
    render(<TestComponent />);
    expect(result!.isCompleted()).toBe(false);
  });

  it("should return isCompleted true when flag is set", () => {
    localStorageMock.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");

    let result: ReturnType<typeof useOnboarding>;
    function TestComponent() {
      result = useOnboarding();
      return null;
    }
    render(<TestComponent />);
    expect(result!.isCompleted()).toBe(true);
  });
});
