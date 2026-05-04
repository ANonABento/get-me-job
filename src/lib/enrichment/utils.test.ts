import { describe, expect, it } from "vitest";
import { decodeBasicEntities, guessGithubOrg, slugifyCompany, stripHtml } from "./utils";

describe("guessGithubOrg", () => {
  it("extracts the first path segment from a github.com URL", () => {
    expect(
      guessGithubOrg("Acme", "https://github.com/acme-dev/some-repo"),
    ).toBe("acme-dev");
  });

  it("falls back to a slug when no github URL is provided", () => {
    expect(guessGithubOrg("Acme & Co")).toBe("acme-and-co");
  });

  it("ignores non-github source URLs", () => {
    expect(
      guessGithubOrg("Acme Corp", "https://acme.com/careers/role"),
    ).toBe("acme-corp");
  });

  it("recovers from malformed URLs", () => {
    expect(guessGithubOrg("Acme", "not a url")).toBe("acme");
  });
});

describe("slugifyCompany", () => {
  it("normalizes punctuation and casing", () => {
    expect(slugifyCompany("Some, Company Inc.")).toBe("some-company-inc");
  });
});

describe("stripHtml", () => {
  it("removes tags and decodes basic entities", () => {
    expect(stripHtml("<p>Hello &amp; <em>welcome</em></p>"))
      .toBe("Hello & welcome");
  });

  it("drops script and style content", () => {
    expect(stripHtml("<style>p{}</style><p>visible</p>"))
      .toBe("visible");
  });
});

describe("decodeBasicEntities", () => {
  it("decodes numeric entities", () => {
    expect(decodeBasicEntities("&#65;&#66;")).toBe("AB");
  });
});
