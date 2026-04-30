import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_OPPORTUNITY_FILTERS,
  buildOpportunityTeamSize,
  filterOpportunities,
  formatOpportunityDate,
  formatOpportunityLocation,
  formatOpportunitySalary,
  getOpportunityFilterOptions,
  groupOpportunitiesByStatus,
  hasActiveOpportunityFilters,
  parseOptionalNumber,
  parseOpportunityViewMode,
  readOpportunityViewMode,
  splitDelimitedList,
  trimToUndefined,
  writeOpportunityViewMode,
  type Opportunity,
} from "./utils";

const opportunities: Opportunity[] = [
  {
    id: "1",
    type: "job",
    title: "Frontend Engineer",
    company: "Acme",
    source: "greenhouse",
    city: "Toronto",
    province: "ON",
    country: "Canada",
    remoteType: "hybrid",
    summary: "Build product experiences",
    requiredSkills: ["React"],
    techStack: ["React", "TypeScript"],
    salaryMin: 120000,
    salaryMax: 150000,
    salaryCurrency: "CAD",
    deadline: "2026-05-10",
    status: "saved",
    scrapedAt: "2026-04-20T00:00:00.000Z",
    tags: ["frontend", "platform"],
    createdAt: "2026-04-20T00:00:00.000Z",
    updatedAt: "2026-04-20T00:00:00.000Z",
  },
  {
    id: "2",
    type: "hackathon",
    title: "Climate Sprint",
    company: "Open Data Collective",
    source: "devpost",
    remoteType: "remote",
    summary: "Prototype climate data tools",
    requiredSkills: ["Data visualization"],
    techStack: ["Python", "React"],
    deadline: "2026-05-01",
    status: "pending",
    scrapedAt: "2026-04-22T00:00:00.000Z",
    tags: ["climate", "portfolio"],
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "3",
    type: "job",
    title: "Backend Engineer",
    company: "Beta",
    source: "linkedin",
    summary: "Own platform APIs",
    requiredSkills: ["Go"],
    techStack: ["Go", "PostgreSQL"],
    salaryMin: 170000,
    deadline: "2026-06-01",
    status: "interviewing",
    scrapedAt: "2026-04-18T00:00:00.000Z",
    tags: ["backend"],
    createdAt: "2026-04-18T00:00:00.000Z",
    updatedAt: "2026-04-18T00:00:00.000Z",
  },
];

