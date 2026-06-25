import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each project = one job Noah has completed. These fields map 1:1 to the
// fields Noah fills in via the /admin dashboard (see public/admin/config.yml).
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    location: z.string().optional(),
    date: z.coerce.date(),
    summary: z.string(),
    // Primary photo shown on cards + hero of the project.
    coverImage: z.string(),
    // Additional photos for the gallery on the project page.
    gallery: z.array(z.string()).optional().default([]),
    // Featured projects show on the home page.
    featured: z.boolean().optional().default(false),
    // Lower number = shows earlier. Optional manual ordering.
    order: z.number().optional().default(0),
  }),
});

export const collections = { projects };
