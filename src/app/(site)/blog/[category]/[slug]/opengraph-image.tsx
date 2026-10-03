import { ogCard, OG_SIZE } from "@/lib/og";
import { getPost, publishedPosts } from "@/lib/blog";
import { categoryBySlug } from "@/content/categories";

export const alt = "Still Gravity field guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  const posts = publishedPosts().map((p) => ({ category: p.category, slug: p.slug }));
  return posts.length ? posts : [{ category: "texting", slug: "coming-soon" }];
}

export default async function Image(props: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await props.params;
  const post = getPost(category, slug);
  return ogCard({
    eyebrow: categoryBySlug(category)?.name ?? "Field guide",
    title: post?.title ?? "Still Gravity",
    subtitle: post?.description ? post.description.slice(0, 120) : undefined,
  });
}
