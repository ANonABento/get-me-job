import { z } from "zod";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  title: z.string().min(1).max(200).describe("Opportunity title."),
  company: z.string().min(1).max(200).describe("Company or organization."),
  location: z.string().max(500).optional().describe("Optional location."),
  description: z
    .string()
    .max(50000)
    .optional()
    .describe("Optional job description or summary."),
  requirements: z
    .array(z.string().max(1000))
    .max(100)
    .optional()
    .describe("Optional requirements extracted from the posting."),
  responsibilities: z
    .array(z.string().max(1000))
    .max(100)
    .optional()
    .describe("Optional responsibilities extracted from the posting."),
  keywords: z
    .array(z.string().max(1000))
    .max(100)
    .optional()
    .describe("Optional keywords extracted from the posting."),
  url: z.string().url().optional().describe("Optional source posting URL."),
  source: z
    .string()
    .max(500)
    .optional()
    .describe("Optional source label, e.g. linkedin, greenhouse, agent."),
  sourceJobId: z
    .string()
    .max(500)
    .optional()
    .describe("Optional source job id."),
  salary: z.string().max(500).optional().describe("Optional salary text."),
  deadline: z.string().max(500).optional().describe("Optional deadline text."),
  notes: z.string().max(5000).optional().describe("Optional notes."),
  status: z
    .enum(["pending", "applied"])
    .optional()
    .describe("Import status. Defaults to pending; applied is allowed."),
};

type Args = z.infer<z.ZodObject<typeof inputShape>>;

/**
 * `slothing_push_job` — import a single scraped or agent-collected
 * opportunity into Slothing's pending/applied tracker.
 *
 * Maps to POST /api/opportunities/from-extension.
 */
export const slothingPushJobTool: ToolDefinition<typeof inputShape> = {
  name: "slothing_push_job",
  title: "Push job to Slothing",
  description:
    "Create a Slothing opportunity from a structured job payload. The opportunity is imported through the extension-token path and defaults to pending review.",
  inputShape,
  annotations: {
    readOnlyHint: false,
    idempotentHint: false,
    destructiveHint: false,
    openWorldHint: false,
  },
  async handler(args: Args, client) {
    return client.post<unknown>("/api/opportunities/from-extension", args);
  },
};
