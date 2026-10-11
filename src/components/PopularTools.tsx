import Link from "next/link";
import { POPULAR_TOOLS } from "@/content/popular";
import { publishedPosts, postUrl } from "@/lib/blog";

/** Plain links to the most-used free tools, named the way people search for them. */
export function PopularTools({ className = "" }: { className?: string }) {
  const live = new Set(publishedPosts().map((p) => postUrl(p)));
  const tools = POPULAR_TOOLS.filter((t) => live.has(t.path));
  if (!tools.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {tools.map((t) => (
        <li key={t.path}>
          <Link href={t.path} className="chip">
            {t.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
