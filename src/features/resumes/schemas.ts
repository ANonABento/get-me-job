import { z } from "zod";

export const compareResumesSchema = z.object({
  beforeId: z.string().min(1, "Before resume ID is required"),
  afterId: z.string().min(1, "After resume ID is required"),
});

export type CompareResumesInput = z.infer<typeof compareResumesSchema>;
