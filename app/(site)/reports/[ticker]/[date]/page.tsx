import Link from "next/link";
import { notFound } from "next/navigation";
import { getReport, getReports, syncReportsToPublic } from "@/lib/reports";

export function generateStaticParams() {
  syncReportsToPublic();
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
  syncReportsToPublic();
  const { ticker, date } = await params;
  const report = getReport(ticker, date);
  if (!report) notFound();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="border-b border-fd-border px-6 py-3 text-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            href="/reports"
            className="text-fd-muted-foreground hover:underline hover:underline-offset-4"
          >
            返回研报目录
          </Link>
          <p className="truncate text-fd-muted-foreground">
            {report.name} {report.ticker} · {report.date}
          </p>
        </div>
      </div>
      <iframe
        title={`${report.name} 研报`}
        src={report.htmlPath}
        className="w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
