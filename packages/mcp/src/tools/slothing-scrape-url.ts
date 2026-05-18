import { z } from "zod";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  url: z
    .string()
    .url()
    .describe("Supported job-board posting URL to scrape into a preview."),
};

type Args = z.infer<z.ZodObject<typeof inputShape>>;

/**
 * `slothing_scrape_url` — scrape a supported job-board URL and return a
 * structured opportunity preview. This does not save the result; callers can
 * pass the returned fields to `slothing_push_job`.
 *
 * Maps to POST /api/extension/opportunities/scrape.
 */
export const slothingScrapeUrlTool: ToolDefinition<typeof inputShape> = {
  name: "slothing_scrape_url",
  title: "Scrape opportunity URL",
  description:
    "Scrape a supported job-board URL and return a structured opportunity preview without saving it.",
  inputShape,
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  async handler(args: Args, client) {
    return client.post<unknown>("/api/extension/opportunities/scrape", {
      url: args.url,
    });
  },
};
