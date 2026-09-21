import fs from "node:fs";
import path from "node:path";

/**
 * MoneyWeb 研报共享管道。
 *
 * 职责：
 * 1. 对 content/reports 下的 full-report-standalone.html 做幂等增强
 *    （SEO/OG 标签 + 固定"返回 MoneyWeb"入口），增强落点是源目录，
 *    因此当前报告与未来导入的报告行为一致，public/raw-reports 只是镜像。
 * 2. 将 content/reports 整体镜像到 public/raw-reports。
 *
 * 幂等策略：所有注入内容包裹在成对的 HTML 注释标记
 *   <!-- mw:head:begin --> ... <!-- mw:head:end -->
 *   <!-- mw:body:begin --> ... <!-- mw:body:end -->
 * 之内；注入前先整块移除旧标记块再重新插入，且只在内容发生变化时写文件，
 * 因此重复运行 import / sync / prebuild 不会重复插入标签或按钮。
 */

const STANDALONE_HTML = "full-report-standalone.html";
const HEAD_BLOCK_RE = /<!-- mw:head:begin -->[\s\S]*?<!-- mw:head:end -->\n?/g;
const BODY_BLOCK_RE = /<!-- mw:body:begin -->[\s\S]*?<!-- mw:body:end -->\n?/g;
const MAX_DESCRIPTION_LENGTH = 200;

