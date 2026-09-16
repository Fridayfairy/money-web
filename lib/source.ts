import { loader } from "fumadocs-core/source";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

const articleSchema = pageSchema.extend({
  date: z.union([z.string(), z.date()]),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

const blogDocs = defineDocs({
  dir: "content/blog",
  docs: {
    schema: articleSchema,
  },
});

const notesDocs = defineDocs({
  dir: "content/notes",
  docs: {
    schema: articleSchema,
  },
});

export const blog = loader({
  baseUrl: "/blog",
  source: blogDocs.toFumadocsSource(),
});

export const notes = loader({
  baseUrl: "/notes",
  source: notesDocs.toFumadocsSource(),
});

export function articleTime(date: string | Date | undefined) {
  if (!date) return 0;
  return new Date(date).getTime();
}

export function sortArticles<T extends { data: { date?: string | Date } }>(
  pages: T[],
) {
  return [...pages].sort(
    (a, b) => articleTime(b.data.date) - articleTime(a.data.date),
  );
}
