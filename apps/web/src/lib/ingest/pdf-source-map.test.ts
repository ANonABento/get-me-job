import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildPdfSourceMap,
  buildPdfSourceMapFromPositions,
} from "./pdf-source-map";

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

  it("strips PDF extraction artifacts from reconstructed source text", () => {
    const sourceMap = buildPdfSourceMapFromPositions({
      pageDimensions: [{ page: 1, width: 612, height: 792 }],
      items: [
        {
          text: "teleoperation of an 8Í-DOF robotic arm",
          page: 1,
          x0: 72,
          y0: 100,
          x1: 250,
          y1: 111,
        },
      ],
    });

    expect(sourceMap.rawText).toContain(
      "teleoperation of an 8-DOF robotic arm",
    );
    expect(sourceMap.rawText).not.toContain("8Í-DOF");
  });

  it("keeps vertically adjacent header links out of the email line", () => {
    const sourceMap = buildPdfSourceMapFromPositions({
      pageDimensions: [{ page: 1, width: 612, height: 792 }],
      items: [
        {
          text: "Kevin Jiang",
          page: 1,
          x0: 33.75,
          y0: 25.227,
          x1: 197.25,
          y1: 55.227,
        },
        {
          text: "Dual Citizen (U.S. & Canada) | k",
          page: 1,
          x0: 311.995,
          y0: 31.732,
          x1: 462.889,
          y1: 42.732,
        },
        {
          text: "69jiang@uwaterloo.c",
          page: 1,
          x0: 462.885,
          y0: 31.732,
          x1: 568.766,
          y1: 42.732,
        },
        {
          text: "a",
          page: 1,
          x0: 568.762,
          y0: 31.732,
          x1: 574.504,
          y1: 42.732,
        },
        {
          text: "Kevin Jiang Portfolio",
          page: 1,
          x0: 466.962,
          y0: 48.643,
          x1: 570.755,
          y1: 59.643,
        },
      ],
    });

    expect(sourceMap.lines.map((line) => line.text)).toEqual([
      "Kevin Jiang | Dual Citizen (U.S. & Canada) | k69jiang@uwaterloo.ca",
      "Kevin Jiang Portfolio",
    ]);
  });
});
