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
    <article className="mx-auto w-full max-w-2xl px-6 py-12">
      <p className="text-sm text-fd-muted-foreground">{formatDay(date)}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-3 leading-7 text-fd-muted-foreground">{description}</p>
      ) : null}
      {tags?.length ? (
        <p className="mt-3 text-sm text-fd-muted-foreground">{tags.join(" · ")}</p>
      ) : null}
      {toc && toc.length > 0 ? (
        <div className="mt-8">
          <InlineTOC items={toc} />
        </div>
      ) : null}
      <div className="prose mt-10 max-w-none">{children}</div>
    </article>
  );
}
