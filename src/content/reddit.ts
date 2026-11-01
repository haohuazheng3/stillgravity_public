import "server-only";
import fs from "node:fs";
import path from "node:path";

/*
 * The Reddit threads Google shows for a page's "<question> reddit" search, recorded by hand
 * from the public results page (title, subreddit, comment count, age, link). We never fetch
 * Reddit itself. One JSON file per article in content/reddit/ (private repository only).
 */
export interface RedditThread {
  title: string;
  sub: string;
  url: string;
  comments: string;
  age: string;
}

export interface RedditSet {
  query: string;
  checked: string;
  threads: RedditThread[];
}

const DIR = path.join(process.cwd(), "content", "reddit");

export function redditSet(slug: string): RedditSet | null {
  const f = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(f)) return null;
  try {
    return JSON.parse(fs.readFileSync(f, "utf8")) as RedditSet;
  } catch (e) {
    console.error(`[reddit] bad file ${f}`, e);
    return null;
  }
}
