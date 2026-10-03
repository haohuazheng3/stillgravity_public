import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleView } from "@/components/blog/ArticleView";
import { getPost, postUrl, publishedPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = publishedPosts().map((p) => ({ category: p.category, slug: p.slug }));
  // Sentinel keeps the route buildable before the first article exists; it 404s.
  return posts.length ? posts : [{ category: "texting", slug: "coming-soon" }];
}

export async function generateMetadata(props: PageProps<"/blog/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await props.params;
  const post = getPost(category, slug);
  if (!post) return {};
  const meta = pageMetadata({
    title: post.title,
    description: post.description,
    path: postUrl(post),
    type: "article",
    ...(post.image ? { image: post.image.src } : {}),
  });
  return {
    ...meta,
    keywords: post.keywords,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: ["Still Gravity"] },
  };
}

export default async function ArticlePage(props: PageProps<"/blog/[category]/[slug]">) {
  const { category, slug } = await props.params;
  const post = getPost(category, slug);
  if (!post) notFound();
  return <ArticleView post={post} />;
}
