import { z } from "zod";

export const eventSchema = z
  .object({
    userId: z.string(),
    eventName: z.string(),
    timestamp: z.coerce.date(),
    properties: z.record(z.string(), z.any()).optional(),
  })
  .strict();
