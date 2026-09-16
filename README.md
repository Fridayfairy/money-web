# MoneyWeb

个人投研笔记站：研报归档、金融学习笔记、随笔。GitHub 推送到 `main` 后由 Vercel 构建。

## 本地

```bash
npm install
npm run dev
```

## 更新内容

- 笔记：在 `content/notes` 新增 `.mdx`（可放相对路径图片）
- 随笔：在 `content/blog` 新增 `.mdx`
- 研报：把 analyze-stock 生成的 `TICKER_YYYYMMDD` 文件夹丢进 `content/inbox`，或直接执行：

```bash
npm run import:report -- 600547.SH
npm run import:report -- /path/to/600547.SH_20260907
```

然后 `git push`。构建时会把 `content/reports` 同步到静态目录，研报页用原 HTML 展示。
