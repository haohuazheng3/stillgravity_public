import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getPost } from "@/lib/blog";
import { ArticleView } from "@/components/blog/ArticleView";

export const dynamic = "force-dynamic";

/** Owner-only preview of drafts and scheduled articles, rendered with the real article template. */
export default async function PreviewPage(props: PageProps<"/admin/preview/[category]/[slug]">) {
  await requireAdmin();
  const { category, slug } = await props.params;
  const post = getPost(category, slug, { includeDrafts: true });
  if (!post) notFound();
  return <ArticleView post={post} preview />;
}
