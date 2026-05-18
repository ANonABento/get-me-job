import { describe, expect, it } from "vitest";

import {
  deriveHeaderSearchNeedles,
  deriveSearchNeedle,
  deriveSearchNeedles,
  findSourceLinksForBboxes,
  findPositionsForText,
  isJunkItem,
  type PdfPositionItem,
} from "./pdf-positions";

function item(
  text: string,
  overrides: Partial<PdfPositionItem> = {},
): PdfPositionItem {
  return {
    text,
    page: 1,
    x0: 0,
    y0: 0,
    x1: 100,
    y1: 12,
    ...overrides,
  };
}

describe("findPositionsForText", () => {
  it("locates a verbatim phrase split across multiple text items on one page", () => {
    const items = [
      item("Hardware", { x0: 50, x1: 110, y0: 100, y1: 112 }),
      item("Developer", { x0: 115, x1: 200, y0: 100, y1: 112 }),
      item("at", { x0: 205, x1: 220, y0: 100, y1: 112 }),
      item("Midnight Sun", { x0: 225, x1: 320, y0: 100, y1: 112 }),
      item("Some other paragraph", {
        x0: 50,
        x1: 250,
        y0: 130,
        y1: 142,
      }),
    ];
    const tuples = findPositionsForText(
      "Hardware Developer at Midnight Sun",
      items,
    );
    expect(tuples).toHaveLength(1);
    const [page, x0, y0, x1, y1] = tuples[0];
    expect(page).toBe(1);
    expect(x0).toBe(50);
    expect(x1).toBe(320);
    expect(y0).toBe(100);
    expect(y1).toBe(112);
  });

  it("returns one tuple per page when the matched run spans a page break", () => {
    const items = [
      item("Designed and routed double-layer PCBs", {
        page: 1,
        x0: 50,
        x1: 320,
        y0: 700,
        y1: 712,
      }),
      item("for controller subsystem testing", {
        page: 2,
        x0: 50,
        x1: 280,
        y0: 50,
        y1: 62,
      }),
    ];
    const tuples = findPositionsForText(
      "Designed and routed double-layer PCBs for controller subsystem testing",
      items,
    );
    expect(tuples).toHaveLength(2);
    expect(tuples[0][0]).toBe(1);
    expect(tuples[1][0]).toBe(2);
  });

  it("returns an empty array when the needle is not found", () => {
    const items = [
      item("Hello", { x0: 0, x1: 50 }),
      item("World", { x0: 60, x1: 110 }),
    ];
    expect(findPositionsForText("Goodbye", items)).toEqual([]);
  });

  it("ignores extremely short needles to avoid false positives", () => {
    const items = [item("a", { x0: 0, x1: 10 })];
    expect(findPositionsForText("a", items)).toEqual([]);
  });

  it("is whitespace + case insensitive in matching", () => {
    const items = [
      item("EXPRESSIVE ANIMATRONIC HEAD", {
        x0: 100,
        x1: 350,
        y0: 200,
        y1: 220,
      }),
    ];
    const tuples = findPositionsForText("expressive animatronic head", items);
    expect(tuples).toHaveLength(1);
  });

  it("matches when an inline link/emoji item interrupts the bullet stream", () => {
    // pdf.js often emits hyperlink markers as separate text items between
    // the words of a sentence. The matcher used to fail on these; token-
    // coverage handles them now.
    const items = [
      item("Designed", { x0: 50, x1: 110, y0: 200, y1: 212 }),
      item("a", { x0: 115, x1: 125, y0: 200, y1: 212 }),
      item("lightweight", { x0: 130, x1: 220, y0: 200, y1: 212 }),
      item("🔗", { x0: 225, x1: 240, y0: 200, y1: 212 }),
      item("exoskeleton", { x0: 245, x1: 340, y0: 200, y1: 212 }),
      item("wrist", { x0: 345, x1: 390, y0: 200, y1: 212 }),
      item("controller", { x0: 395, x1: 470, y0: 200, y1: 212 }),
    ];
    const tuples = findPositionsForText(
      "Designed a lightweight exoskeleton wrist controller",
      items,
    );
    expect(tuples).toHaveLength(1);
    expect(tuples[0][0]).toBe(1);
    expect(tuples[0][3]).toBeGreaterThanOrEqual(470); // x1 covers the last word
  });

  it("tolerates connector-word differences (needle missing 'at')", () => {
    const items = [
      item("Senior Developer", { x0: 50, x1: 200, y0: 100, y1: 112 }),
      item("at", { x0: 205, x1: 220, y0: 100, y1: 112 }),
      item("Acme Corp", { x0: 225, x1: 320, y0: 100, y1: 112 }),
    ];
    // The parser may emit `title + " " + company` without the connector
    // word — the matcher must still locate this row.
    const tuples = findPositionsForText("Senior Developer Acme Corp", items);
    expect(tuples).toHaveLength(1);
  });

  it("tolerates smart-punctuation and em-dash differences", () => {
    const items = [
      item("Robotics Engineer", { x0: 50, x1: 200, y0: 100, y1: 112 }),
      item("—", { x0: 205, x1: 220, y0: 100, y1: 112 }), // em-dash
      item("Reazon Human Interaction Lab", {
        x0: 225,
        x1: 420,
        y0: 100,
        y1: 112,
      }),
    ];
    // Needle uses an ASCII hyphen even though PDF has em-dash.
    const tuples = findPositionsForText(
      "Robotics Engineer - Reazon Human Interaction Lab",
      items,
    );
    expect(tuples).toHaveLength(1);
  });

  it("extends the bbox horizontally to cover the full visual line", () => {
    // Title is on the left, date is right-aligned on the same y-band.
    // The highlight should sweep the whole line, not just the matched
    // title — feels like a real highlighter pen.
    const items = [
      item("Hardware Developer", { x0: 50, x1: 200, y0: 100, y1: 112 }),
      item("Midnight Sun", { x0: 220, x1: 320, y0: 100, y1: 112 }),
      item("Sep 2024 — Apr 2025", {
        x0: 460,
        x1: 580,
        y0: 100,
        y1: 112,
      }),
    ];
    const tuples = findPositionsForText(
      "Hardware Developer Midnight Sun",
      items,
    );
    expect(tuples).toHaveLength(1);
    const [, x0, , x1] = tuples[0];
    expect(x0).toBe(50);
    // x1 should extend to cover the right-aligned date.
    expect(x1).toBe(580);
  });

  it("picks the SHORTEST window when multiple regions partially match", () => {
    // A junky earlier window has 2 of the needle's tokens; the real
    // location has all 4. Coverage > shortest-window — coverage wins.
    const items = [
      item("Designed", { x0: 50, x1: 110, y0: 100, y1: 112 }),
      item("Other", { x0: 115, x1: 160, y0: 100, y1: 112 }),
      item("Routed", { x0: 165, x1: 220, y0: 100, y1: 112 }),
      item("Designed and routed double-layer PCBs", {
        x0: 50,
        x1: 320,
        y0: 200,
        y1: 212,
      }),
    ];
    const tuples = findPositionsForText(
      "Designed and routed double-layer PCBs",
      items,
    );
    expect(tuples).toHaveLength(1);
    // The y of the better match (line 2) — not the noisy line 1.
    expect(tuples[0][2]).toBe(200);
  });

  it("returns no match when fewer than the required prefix tokens are found", () => {
    const items = [
      item("Built a CI pipeline", { x0: 50, x1: 320, y0: 100, y1: 112 }),
    ];
    // Needle shares no significant tokens with the item — should not match.
    expect(
      findPositionsForText(
        "Trained large language models on petabytes of data",
        items,
      ),
    ).toEqual([]);
  });

  it("recovers head-rewritten bullets via tail-suffix cascade", () => {
    // The smart parser rewrote the bullet's head — it prepended context
    // and substituted a brand name that doesn't appear verbatim in the
    // PDF. Only the TAIL of the needle matches the PDF text in order.
    // Token-in-order matching means head-prefix cascade can't recover
    // this (the first head token isn't in the PDF, so every head
    // attempt scores 0). Only the tail-suffix cascade can.
    const items = [
      item("Engineered", { x0: 50, x1: 130, y0: 100, y1: 112 }),
      item("code", { x0: 135, x1: 175, y0: 100, y1: 112 }),
      item("for", { x0: 180, x1: 200, y0: 100, y1: 112 }),
      item("real-time", { x0: 205, x1: 270, y0: 100, y1: 112 }),
      item("live", { x0: 275, x1: 305, y0: 100, y1: 112 }),
      item("facial", { x0: 310, x1: 360, y0: 100, y1: 112 }),
      item("detection", { x0: 365, x1: 430, y0: 100, y1: 112 }),
    ];
    // 12 significant tokens. Head ("Wrote scripts in Python language,
    // deeply integrated") has zero overlap with the PDF. Tail ("for
    // real-time live facial detection") is six tokens, all in the PDF
    // in order — the tail-45% slice catches it.
    const tuples = findPositionsForText(
      "Wrote scripts in Python language deeply integrated for real-time live facial detection",
      items,
    );
    expect(tuples).toHaveLength(1);
    expect(tuples[0][0]).toBe(1);
  });

  it("tolerates pluralization differences via DL fallback", () => {
    // Common parser-vs-PDF drift: the parser strips trailing 's' (or
    // adds one). 1-char distance on a 9-char token should still match.
    const items = [
      item("Designed", { x0: 50, x1: 120, y0: 100, y1: 112 }),
      item("scalable", { x0: 125, x1: 195, y0: 100, y1: 112 }),
      item("data", { x0: 200, x1: 235, y0: 100, y1: 112 }),
      item("pipeline", { x0: 240, x1: 310, y0: 100, y1: 112 }),
    ];
    // Needle says "pipelines" — PDF says "pipeline".
    const tuples = findPositionsForText(
      "Designed scalable data pipelines",
      items,
    );
    expect(tuples).toHaveLength(1);
  });

  it("does NOT fuzzy-match short unrelated tokens (false-positive guard)", () => {
    // 3-char tokens have MAX_TYPO_DISTANCE = 0, so `cat` won't match
    // `bat` even though distance = 1.
    const items = [
      item("The bat flew home", { x0: 0, x1: 200, y0: 100, y1: 112 }),
    ];
    expect(findPositionsForText("cat flew home", items)).toEqual([]);
  });

  it("still finds the match when 'irrelevant' items separate matched tokens", () => {
    // Real-world hazard: pdf.js sometimes emits a project's tech-stack
    // metadata interleaved with the title, or includes link icons between
    // words. We need the matcher to look past those filler items.
    const items = [
      item("AR Gesture", { x0: 50, x1: 130, y0: 100, y1: 112 }),
      item("|", { x0: 135, x1: 142, y0: 100, y1: 112 }),
      item("Javascript", { x0: 145, x1: 215, y0: 100, y1: 112 }),
      item("|", { x0: 220, x1: 227, y0: 100, y1: 112 }),
      item("Python", { x0: 230, x1: 280, y0: 100, y1: 112 }),
      item("Controlled Robot", { x0: 285, x1: 400, y0: 100, y1: 112 }),
    ];
    const tuples = findPositionsForText("AR Gesture Controlled Robot", items);
    expect(tuples).toHaveLength(1);
  });
});

