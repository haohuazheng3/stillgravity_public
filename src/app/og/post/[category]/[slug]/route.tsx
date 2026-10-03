import { ogCard } from "@/lib/og";
import { getPost, publishedPosts } from "@/lib/blog";
import { categoryBySlug } from "@/content/categories";

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = publishedPosts().map((p) => ({ category: p.category, slug: p.slug }));
  return posts.length ? posts : [{ category: "texting", slug: "coming-soon" }];
}

/** Stable per-article share image: /og/post/<category>/<slug>. */
export async function GET(_req: Request, ctx: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await ctx.params;
  const post = getPost(category, slug);
  return ogCard({
    eyebrow: categoryBySlug(category)?.name ?? "Field guide",
    title: post?.title ?? "Still Gravity",
    subtitle: post?.description ? post.description.slice(0, 120) : undefined,
  });
}
