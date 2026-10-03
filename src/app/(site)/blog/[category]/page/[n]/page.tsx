import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryView } from "@/components/blog/CategoryView";
import { CATEGORIES, categoryBySlug } from "@/content/categories";
import { PAGE_SIZE, postsInCategory } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { category: string; n: string }[] = [];
  for (const c of CATEGORIES) {
    const pages = Math.ceil(postsInCategory(c.slug).length / PAGE_SIZE);
    for (let n = 2; n <= pages; n++) out.push({ category: c.slug, n: String(n) });
  }
  // Next requires at least one entry to prerender; a sentinel that 404s keeps the route valid while every hub fits on one page.
  return out.length ? out : [{ category: CATEGORIES[0].slug, n: "2" }];
}

export async function generateMetadata(props: PageProps<"/blog/[category]/page/[n]">): Promise<Metadata> {
  const { category, n } = await props.params;
  const cat = categoryBySlug(category);
  if (!cat) return {};
  return pageMetadata({ title: `${cat.title} (page ${n})`, description: cat.description, path: `/blog/${cat.slug}/page/${n}` });
}

export default async function CategoryPaged(props: PageProps<"/blog/[category]/page/[n]">) {
  const { category, n } = await props.params;
  const cat = categoryBySlug(category);
  const page = Number(n);
  if (!cat || !Number.isInteger(page) || page < 2) notFound();
  const posts = postsInCategory(cat.slug);
  if ((page - 1) * PAGE_SIZE >= posts.length) notFound();
  return <CategoryView cat={cat} posts={posts} page={page} />;
}
