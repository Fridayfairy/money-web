import fs from "node:fs";
import path from "node:path";

export type ReportMeta = {
  ticker: string;
  date: string;
  name: string;
  oneLiner: string;
  score?: number;
  url: string;
  htmlPath: string;
};

const CONTENT_REPORTS = path.join(process.cwd(), "content/reports");
const HTML_FILE = "full-report-standalone.html";

function isReportDir(dir: string) {
  return fs.existsSync(path.join(dir, HTML_FILE));
}

function readMetaFile(dir: string, ticker: string, date: string): ReportMeta {
  const metaPath = path.join(dir, "meta.json");
  const url = `/reports/${ticker}/${date}`;
  const htmlPath = `/raw-reports/${ticker}/${date}/${HTML_FILE}`;

  if (fs.existsSync(metaPath)) {
    const raw = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Partial<ReportMeta>;
    return {
      ticker: raw.ticker || ticker,
      date: raw.date || date,
      name: raw.name || ticker,
      oneLiner: raw.oneLiner || "",
      score: raw.score,
      url,
      htmlPath,
    };
  }

  const oneLinerPath = path.join(dir, "one-liner.txt");
  const oneLiner = fs.existsSync(oneLinerPath)
    ? fs.readFileSync(oneLinerPath, "utf8").split("\n")[0]?.trim() || ""
    : "";
  const name = oneLiner.split(/\s+/)[0] || ticker;
  const scoreMatch = oneLiner.match(/(\d+)\s*分/);

  return {
    ticker,
    date,
    name,
    oneLiner,
    score: scoreMatch ? Number(scoreMatch[1]) : undefined,
    url,
    htmlPath,
  };
}

export function getReports(): ReportMeta[] {
  if (!fs.existsSync(CONTENT_REPORTS)) return [];

  const reports: ReportMeta[] = [];
  for (const tickerEnt of fs.readdirSync(CONTENT_REPORTS, { withFileTypes: true })) {
    if (!tickerEnt.isDirectory() || tickerEnt.name.startsWith(".")) continue;
    const tickerDir = path.join(CONTENT_REPORTS, tickerEnt.name);
    for (const dateEnt of fs.readdirSync(tickerDir, { withFileTypes: true })) {
      if (!dateEnt.isDirectory() || dateEnt.name.startsWith(".")) continue;
      const reportDir = path.join(tickerDir, dateEnt.name);
      if (!isReportDir(reportDir)) continue;
      reports.push(readMetaFile(reportDir, tickerEnt.name, dateEnt.name));
    }
  }

  return reports.sort((a, b) => b.date.localeCompare(a.date) || a.ticker.localeCompare(b.ticker));
}

export function getReport(ticker: string, date: string): ReportMeta | undefined {
  return getReports().find((report) => report.ticker === ticker && report.date === date);
}

export function getTickers() {
  return [...new Set(getReports().map((report) => report.ticker))];
}
