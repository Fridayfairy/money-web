import Link from "next/link";
import { ArticleRow } from "@/components/content-list";
import { getReports, syncReportsToPublic } from "@/lib/reports";
import { blog, notes, sortArticles } from "@/lib/source";

export default function HomePage() {
  syncReportsToPublic();
  const reports = getReports().slice(0, 3);
  const writings = sortArticles([...notes.getPages(), ...blog.getPages()]).slice(
    0,
    3,
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-sm tracking-wide text-fd-muted-foreground">MoneyWeb</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        个人投研笔记
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-fd-muted-foreground">
        存放自己的金融学习笔记、随笔，以及用 analyze-stock
        生成的个股研报。这里是学习存档，不是荐股。
      </p>

      <section className="mt-14">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-medium">最近研报</h2>
          <Link
            href="/reports"
            className="text-sm text-fd-muted-foreground hover:underline hover:underline-offset-4"
          >
            全部
          </Link>
        </div>
        {reports.length === 0 ? (
          <p className="py-6 text-fd-muted-foreground">还没有研报。把报告文件夹丢进 content/inbox 后执行 npm run import:report。</p>
        ) : (
          <ul className="divide-y divide-fd-border">
            {reports.map((report) => (
              <ArticleRow
                key={report.url}
                href={report.url}
                title={`${report.name} ${report.ticker}`}
                description={report.oneLiner}
                meta={report.date}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-medium">最近笔记与随笔</h2>
          <div className="flex gap-4 text-sm text-fd-muted-foreground">
            <Link href="/notes" className="hover:underline hover:underline-offset-4">
              笔记
            </Link>
            <Link href="/blog" className="hover:underline hover:underline-offset-4">
              随笔
            </Link>
          </div>
        </div>
        {writings.length === 0 ? (
          <p className="py-6 text-fd-muted-foreground">还没有文章。</p>
        ) : (
          <ul className="divide-y divide-fd-border">
            {writings.map((page) => (
              <ArticleRow
                key={page.url}
                href={page.url}
                title={page.data.title}
                description={page.data.description}
                meta={
                  page.url.startsWith("/notes")
                    ? `笔记 · ${String(page.data.date ?? "").slice(0, 10)}`
                    : `随笔 · ${String(page.data.date ?? "").slice(0, 10)}`
                }
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
