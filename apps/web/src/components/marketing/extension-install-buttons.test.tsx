import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ExtensionInstallButtons } from "./extension-install-buttons";

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
}

describe("ExtensionInstallButtons", () => {
  beforeEach(() => {
    setUserAgent("curl/8.0");
  });

  it("hides store CTAs while no marketplace listing is live", () => {
    setUserAgent(
      "Mozilla/5.0 AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    );

    const { container } = render(<ExtensionInstallButtons variant="primary" />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("also hides compact detected CTAs without a live listing", () => {
    setUserAgent("Mozilla/5.0 Gecko/20100101 Firefox/124.0");

    const { container } = render(
      <ExtensionInstallButtons variant="compact" onlyDetected />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
