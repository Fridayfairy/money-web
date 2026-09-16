import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10">
      {eyebrow ? (
        <p className="text-sm tracking-wide text-fd-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl leading-7 text-fd-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function ArticleList({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-fd-border">{children}</ul>;
}

export function ArticleRow({
  href,
  title,
  description,
  meta,
}: {
  href: string;
  title: string;
  description?: string;
  meta?: string;
}) {
  return (
    <li>
      <Link href={href} className="group block py-5">
        {meta ? (
          <p className="text-sm text-fd-muted-foreground">{meta}</p>
        ) : null}
        <h2 className="mt-1 text-lg font-medium tracking-tight group-hover:underline group-hover:underline-offset-4">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 line-clamp-2 leading-7 text-fd-muted-foreground">
            {description}
          </p>
        ) : null}
      </Link>
    </li>
  );
}

export function formatDay(date: string | Date | undefined) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return String(date);
  return value.toISOString().slice(0, 10);
}
