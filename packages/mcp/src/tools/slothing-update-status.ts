import { z } from "zod";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  opportunityId: z
    .string()
    .min(1)
    .describe("Opportunity id returned from list_opportunities."),
  status: z
    .enum([
      "pending",
      "saved",
      "applied",
      "interviewing",
      "offer",
      "rejected",
      "expired",
      "dismissed",
    ])
    .describe("New opportunity status."),
};

type Args = z.infer<z.ZodObject<typeof inputShape>>;

/**
 * `slothing_update_status` — change a tracked opportunity's status.
 *
 * Maps to PATCH /api/extension/opportunities/[id]/status.
 */
export const slothingUpdateStatusTool: ToolDefinition<typeof inputShape> = {
  name: "slothing_update_status",
  title: "Update opportunity status",
  description:
    "Update the status of a tracked Slothing opportunity, scoped to the authenticated user.",
  inputShape,
  annotations: {
    readOnlyHint: false,
    idempotentHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
  async handler(args: Args, client) {
    const encoded = encodeURIComponent(args.opportunityId);
    return client.patch<unknown>(
      `/api/extension/opportunities/${encoded}/status`,
      { status: args.status },
    );
  },
};
