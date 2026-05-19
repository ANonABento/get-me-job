import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import messages from "@/messages/en.json";
import ATSScannerPage from "./page";

function renderPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ATSScannerPage params={{ locale: "en" }} />
    </NextIntlClientProvider>,
  );
}

describe("ATSScannerPage", () => {
  it("does not use a dollar sign icon for the free benefit", () => {
    const { container } = renderPage();

    expect(screen.getByText("Free and Private")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We parse resumes on our servers, do not save them to your account, and do not share them",
      ),
    ).toBeInTheDocument();
    expect(container.querySelector(".lucide-dollar-sign")).toBeNull();
    expect(container.querySelector(".lucide-sparkles")).not.toBeNull();
  });

  it("does not claim the public scanner runs entirely in the browser", () => {
    const { container } = renderPage();

    expect(container).not.toHaveTextContent(/in your browser/i);
    expect(container).not.toHaveTextContent(/nothing is stored/i);
    expect(
      screen.getByText(/sent to our servers for temporary parsing/i),
    ).toBeInTheDocument();
  });

  it("links the ATS filtering stat to the HBS Hidden Workers source", () => {
    renderPage();

    expect(screen.getByText(/88% of executives/i)).toBeInTheDocument();
    const source = screen.getByRole("link", { name: /Hidden Workers/i });
    expect(source).toHaveAttribute(
      "href",
      "https://www.hbs.edu/managing-the-future-of-work/Documents/research/hiddenworkers09032021.pdf",
    );
  });

  it("renders the HBS source as a separate readable line", () => {
    renderPage();

    const source = screen.getByRole("link", { name: /Hidden Workers/i });

    expect(source.closest("sup")).toBeNull();
    expect(source.parentElement).toHaveClass("mt-3", "text-xs", "leading-5");
  });
});
