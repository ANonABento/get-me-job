import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildPdfSourceMap } from "./pdf-source-map";

const fixturePath = path.join(
  process.cwd(),
  "tests/fixtures/parser-v2/syzfjbzwjncs.pdf",
);

describe("buildPdfSourceMap", () => {
  it("reconstructs source lines with stable page/line/token ids and bboxes", async () => {
    const sourceMap = await buildPdfSourceMap(readFileSync(fixturePath));

    expect(sourceMap.pages).toEqual([
      {
        page: 1,
        width: 612,
        height: 792,
        lineIds: sourceMap.lines.map((line) => line.id),
      },
    ]);
    expect(sourceMap.lines[0]).toMatchObject({
      id: "p1-l001",
      page: 1,
      text: "Jake Ryan",
    });

    const firstToken = sourceMap.lines[0].tokens[0];
    expect(firstToken).toMatchObject({
      id: "p1-l001-t001",
      lineId: "p1-l001",
      text: "Jake Ryan",
      bbox: { page: 1 },
    });
    expect(firstToken.bbox.x1).toBeGreaterThan(firstToken.bbox.x0);
    expect(firstToken.bbox.y1).toBeGreaterThan(firstToken.bbox.y0);

    expect(sourceMap.rawText).toContain(
      "Southwestern University | Georgetown, TX\nBachelor of Arts in Computer Science, Minor in Business | Aug. 2018 – May 2021",
    );
    expect(sourceMap.rawText).toContain(
      "Gitlytics | Python, Flask, React, PostgreSQL, Docker | June 2020 – Present",
    );
    expect(sourceMap.rawText).toContain(
      "• Explored methods to generate video game dungeons based off of The Legend of Zelda",
    );
    expect(sourceMap.rawText).not.toContain(
      "Southwestern UniversityGeorgetown",
    );
    expect(sourceMap.rawText).not.toContain("off ofThe Legend");
  });
});
