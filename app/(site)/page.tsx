import Link from "next/link";
import { ArticleRow } from "@/components/content-list";
import { getReports } from "@/lib/reports";
import { blog, notes, sortArticles } from "@/lib/source";

export default function HomePage() {
  const reports = getReports().slice(0, 3);
  const writings = sortArticles([...notes.getPages(), ...blog.getPages()]).slice(
    0,
    3,
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6">
      {/* Hero */}
      <section className="relative pb-16 pt-20 sm:pb-24 sm:pt-28">
        {/* Subtle background glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px]"
          style={{ background: "var(--mw-hero-glow)" }}
          aria-hidden="true"
        />
        <p className="mw-eyebrow mb-4">MoneyWeb</p>
        <h1 className="mw-heading-xl max-w-2xl">个人投研笔记</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--mw-text-secondary)]">
          自己用的投研笔记、随笔，和做过的个股研报存档。
        </p>
      </section>

      {/* Reports — primary section */}
      <section className="pb-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="mw-heading-md">最近研报</h2>
          <Link
            href="/reports"
            className="mw-link text-sm font-medium text-[var(--mw-text-secondary)]"
          >
            查看全部
          </Link>
        </div>
        {reports.length === 0 ? (
          <p className="py-8 text-[var(--mw-text-secondary)]">还没有研报。</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li key={report.url}>
                <Link
                  href={report.url}
                  className="mw-surface mw-card-interactive group block rounded-2xl px-6 py-5"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-base font-semibold tracking-tight text-[var(--mw-text)] group-hover:text-[var(--mw-accent)] sm:text-lg">
                      {report.name}
                    </span>
                    <span className="text-sm font-medium text-[var(--mw-text-secondary)]">
                      {report.ticker}
                    </span>
                    {report.score != null ? (
                      <span className="mw-capsule text-xs">
                        {report.score} 分
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs font-medium tracking-wide text-[var(--mw-text-secondary)]">
                    {report.date}
                  </p>
                  {report.oneLiner ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--mw-text-secondary)]">
                      {report.oneLiner}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Writings — secondary section */}
      <section className="pb-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="mw-heading-md">最近笔记与随笔</h2>
          <div className="flex gap-4">
            <Link
              href="/notes"
              className="mw-link text-sm font-medium text-[var(--mw-text-secondary)]"
            >
              笔记
            </Link>
            <Link
              href="/blog"
              className="mw-link text-sm font-medium text-[var(--mw-text-secondary)]"
            >
              随笔
            </Link>
          </div>
        </div>
        {writings.length === 0 ? (
          <p className="py-8 text-[var(--mw-text-secondary)]">还没有文章。</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {writings.map((page) => (
              <ArticleRow
                key={page.url}
                href={page.url}
                title={page.data.title}
                description={page.data.description}
                meta={
                  page.url.startsWith("/notes")
                    ? `笔记 · ${String(page.data.date ?? "").slice(0, 10)}`
                    : `随笔 · ${String(page.data.date ?? "").slice(0, 10)}`
                }
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
