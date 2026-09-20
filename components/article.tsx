import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import type { TOCItemType } from "fumadocs-core/toc";
import type { ReactNode } from "react";
import { formatDay } from "@/components/content-list";

export function Article({
  title,
  description,
  date,
  tags,
  toc,
  children,
}: {
  title: string;
  description?: string;
  date?: string | Date;
  tags?: string[];
  toc?: TOCItemType[];
  children: ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-[720px] px-6 py-16 sm:py-20">
      {/* Reading cover */}
      <header className="mb-12">
        {date ? (
          <p className="text-sm font-medium tracking-wide text-[var(--mw-text-secondary)]">
            {formatDay(date)}
          </p>
        ) : null}
        <h1 className="mt-3 mw-heading-lg">{title}</h1>
        {description ? (
          <p className="mt-4 text-lg leading-relaxed text-[var(--mw-text-secondary)]">
            {description}
          </p>
        ) : null}
        {tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="mw-capsule">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {/* Inline TOC — stable class for print/styling control */}
      {toc && toc.length > 0 ? (
        <div className="mw-article-toc mb-10">
          <InlineTOC items={toc} />
        </div>
      ) : null}

      {/* Prose body */}
      <div className="mw-prose">{children}</div>
    </article>
  );
}
