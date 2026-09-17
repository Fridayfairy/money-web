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
    <header className="mb-12">
      {eyebrow ? <p className="mw-eyebrow mb-3">{eyebrow}</p> : null}
      <h1 className="mw-heading-lg">{title}</h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--mw-text-secondary)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function ArticleList({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-3">{children}</ul>;
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
      <Link
        href={href}
        className="mw-surface-flat mw-card-interactive group block rounded-xl px-5 py-4 sm:px-6 sm:py-5"
      >
        {meta ? (
          <p className="text-xs font-medium tracking-wide text-[var(--mw-text-secondary)]">
            {meta}
          </p>
        ) : null}
        <h2 className="mt-1.5 text-base font-semibold tracking-tight text-[var(--mw-text)] group-hover:text-[var(--mw-accent)] sm:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--mw-text-secondary)]">
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
