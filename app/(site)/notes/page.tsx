import type { Metadata } from "next";
import { ArticleList, ArticleRow, PageHeader, formatDay } from "@/components/content-list";
import { notes, sortArticles } from "@/lib/source";

export const metadata: Metadata = {
  title: "笔记",
};

export default function NotesIndexPage() {
  const pages = sortArticles(notes.getPages());

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <PageHeader
        title="笔记"
        description="金融学习、框架和复盘。Markdown 写在 content/notes，构建后即可阅读。"
      />
      <ArticleList>
        {pages.map((page) => (
          <ArticleRow
            key={page.url}
            href={page.url}
            title={page.data.title}
            description={page.data.description}
            meta={[formatDay(page.data.date), ...(page.data.tags ?? [])].join(" · ")}
          />
        ))}
      </ArticleList>
    </main>
  );
}
