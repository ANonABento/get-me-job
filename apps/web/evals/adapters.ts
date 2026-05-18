import type { BankEntry, ContactInfo, GroupedBankEntries } from "@/types";
import type { EvalCase } from "./types.js";

const EMPTY_GROUPED_BANK_ENTRIES: GroupedBankEntries = {
  experience: [],
  skill: [],
  project: [],
  education: [],
  paragraph: [],
  bullet: [],
  achievement: [],
  certification: [],
  hackathon: [],
};

function makeEntry(
  testCase: EvalCase,
  category: BankEntry["category"],
  content: Record<string, unknown>,
): BankEntry {
  return {
    id: `eval-${category}-${testCase.id}`,
    userId: "eval-user",
    category,
    content,
    confidenceScore: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

export function profileToBankEntries(testCase: EvalCase): GroupedBankEntries {
  return {
    ...EMPTY_GROUPED_BANK_ENTRIES,
    bullet: [
      makeEntry(testCase, "bullet", {
        text: testCase.candidateProfile,
        description: testCase.candidateProfile,
        highlights: [testCase.candidateProfile],
      }),
    ],
  };
}

export function profileToContactInfo(testCase: EvalCase): ContactInfo {
  return {
    name: `Eval Candidate ${testCase.id}`,
    email: "candidate@example.com",
    location: "Remote",
  };
}

export function inferJobMetadata(testCase: EvalCase): {
  jobTitle: string;
  company: string;
} {
  const [firstLine = "Target Role"] = testCase.jobDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const atIndex = firstLine.toLowerCase().indexOf(" at ");
  if (atIndex > 0) {
    return {
      jobTitle: firstLine.slice(0, atIndex).trim(),
      company: firstLine.slice(atIndex + 4).trim() || "Target Company",
    };
  }

  return {
    jobTitle: firstLine,
    company: "Target Company",
  };
}