describe("parent-anchored search", () => {
  it("matches a short generic bullet inside its parent's y-band", () => {
    // Without an anchor, "Built the CLI" tokenizes to "Built", "the",
    // "CLI" — but "the" is removed by SIGNIFICANT_TOKEN_MIN_LEN, leaving
    // a 2-token needle that fails the bullet threshold (minTokens 2,
    // minMatched 2) only weakly. The point: anchoring drops the bar to
    // minTokens 1 so even single-significant-token bullets can resolve.
    const items = [
      // Parent header at y=200
      item("Robotics Engineer", { x0: 50, x1: 200, y0: 200, y1: 212 }),
      // Bullet inside parent's band (y=220, well below the parent y0)
      item("Built", { x0: 80, x1: 130, y0: 220, y1: 232 }),
      item("CLI", { x0: 135, x1: 170, y0: 220, y1: 232 }),
      // Unrelated content far below
      item("Education", { x0: 50, x1: 130, y0: 500, y1: 512 }),
    ];
    const tuples = findPositionsForText("Built the CLI", items, {
      category: "bullet",
      anchorBbox: { page: 1, y0: 200, yMax: 400 },
    });
    expect(tuples).toHaveLength(1);
    expect(tuples[0][0]).toBe(1);
  });

  it("rejects matches outside the anchor band", () => {
    // The needle's text appears in the PDF, but BELOW the anchor band.
    // Anchoring should filter it out entirely.
    const items = [
      item("Built", { x0: 80, x1: 130, y0: 600, y1: 612 }),
      item("CLI", { x0: 135, x1: 170, y0: 600, y1: 612 }),
    ];
    const tuples = findPositionsForText("Built the CLI", items, {
      category: "bullet",
      anchorBbox: { page: 1, y0: 200, yMax: 400 },
    });
    expect(tuples).toEqual([]);
  });
});