describe("filterOpportunities", () => {
  it("sorts default results by nearest deadline", () => {
    expect(
      filterOpportunities(opportunities, DEFAULT_OPPORTUNITY_FILTERS).map(
        (opportunity) => opportunity.id,
      ),
    ).toEqual(["2", "1", "3"]);
  });

  it("searches title, company, summary, skills, tech stack, and tags", () => {
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        searchQuery: "climate",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["2"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        searchQuery: "postgre",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["3"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        searchQuery: "PLATFORM",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["1", "3"]);
  });

  it("filters by tab, status, source, remote type, tag, and tech stack", () => {
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        typeTab: "hackathon",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["2"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        status: "interviewing",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["3"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        source: "greenhouse",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["1"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        remoteType: "remote",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["2"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        tag: "backend",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["3"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        techStack: "React",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["2", "1"]);
  });

  it("sorts by scraped date, company, and salary", () => {
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        sortBy: "scrapedAt",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["2", "1", "3"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        sortBy: "company",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["1", "3", "2"]);
    expect(
      filterOpportunities(opportunities, {
        ...DEFAULT_OPPORTUNITY_FILTERS,
        sortBy: "salary",
      }).map((opportunity) => opportunity.id),
    ).toEqual(["3", "1", "2"]);
  });
});

describe("hasActiveOpportunityFilters", () => {
  it("detects default and non-default filter states", () => {
    expect(hasActiveOpportunityFilters(DEFAULT_OPPORTUNITY_FILTERS)).toBe(
      false,
    );
    expect(
      hasActiveOpportunityFilters({
        ...DEFAULT_OPPORTUNITY_FILTERS,
        searchQuery: "react",
      }),
    ).toBe(true);
    expect(
      hasActiveOpportunityFilters({
        ...DEFAULT_OPPORTUNITY_FILTERS,
        typeTab: "job",
      }),
    ).toBe(true);
    expect(
      hasActiveOpportunityFilters({
        ...DEFAULT_OPPORTUNITY_FILTERS,
        status: "saved",
      }),
    ).toBe(true);
  });
});

describe("getOpportunityFilterOptions", () => {
  it("returns unique sorted tags and tech stacks", () => {
    expect(getOpportunityFilterOptions(opportunities)).toEqual({
      tags: ["backend", "climate", "frontend", "platform", "portfolio"],
      techStacks: ["Go", "PostgreSQL", "Python", "React", "TypeScript"],
    });
  });
});

describe("opportunity view mode helpers", () => {
  it("parses unsupported view modes as list", () => {
    expect(parseOpportunityViewMode("kanban")).toBe("kanban");
    expect(parseOpportunityViewMode("list")).toBe("list");
    expect(parseOpportunityViewMode("grid")).toBe("list");
    expect(parseOpportunityViewMode(null)).toBe("list");
  });

  it("reads and writes view mode defensively", () => {
    const storage = {
      getItem: () => "kanban",
      setItem: vi.fn(),
    };

    expect(readOpportunityViewMode(storage)).toBe("kanban");

    writeOpportunityViewMode(storage, "list");
    expect(storage.setItem).toHaveBeenCalledWith(
      "get_me_job_opportunities_view",
      "list",
    );

    expect(
      readOpportunityViewMode({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toBe("list");
    expect(() =>
      writeOpportunityViewMode(
        {
          setItem: () => {
            throw new Error("blocked");
          },
        },
        "kanban",
      ),
    ).not.toThrow();
  });
});

describe("groupOpportunitiesByStatus", () => {
  it("returns every kanban status bucket and preserves item order", () => {
    const grouped = groupOpportunitiesByStatus(opportunities);

    expect(Object.keys(grouped)).toEqual([
      "pending",
      "saved",
      "applied",
      "interviewing",
      "offer",
      "rejected",
      "expired",
      "dismissed",
    ]);
    expect(grouped.pending.map((opportunity) => opportunity.id)).toEqual(["2"]);
    expect(grouped.saved.map((opportunity) => opportunity.id)).toEqual(["1"]);
    expect(grouped.interviewing.map((opportunity) => opportunity.id)).toEqual([
      "3",
    ]);
    expect(grouped.applied).toEqual([]);
  });
});

describe("formatOpportunity helpers", () => {
  it("formats location from available pieces and falls back to remote type", () => {
    expect(formatOpportunityLocation(opportunities[0])).toBe(
      "Toronto, ON, Canada",
    );
    expect(formatOpportunityLocation(opportunities[1])).toBe("Remote");
    expect(
      formatOpportunityLocation({ ...opportunities[1], remoteType: undefined }),
    ).toBe("Location TBD");
  });

  it("formats salary ranges, bounds, and missing salary", () => {
    expect(formatOpportunitySalary(opportunities[0])).toBe(
      "CA$120,000 - CA$150,000",
    );
    expect(formatOpportunitySalary(opportunities[2])).toBe("From $170,000");
    expect(formatOpportunitySalary(opportunities[1])).toBe("Compensation TBD");
  });

  it("handles zero salary values and invalid currency input", () => {
    expect(
      formatOpportunitySalary({
        ...opportunities[2],
        salaryMin: 0,
        salaryMax: undefined,
      }),
    ).toBe("From $0");
    expect(
      formatOpportunitySalary({ ...opportunities[2], salaryCurrency: "US" }),
    ).toBe("From $170,000");
  });

  it("formats date-only deadlines without timezone drift", () => {
    expect(formatOpportunityDate("2026-05-18")).toBe("May 18, 2026");
    expect(formatOpportunityDate("2026-05-18T14:00:00.000Z")).toBe(
      "May 18, 2026",
    );
    expect(formatOpportunityDate("not-a-date")).toBe("Invalid date");
  });
});

describe("form value helpers", () => {
  it("splits comma-delimited fields and removes empty values", () => {
    expect(splitDelimitedList("React, TypeScript, , Next.js ")).toEqual([
      "React",
      "TypeScript",
      "Next.js",
    ]);
  });

  it("trims optional strings to undefined when blank", () => {
    expect(trimToUndefined("  https://example.com ")).toBe(
      "https://example.com",
    );
    expect(trimToUndefined("   ")).toBeUndefined();
  });

  it("parses optional numbers only when finite", () => {
    expect(parseOptionalNumber(" 42 ")).toBe(42);
    expect(parseOptionalNumber("")).toBeUndefined();
    expect(parseOptionalNumber("not-a-number")).toBeUndefined();
  });

  it("normalizes optional hackathon team sizes", () => {
    expect(buildOpportunityTeamSize("2", "5")).toEqual({ min: 2, max: 5 });
    expect(buildOpportunityTeamSize("5", "2")).toEqual({ min: 2, max: 5 });
    expect(buildOpportunityTeamSize("", "4")).toEqual({ min: 4, max: 4 });
    expect(buildOpportunityTeamSize("0", "-1")).toBeUndefined();
  });
});
