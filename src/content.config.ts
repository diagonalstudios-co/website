import { defineCollection, z } from "astro:content";

const cases = defineCollection({
  type: "content",
  schema: z.object({
    client: z.string(),
    kind: z.string(),
    metric: z.string(),
    metricLabel: z.string(),
    description: z.string(),
    quote: z.string(),
    quoteAuthor: z.string(),
    quoteRole: z.string(),
  }),
});

export const collections = { cases };
