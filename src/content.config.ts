import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { CATEGORY_NAMES } from "./lib/categories";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    category: z.enum(CATEGORY_NAMES),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.string(),
    note: z.string().optional(),
    // Origin axis: where the work came from, independent of the discipline
    // category above. Optional so untagged projects still build.
    track: z.string().optional(),
    source: z.string().optional(),
    context: z.string().optional(),
    metrics: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    cover: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const collections = { projects };