describe("per-category match thresholds", () => {
  it("matches a paraphrased bullet at the permissive bullet threshold", () => {
    // Needle has 5 significant tokens. Two of them ("data", "ingestion")
    // were inserted by the parser and don't appear in the PDF. The
    // matcher hits 2 of 5 tokens in order — passes the bullet threshold
    // (minTokens 2, coverage 0.40 → needs 2) but fails the experience
    // threshold (minTokens 2, coverage 0.55 → needs 3).
    const items = [
      item("Built", { x0: 50, x1: 100, y0: 100, y1: 112 }),
      item("scalable", { x0: 105, x1: 175, y0: 100, y1: 112 }),
      item("systems", { x0: 180, x1: 245, y0: 100, y1: 112 }),
      item("and", { x0: 250, x1: 275, y0: 100, y1: 112 }),
      item("pipelines", { x0: 280, x1: 355, y0: 100, y1: 112 }),
    ];
    const needle = "Built scalable data ingestion pipelines";
    const tuples = findPositionsForText(needle, items, { category: "bullet" });
    expect(tuples).toHaveLength(1);

    // Same needle + items, category=experience → rejected.
    const asExperience = findPositionsForText(needle, items, {
      category: "experience",
    });
    expect(asExperience).toHaveLength(0);
  });

  it("requires exact match for a single-token skill", () => {
    const items = [
      item("React", { x0: 50, x1: 110, y0: 100, y1: 112 }),
      item("TypeScript", { x0: 115, x1: 220, y0: 100, y1: 112 }),
    ];
    expect(
      findPositionsForText("TypeScript", items, { category: "skill" }),
    ).toHaveLength(1);
    // A near-miss (different word entirely) shouldn't false-positive
    // even though the haystack contains adjacent tokens.
    expect(
      findPositionsForText("JavaScript", items, { category: "skill" }),
    ).toHaveLength(0);
  });
});

