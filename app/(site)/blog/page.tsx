import type { Metadata } from "next";
import { ArticleList, ArticleRow, PageHeader, formatDay } from "@/components/content-list";
import { blog, sortArticles } from "@/lib/source";

export const metadata: Metadata = {
  title: "随笔",
};

export default function BlogIndexPage() {
  const pages = sortArticles(blog.getPages());

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <PageHeader
        title="随笔"
        description="和研报分开的个人文字。文件放在 content/blog。"
      />
      <ArticleList>
        {pages.map((page) => (
          <ArticleRow
            key={page.url}
            href={page.url}
            title={page.data.title}
            description={page.data.description}
            meta={[formatDay(page.data.date), page.data.author]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </ArticleList>
    </main>
  );
}
