import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLevelsUrl, fetchLevelsEnrichment, parseLevelsHtml } from "./levels";

const SAMPLE_HTML = `
<table>
  <tr data-role="Software Engineer" data-level="L4">
    <td>Total comp</td>
    <td>$180k - $240k</td>
  </tr>
  <tr data-role="Senior Software Engineer" data-level="L5">
    <td>Total comp</td>
    <td>$280k – $400k</td>
  </tr>
  <tr data-role="Skipped" data-level="L1">
    <td>Total comp</td>
    <td>n/a</td>
  </tr>
</table>
`;

describe("parseLevelsHtml", () => {
  it("extracts roles and ranges, skipping rows without comp", () => {
    const ranges = parseLevelsHtml(SAMPLE_HTML);
    expect(ranges).toHaveLength(2);
    expect(ranges[0]).toEqual({
      role: "Software Engineer",
      level: "L4",
      totalCompMin: 180000,
      totalCompMax: 240000,
      currency: "USD",
    });
    expect(ranges[1].totalCompMin).toBe(280000);
    expect(ranges[1].totalCompMax).toBe(400000);
  });

  it("returns empty array when no matching rows", () => {
    expect(parseLevelsHtml("<html>no comp here</html>")).toEqual([]);
  });

  it("supports million-style amounts", () => {
    const html =
      `<tr data-role="Engineering Director" data-level="E7"><td>$1.2m - $1.5m</td></tr>`;
    const ranges = parseLevelsHtml(html);
    expect(ranges[0].totalCompMin).toBe(1_200_000);
    expect(ranges[0].totalCompMax).toBe(1_500_000);
  });
});

describe("buildLevelsUrl", () => {
  it("slugifies company names", () => {
    expect(buildLevelsUrl("Acme & Co")).toBe(
      "https://www.levels.fyi/companies/acme-and-co/salaries",
    );
  });
});

describe("fetchLevelsEnrichment", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });
  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("returns ok on parse success", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(SAMPLE_HTML, { status: 200 }));
    const result = await fetchLevelsEnrichment("Acme");
    expect(result.status).toBe("ok");
    expect(result.data?.ranges).toHaveLength(2);
    expect(result.data?.url).toContain("acme");
  });

  it("returns no_data on 404", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 404 }));
    const result = await fetchLevelsEnrichment("Acme");
    expect(result.status).toBe("no_data");
  });

  it("returns no_data when page has no rows", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("<html/>", { status: 200 }));
    const result = await fetchLevelsEnrichment("Acme");
    expect(result.status).toBe("no_data");
  });

  it("returns error on non-2xx", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 500 }));
    const result = await fetchLevelsEnrichment("Acme");
    expect(result.status).toBe("error");
  });

  it("captures network errors", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("captcha"));
    const result = await fetchLevelsEnrichment("Acme");
    expect(result.status).toBe("error");
    expect(result.error).toContain("captcha");
  });
});
