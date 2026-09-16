import type { Metadata } from "next";
import { PageHeader } from "@/components/content-list";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <PageHeader
        title="关于"
        description="MoneyWeb 是一份个人站点：记录金融学习，归档 AI 生成的个股研报。"
      />
      <div className="space-y-6 leading-7">
        <p>
          研报来自本地的 analyze-stock 工作流。生成完成后，把报告目录放进项目，重新构建即可出现在「研报」栏目。笔记和随笔用 Markdown / MDX 写成，支持图片。
        </p>
        <section>
          <h2 className="text-lg font-medium">免责声明</h2>
          <p className="mt-3 text-fd-muted-foreground">
            本站所有文字、图表、评分与买卖区间均为个人学习记录或模型输出，不构成投资建议、要约或推荐。市场有风险，入市需谨慎。据此操作造成的盈亏由使用者自行承担。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium">如何更新内容</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-fd-muted-foreground">
            <li>笔记：在 content/notes 新增 .mdx 后 git push</li>
            <li>随笔：在 content/blog 新增 .mdx 后 git push</li>
            <li>研报：把 TICKER_YYYYMMDD 文件夹丢进 content/inbox，运行 npm run import:report，再推送</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