describe("isJunkItem", () => {
  const make = (text: string): PdfPositionItem => ({
    text,
    page: 1,
    x0: 0,
    y0: 0,
    x1: 10,
    y1: 12,
  });

  it("flags empty / whitespace-only items as junk", () => {
    expect(isJunkItem(make(""))).toBe(true);
    expect(isJunkItem(make("   "))).toBe(true);
  });

  it("flags single-character items as junk", () => {
    expect(isJunkItem(make("|"))).toBe(true);
    expect(isJunkItem(make("•"))).toBe(true);
    expect(isJunkItem(make("a"))).toBe(true);
  });

  it("flags all-punctuation runs as junk", () => {
    expect(isJunkItem(make("---"))).toBe(true);
    expect(isJunkItem(make("•••"))).toBe(true);
    expect(isJunkItem(make("...|..."))).toBe(true);
  });

  it("keeps 2+ char text items with any letter or digit", () => {
    expect(isJunkItem(make("CV"))).toBe(false);
    expect(isJunkItem(make("AI"))).toBe(false);
    expect(isJunkItem(make("C#"))).toBe(false);
    expect(isJunkItem(make("3D"))).toBe(false);
    expect(isJunkItem(make("emoji 🔗"))).toBe(false);
  });
});

describe("deriveSearchNeedle", () => {
  it("returns title + company for an experience entry", () => {
    expect(
      deriveSearchNeedle("experience", {
        title: "Hardware Developer",
        company: "Midnight Sun",
      }),
    ).toBe("Hardware Developer Midnight Sun");
  });

  it("returns description for a bullet", () => {
    expect(
      deriveSearchNeedle("bullet", { description: "Built CI/CD pipeline" }),
    ).toBe("Built CI/CD pipeline");
  });

  it("returns name for a skill", () => {
    expect(deriveSearchNeedle("skill", { name: "TypeScript" })).toBe(
      "TypeScript",
    );
  });

  it("falls back to description / name / title for unknown categories", () => {
    expect(
      deriveSearchNeedle("unknown" as never, { description: "fallback text" }),
    ).toBe("fallback text");
  });
});