/** HTML 属性 / 文本安全转义（同时覆盖标签体与双引号属性场景） */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncate(text, max) {
  const value = String(text).trim();
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** 读取报告目录的 meta 上下文；meta.json 缺失或损坏时安全降级 */
function readMetaContext(dir, ticker, date) {
  let meta = {};
  try {
    meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
  } catch {
    // meta.json 缺失或非法 → 使用目录信息兜底
  }
  const name = typeof meta.name === "string" && meta.name.trim() ? meta.name.trim() : ticker;
  const oneLiner =
    typeof meta.oneLiner === "string" && meta.oneLiner.trim()
      ? meta.oneLiner.trim()
      : `${name} 游资 SKILLS 评审团深度研报 · MoneyWeb 归档`;
  return {
    ticker,
    date,
    name,
    oneLiner: truncate(oneLiner, MAX_DESCRIPTION_LENGTH),
  };
}

/** 生成 head 注入块：静态 SEO/OG 标签 + 同源动态 canonical / og:url */
function buildHeadBlock(ctx) {
  const title = `${ctx.name} ${ctx.ticker} · 深度研报`;
  const description = ctx.oneLiner;
  return `<!-- mw:head:begin -->
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:site_name" content="MoneyWeb">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<script>/* MoneyWeb · 同源动态 canonical / og:url，仅 http(s) 环境生效，不硬编码域名 */
(function(){try{var p=location.protocol;if(p!=="http:"&&p!=="https:")return;var u=location.origin+location.pathname;var l=document.querySelector('link[rel="canonical"]');if(!l){l=document.createElement("link");l.rel="canonical";document.head.appendChild(l);}l.href=u;var o=document.querySelector('meta[property="og:url"]');if(!o){o=document.createElement("meta");o.setAttribute("property","og:url");document.head.appendChild(o);}o.setAttribute("content",u);}catch(e){}})();
</script>
<!-- mw:head:end -->`;
}

/** 生成 body 注入块：固定右下角"返回 MoneyWeb"入口（iframe 场景自动隐藏） */
function buildBodyBlock() {
  return `<!-- mw:body:begin -->
<script>/* MoneyWeb · 嵌入 iframe 时隐藏悬浮返回入口（外层站点已提供工具栏） */
(function(){try{if(window.top!==window.self){document.documentElement.classList.add("mw-in-frame");}}catch(e){}})();
</script>
<style>/* MoneyWeb 增强层 · 全部 mw- 前缀，不依赖报告既有样式变量，深浅主题跟随报告 data-theme */
.mw-back{position:fixed;right:18px;bottom:18px;z-index:900;display:inline-flex;align-items:center;gap:7px;padding:10px 16px 10px 13px;border-radius:999px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;font-size:13px;font-weight:600;line-height:1;letter-spacing:.01em;color:#1d1d1f;background:rgba(255,255,255,.9);border:1px solid rgba(0,0,0,.12);box-shadow:0 8px 24px rgba(0,0,0,.16);-webkit-backdrop-filter:saturate(180%) blur(16px);backdrop-filter:saturate(180%) blur(16px);transition:transform .18s ease,box-shadow .18s ease,color .18s ease;}
.mw-back:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.22);color:#0066cc;}
.mw-back:focus-visible{outline:2px solid #0071e3;outline-offset:3px;}
.mw-back svg{width:13px;height:13px;flex:none;display:block;}
[data-theme="dark"] .mw-back{color:#f5f5f7;background:rgba(28,28,30,.88);border-color:rgba(255,255,255,.18);box-shadow:0 8px 24px rgba(0,0,0,.5);}
[data-theme="dark"] .mw-back:hover{box-shadow:0 12px 32px rgba(0,0,0,.55);color:#6cb8ff;}
html.mw-in-frame .mw-back{display:none;}
@media (max-width:640px){.mw-back{right:12px;bottom:12px;padding:9px 13px 9px 11px;font-size:12px;gap:6px;}}
@media (prefers-reduced-motion:reduce){.mw-back{transition:none;}.mw-back:hover{transform:none;box-shadow:0 8px 24px rgba(0,0,0,.16);}[data-theme="dark"] .mw-back:hover{box-shadow:0 8px 24px rgba(0,0,0,.5);}}
</style>
<a class="mw-back" href="/reports" target="_top" title="返回 MoneyWeb 研报列表" aria-label="返回 MoneyWeb 研报列表"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.5 3 2 8l4.5 5M2.5 8H14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>MoneyWeb</span></a>
<!-- mw:body:end -->`;
}

/**
 * 对单个 standalone HTML 字符串做幂等增强。
 * 返回 { html, changed, injectable }：
 * - 先剥离旧标记块（round-trip 无损），再在 </head> 前与 <body> 开标签后插入新块；
 * - 缺少 </head> 或 <body> 的畸形文档会跳过注入并返回 injectable: false。
 */
export function enhanceStandaloneHtml(html, ctx) {
  const stripped = html.replace(HEAD_BLOCK_RE, "").replace(BODY_BLOCK_RE, "");
  let next = stripped;
  let injectable = false;

  if (/<\/head>/i.test(next) && /<body[^>]*>/i.test(next)) {
    injectable = true;
    next = next
      .replace(/<\/head>/i, (closing) => `${buildHeadBlock(ctx)}\n${closing}`)
      .replace(/<body[^>]*>/i, (opening) => `${opening}\n${buildBodyBlock()}`);
  }

  return { html: next, changed: next !== html, injectable };
}

/** 增强一个报告目录（读取同目录 meta.json），返回是否发生写入 */
function enhanceReportDir(dir, ticker, date) {
  const htmlPath = path.join(dir, STANDALONE_HTML);
  if (!fs.existsSync(htmlPath)) return { status: "missing" };

  const original = fs.readFileSync(htmlPath, "utf8");
  const ctx = readMetaContext(dir, ticker, date);
  const result = enhanceStandaloneHtml(original, ctx);

  if (!result.injectable) {
    console.warn(`[reports-pipeline] 跳过（未找到 </head> 或 <body>）：${htmlPath}`);
    return { status: "skipped" };
  }
  if (result.changed) {
    fs.writeFileSync(htmlPath, result.html);
    return { status: "enhanced" };
  }
  return { status: "fresh" };
}

/** 遍历 content/reports/<ticker>/<date>/，幂等增强所有 standalone HTML */
export function enhanceAllReports(srcDir) {
  let enhanced = 0;
  let fresh = 0;
  if (!fs.existsSync(srcDir)) return { enhanced, fresh };

  for (const tickerEnt of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!tickerEnt.isDirectory() || tickerEnt.name.startsWith(".")) continue;
    const tickerDir = path.join(srcDir, tickerEnt.name);
    for (const dateEnt of fs.readdirSync(tickerDir, { withFileTypes: true })) {
      if (!dateEnt.isDirectory() || dateEnt.name.startsWith(".")) continue;
      const reportDir = path.join(tickerDir, dateEnt.name);
      const result = enhanceReportDir(reportDir, tickerEnt.name, dateEnt.name);
      if (result.status === "enhanced") {
        enhanced += 1;
        console.log(`[reports-pipeline] 已增强 ${tickerEnt.name}/${dateEnt.name}/${STANDALONE_HTML}`);
      } else if (result.status === "fresh") {
        fresh += 1;
      }
    }
  }
  if (enhanced === 0) {
    console.log(`[reports-pipeline] ${fresh} 份报告均为最新，无需写入`);
  }
  return { enhanced, fresh };
}

/**
 * 统一同步入口：先幂等增强源目录，再整体镜像到 public。
 * sync-reports.mjs（dev / prebuild）与 import-report.mjs 共用，避免逻辑漂移。
 */
export function syncReports({
  root = process.cwd(),
  srcDir = path.join(root, "content/reports"),
  destDir = path.join(root, "public/raw-reports"),
} = {}) {
  if (!fs.existsSync(srcDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
    console.log("No content/reports yet, skipped sync");
    return { enhanced: 0, fresh: 0, synced: false };
  }

  const { enhanced, fresh } = enhanceAllReports(srcDir);

  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log("Synced content/reports -> public/raw-reports");

  return { enhanced, fresh, synced: true };
}
