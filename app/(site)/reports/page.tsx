import type { Metadata } from "next";
import Link from "next/link";
import { ArticleList, ArticleRow, PageHeader } from "@/components/content-list";
import { getReports, getTickers } from "@/lib/reports";

export const metadata: Metadata = {
  title: "研报",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const { ticker } = await searchParams;
  const reports = getReports().filter(
    (report) => !ticker || report.ticker === ticker,
  );
  const tickers = getTickers();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="Reports"
        title="研报"
        description="按股票与日期归档的个股报告。"
      />
      {tickers.length > 1 ? (
        <div className="mb-10 flex flex-wrap gap-2">
          <FilterChip href="/reports" active={!ticker}>
            全部
          </FilterChip>
          {tickers.map((code) => (
            <FilterChip
              key={code}
              href={`/reports?ticker=${encodeURIComponent(code)}`}
              active={ticker === code}
            >
              {code}
            </FilterChip>
          ))}
        </div>
      ) : null}
      {reports.length === 0 ? (
        <div className="mw-surface-flat flex items-center justify-center rounded-xl px-6 py-16">
          <p className="text-[var(--mw-text-secondary)]">还没有研报。</p>
        </div>
      ) : (
        <ArticleList>
          {reports.map((report) => (
            <ArticleRow
              key={report.url}
              href={report.url}
              title={`${report.name} ${report.ticker}`}
              description={report.oneLiner}
              meta={[report.date, report.score != null ? `${report.score} 分` : null]
                .filter(Boolean)
                .join(" · ")}
            />
          ))}
        </ArticleList>
      )}
    </main>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="mw-capsule"
      data-active={active}
    >
      {children}
    </Link>
  );
}
