import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const cases = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cases" }),
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
