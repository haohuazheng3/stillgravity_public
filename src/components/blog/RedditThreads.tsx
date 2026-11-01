import { redditSet } from "@/content/reddit";

function formatChecked(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * "The threads you'd find": the Reddit discussions Google ranks for this question, so a reader
 * who searched with "reddit" gets the reading list and our take in one place.
 */
export function RedditThreads({ slug }: { slug: string }) {
  const set = redditSet(slug);
  if (!set || !set.threads.length) return null;
  return (
    <aside aria-label="Reddit threads on this question" className="slab-inset not-prose my-6 px-5 py-4 font-sans">
      <p className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-ink-4">
        The Reddit threads Google shows for “{set.query}” · checked {formatChecked(set.checked)}
      </p>
      <ol className="mt-3 space-y-2">
        {set.threads.map((t) => (
          <li key={t.url} className="text-[0.94rem] leading-snug">
            <a href={t.url} rel="nofollow noopener" target="_blank" className="font-semibold text-ink underline-offset-4 hover:underline">
              {t.title}
            </a>
            <span className="mt-0.5 block text-[0.8rem] text-ink-4">
              r/{t.sub} · {t.comments} comments · {t.age}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
