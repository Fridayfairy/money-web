import Link from "next/link";
import { notFound } from "next/navigation";
import { getReport, getReports } from "@/lib/reports";

export function generateStaticParams() {
  return getReports().map((report) => ({
    ticker: report.ticker,
    date: report.date,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/reports/[ticker]/[date]">) {
  const { ticker, date } = await params;
  const report = getReport(ticker, date);
  if (!report) return { title: "研报" };
  return {
    title: `${report.name} ${report.ticker}`,
    description: report.oneLiner,
  };
}

export default async function ReportReaderPage({
  params,
}: PageProps<"/reports/[ticker]/[date]">) {
  const { ticker, date } = await params;
  const report = getReport(ticker, date);
  if (!report) notFound();

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Sticky toolbar */}
      <div className="mw-glass sticky top-0 z-30 border-b border-[var(--mw-border)] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/reports"
            className="mw-link shrink-0 text-sm font-medium text-[var(--mw-text-secondary)]"
          >
            ← 返回
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--mw-text)]">
              {report.name}{" "}
              <span className="font-normal text-[var(--mw-text-secondary)]">
                {report.ticker}
              </span>
            </p>
            <p className="truncate text-xs text-[var(--mw-text-secondary)]">
              {report.date}
              {report.score != null ? ` · ${report.score} 分` : ""}
              {report.oneLiner ? ` · ${report.oneLiner}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* iframe canvas frame */}
      <div className="flex-1 px-0 py-0 sm:px-4 sm:py-6 md:px-8">
        <div className="mx-auto h-full max-w-6xl overflow-hidden rounded-none border-0 sm:rounded-2xl sm:border sm:border-[var(--mw-border)]">
          <iframe
            title={`${report.name} 研报`}
            src={report.htmlPath}
            className="block min-h-[calc(100dvh-8rem)] w-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
