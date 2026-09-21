import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { syncReports } from "./lib/reports-pipeline.mjs";

const ROOT = process.cwd();
const CONTENT_REPORTS = path.join(ROOT, "content/reports");
const INBOX = path.join(ROOT, "content/inbox");
const DEFAULT_PLUGIN_REPORTS = path.join(
  os.homedir(),
  ".cursor/plugins/local/stock-deep-analyzer/skills/deep-analysis/scripts/reports",
);

function parseFolderName(name) {
  const match = name.match(/^(.+)_(\d{8})$/);
  if (!match) return null;
  const ticker = match[1];
  const raw = match[2];
  const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  return { ticker, date };
}

function extractMeta(dir, ticker, date) {
  const oneLinerPath = path.join(dir, "one-liner.txt");
  const oneLinerFull = fs.existsSync(oneLinerPath)
    ? fs.readFileSync(oneLinerPath, "utf8").trim()
    : "";
  const first = oneLinerFull.split("\n").map((line) => line.trim()).find(Boolean) || "";
  const name = first.split(/\s+/)[0] || ticker;
  const scoreMatch = first.match(/(\d+)\s*分/);
  return {
    ticker,
    date,
    name,
    oneLiner: first,
    ...(scoreMatch ? { score: Number(scoreMatch[1]) } : {}),
  };
}

function importDir(src) {
  const folderName = path.basename(src.replace(/[/\\]$/, ""));
  const parsed = parseFolderName(folderName);
  if (!parsed) {
    throw new Error(`无法解析目录名 ${folderName}，需要形如 TICKER_YYYYMMDD`);
  }
  const html = path.join(src, "full-report-standalone.html");
  if (!fs.existsSync(html)) {
    throw new Error(`缺少 full-report-standalone.html：${src}`);
  }
  const dest = path.join(CONTENT_REPORTS, parsed.ticker, parsed.date);
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  const meta = extractMeta(src, parsed.ticker, parsed.date);
  fs.writeFileSync(path.join(dest, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`已导入 ${parsed.ticker} ${parsed.date}`);
  console.log(`URL: /reports/${parsed.ticker}/${parsed.date}`);
  return dest;
}

function findLatestTicker(reportsDir, ticker) {
  if (!fs.existsSync(reportsDir)) return null;
  const prefix = `${ticker}_`;
  const dirs = fs
    .readdirSync(reportsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(prefix))
    .map((entry) => entry.name)
    .sort();
  if (dirs.length === 0) return null;
  return path.join(reportsDir, dirs[dirs.length - 1]);
}

function processInbox() {
  if (!fs.existsSync(INBOX)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(INBOX, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    importDir(path.join(INBOX, entry.name));
    count += 1;
  }
  return count;
}

const arg = process.argv[2];
try {
  if (!arg) {
    const count = processInbox();
    if (count === 0) {
      console.log("用法:");
      console.log("  npm run import:report -- 600547.SH");
      console.log("  npm run import:report -- /path/to/TICKER_YYYYMMDD");
      console.log("  或把文件夹丢进 content/inbox 后再运行 npm run import:report");
      process.exit(1);
    }
  } else if (fs.existsSync(arg) && fs.statSync(arg).isDirectory()) {
    importDir(path.resolve(arg));
  } else {
    const reportsDir = process.env.UZI_REPORTS_DIR || DEFAULT_PLUGIN_REPORTS;
    const dir = findLatestTicker(reportsDir, arg);
    if (!dir) {
      throw new Error(`在 ${reportsDir} 未找到 ${arg} 的报告`);
    }
    importDir(dir);
  }
  // 幂等增强 + 镜像，与 dev / prebuild 的 sync-reports.mjs 共享同一管道
  syncReports({ root: ROOT });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
