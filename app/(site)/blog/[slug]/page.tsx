import { notFound } from "next/navigation";
import { Article } from "@/components/article";
import { getMDXComponents } from "@/components/mdx";
import { blog } from "@/lib/source";
import { createRelativeLink } from "fumadocs-ui/mdx";

export function generateStaticParams() {
  return blog.getPages().map((page) => ({ slug: page.slugs[0] }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const page = blog.getPage([slug]);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const page = blog.getPage([slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <Article
      title={page.data.title}
      description={page.data.description}
      date={page.data.date}
      tags={page.data.tags}
      toc={page.data.toc}
    >
      <MDX
        components={getMDXComponents({
          a: createRelativeLink(blog, page),
        })}
      />
    </Article>
  );
}
