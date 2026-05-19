import type { BankEntry } from "@/types";
import { isChildEntry } from "@/lib/bank/count-derivation";

export interface ParserV2DraftAdoptionResult {
  adopt: boolean;
  reason:
    | "parser-v2-empty"
    | "legacy-empty"
    | "parser-v2-root-parity"
    | "parser-v2-fewer-roots";
  legacyRootCount: number;
  parserV2RootCount: number;
}

function rootCount(entries: BankEntry[]): number {
  return entries.filter((entry) => !isChildEntry(entry)).length;
}

export function shouldAdoptParserV2DraftEntries(input: {
  legacyEntries: BankEntry[];
  parserV2Entries: BankEntry[];
}): ParserV2DraftAdoptionResult {
  const legacyRootCount = rootCount(input.legacyEntries);
  const parserV2RootCount = rootCount(input.parserV2Entries);

  if (input.parserV2Entries.length === 0) {
    return {
      adopt: false,
      reason: "parser-v2-empty",
      legacyRootCount,
      parserV2RootCount,
    };
  }

  if (legacyRootCount === 0) {
    return {
      adopt: true,
      reason: "legacy-empty",
      legacyRootCount,
      parserV2RootCount,
    };
  }

  if (parserV2RootCount >= legacyRootCount) {
    return {
      adopt: true,
      reason: "parser-v2-root-parity",
      legacyRootCount,
      parserV2RootCount,
    };
  }

  return {
    adopt: false,
    reason: "parser-v2-fewer-roots",
    legacyRootCount,
    parserV2RootCount,
  };
}
