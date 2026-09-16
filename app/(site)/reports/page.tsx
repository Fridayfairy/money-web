import type { Metadata } from "next";
import { ArticleList, ArticleRow, PageHeader } from "@/components/content-list";
import { getReports, getTickers, syncReportsToPublic } from "@/lib/reports";

export const metadata: Metadata = {
  title: "研报",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  syncReportsToPublic();
  const { ticker } = await searchParams;
  const reports = getReports().filter(
    (report) => !ticker || report.ticker === ticker,
  );
  const tickers = getTickers();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <PageHeader
        title="研报"
        description="analyze-stock 生成的个股深度报告，按日期归档。点进去看到的是原报告，不是改写后的摘要。"
      />
      {tickers.length > 1 ? (
        <div className="mb-8 flex flex-wrap gap-2 text-sm">
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
        <p className="text-fd-muted-foreground">还没有研报。</p>
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
    <a
      href={href}
      className={
        active
          ? "rounded-full border border-fd-foreground px-3 py-1"
          : "rounded-full border border-fd-border px-3 py-1 text-fd-muted-foreground"
      }
    >
      {children}
    </a>
  );
}
