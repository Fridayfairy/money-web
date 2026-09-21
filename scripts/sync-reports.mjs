import { syncReports } from "./lib/reports-pipeline.mjs";

// dev / prebuild 钩子：幂等增强 content/reports 源目录后镜像到 public/raw-reports
syncReports({ root: process.cwd() });