describe("deriveSearchNeedles", () => {
  it("emits title+company first, then connector variant, then components for experience", () => {
    const candidates = deriveSearchNeedles("experience", {
      title: "Hardware Developer",
      company: "Midnight Sun",
    });
    expect(candidates[0]).toBe("Hardware Developer Midnight Sun");
    expect(candidates).toContain("Hardware Developer at Midnight Sun");
    expect(candidates).toContain("Hardware Developer");
    expect(candidates).toContain("Midnight Sun");
  });

  it("emits full description plus head/tail slices for long bullets", () => {
    const candidates = deriveSearchNeedles("bullet", {
      description:
        "Designed a lightweight exoskeleton wrist controller for an 8-DOF robotic arm puppeteer system",
    });
    expect(candidates[0]).toBe(
      "Designed a lightweight exoskeleton wrist controller for an 8-DOF robotic arm puppeteer system",
    );
    expect(candidates.length).toBeGreaterThan(1);
    // The head-8 slice should be present.
    expect(candidates).toContain(
      "Designed a lightweight exoskeleton wrist controller for an",
    );
  });

  it("emits only the description for a short bullet (no slices)", () => {
    const candidates = deriveSearchNeedles("bullet", {
      description: "Built the CI pipeline",
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toBe("Built the CI pipeline");
  });

  it("emits only the skill name (no fallbacks needed)", () => {
    expect(deriveSearchNeedles("skill", { name: "TypeScript" })).toEqual([
      "TypeScript",
    ]);
  });

  it("backward-compat: deriveSearchNeedle returns the first candidate", () => {
    expect(
      deriveSearchNeedle("experience", {
        title: "Engineer",
        company: "Acme",
      }),
    ).toBe("Engineer Acme");
  });
});

describe("deriveHeaderSearchNeedles", () => {
  it("keeps project header candidates separate from long descriptions", () => {
    expect(
      deriveHeaderSearchNeedles("project", {
        name: "Portfolio",
        description: "Built a full-stack portfolio with analytics",
      }),
    ).toEqual(["Portfolio"]);
  });
});

describe("findSourceLinksForBboxes", () => {
  it("associates PDF link annotations with the matching source line", () => {
    const items = [
      item("Portfolio", { x0: 72, x1: 130, y0: 100, y1: 112 }),
      item("React", { x0: 150, x1: 190, y0: 100, y1: 112 }),
      item("Other line", { x0: 72, x1: 130, y0: 140, y1: 152 }),
    ];
    const links = findSourceLinksForBboxes(
      [
        {
          url: "https://example.com/portfolio",
          page: 1,
          x0: 128,
          y0: 100,
          x1: 146,
          y1: 112,
        },
      ],
      items,
      [[1, 72, 100, 190, 112]],
    );

    expect(links).toEqual([
      {
        url: "https://example.com/portfolio",
        text: "Portfolio React",
        page: 1,
        bbox: [1, 128, 100, 146, 112],
      },
    ]);
  });

  it("does not attach link annotations from unrelated lines", () => {
    const links = findSourceLinksForBboxes(
      [
        {
          url: "https://example.com/unrelated",
          page: 1,
          x0: 72,
          y0: 180,
          x1: 120,
          y1: 192,
        },
      ],
      [item("Portfolio", { x0: 72, x1: 130, y0: 100, y1: 112 })],
      [[1, 72, 100, 130, 112]],
    );

    expect(links).toEqual([]);
  });
});
