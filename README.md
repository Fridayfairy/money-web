# MoneyWeb

个人投研笔记站：研报归档、金融学习笔记、随笔。推送到 GitHub `main` 后由 Vercel 自动构建部署。

线上域名：`https://moneybackbackhome.top`（`www` 亦可）。

## 本地开发

```bash
npm install
npm run dev
```

`dev` / `build` 前会自动把 `content/reports` 同步到 `public/raw-reports`（仅构建与本地用，页面请求时不会再写盘）。

## 更新内容（日常维护）

改完内容后统一：

```bash
git add -A
git commit -m "简述改了什么"
git push origin main
```

等 Vercel 部署完成即可在域名上看到更新。

---

### 笔记 `content/notes/*.mdx`

1. 新建文件，例如 `content/notes/my-note.mdx`
2. 文件头：

```yaml
---
title: 标题
description: 列表里显示的一句话
date: 2026-09-17
tags: [学习]
---
```

3. 正文用 Markdown；图片可放同目录或 `public/`，用相对路径引用
4. 访问路径：`/notes/<文件名不含扩展名>`

### 随笔 `content/blog/*.mdx`

同上，目录换成 `content/blog`，路径为 `/blog/<slug>`。可用 `author` 字段。

### 研报（analyze-stock 产出）

报告目录名必须是 `TICKER_YYYYMMDD`，且内含 `full-report-standalone.html`（通常还有 `one-liner.txt`）。

**方式 A · 从插件默认目录导入最新一份**

```bash
npm run import:report -- 600547.SH
```

默认在 `~/.cursor/plugins/local/stock-deep-analyzer/skills/deep-analysis/scripts/reports` 找该 ticker 最新文件夹。可用环境变量覆盖：

```bash
UZI_REPORTS_DIR=/你的/reports目录 npm run import:report -- 600547.SH
```

**方式 B · 指定文件夹路径**

```bash
npm run import:report -- /path/to/600547.SH_20260916
```

**方式 C · inbox**

把 `TICKER_YYYYMMDD` 文件夹放进 `content/inbox/`，再执行：

```bash
npm run import:report
```

导入结果落在 `content/reports/<TICKER>/<YYYY-MM-DD>/`，并生成 `meta.json`。站点路径：

`/reports/<TICKER>/<YYYY-MM-DD>`

然后照常 `git commit` + `git push`。

---

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地预览（含研报同步） |
| `npm run build` | 生产构建（含研报同步） |
| `npm run import:report -- …` | 导入研报到 `content/reports` |
| `npm run lint` | ESLint |

## 注意

- 不要在运行时往 `public/` 写文件；研报静态资源只靠构建前同步。
- `public/raw-reports` 由脚本生成，一般不必手改或提交（以仓库 `.gitignore` 为准）；**要提交的是** `content/reports`。
- 域名 DNS 在腾讯云；Vercel 项目 Domains 已绑定时，平时只需推代码，不必反复改解析。
