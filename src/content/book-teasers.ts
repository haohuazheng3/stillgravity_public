import "server-only";
import teasers from "../../content/book/teasers.json";

/*
 * The opening lines of each chapter, taken verbatim from the book (content/book/teasers.json,
 * private repository only). Pages show them under a tool result or a chapter card, and the
 * Part 1 follow-up email quotes one, so a reader sees how a chapter actually starts.
 */
const TEASERS = teasers as Record<string, string>;

export function chapterTeaser(id: string | undefined | null): string | undefined {
  return id ? TEASERS[id] : undefined;
}
