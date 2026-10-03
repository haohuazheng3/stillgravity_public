/**
 * Blog taxonomy. /blog is a navigation hub; every article lives under
 * /blog/<category>/<slug>, and each category page is a hub that can rank on its own
 * (own title, description, intro, breadcrumbs, paginated archive).
 */

export interface Category {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  chapters: string[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "texting",
    name: "Texting",
    title: "Texting her: what to send, when to wait, and what silence means",
    description:
      "Honest texting advice for men: first texts, left on read, slow replies, double texting, asking her out over text, and the messages that quietly kill attraction.",
    intro:
      "Texting is where men lose women they already won over in person, rarely with one terrible message and usually with a dozen small signals of anxiety. These guides give you rules of rhythm, exact words, and calm recoveries for the 2 a.m. moments.",
    chapters: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "1.6"],
  },
  {
    slug: "approaching",
    name: "Approaching & apps",
    title: "Meeting women: approaching, opening, and dating apps without the cringe",
    description:
      "How to approach a woman without being creepy, what to say first, how to keep a conversation alive, get her number naturally, and get real dates from the apps.",
    intro:
      "Most men never lose a woman’s interest; they never start the conversation. From the first hello to a way to see her again, in person and on the apps, with openers that sound like you on a good day.",
    chapters: ["2.2", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"],
  },
  {
    slug: "signals",
    name: "Reading her signals",
    title: "Does she like you? Reading signals, mixed messages and the friend zone",
    description:
      "How to tell if she likes you, the signs she isn’t interested that men explain away, mixed signals, “tests,” the friend zone and what to do when she’s talking to other guys.",
    intro:
      "Most men aren’t bad at talking to women. They’re bad at reading the answer. Learn to read interest the way women do: in clusters and patterns, not single moments, and to make a clear offer instead of decoding forever.",
    chapters: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "1.5"],
  },
  {
    slug: "dates",
    name: "Dates",
    title: "First dates and beyond: where to go, what to say, and how to end it",
    description:
      "First date ideas that create chemistry, what to talk about, leading without controlling, teasing and touch, the first kiss, and what to text after the date.",
    intro:
      "A first date isn’t a job interview or an audition. It’s a chance to find out whether you enjoy each other in person. Plan it, lead it, build chemistry honestly, and end it on a high.",
    chapters: ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"],
  },
  {
    slug: "talking-stage",
    name: "The talking stage",
    title: "The talking stage: pacing, situationships and the DTR talk",
    description:
      "How to pace early dating, read a situationship, have the define-the-relationship talk word for word, handle hot-and-cold behavior and understand attachment styles.",
    intro:
      "You’ve had a few dates, you text most days, and nobody has said what this is. These guides are about pacing, consent, and turning “talking” into something with a name without breaking what you’ve built.",
    chapters: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"],
  },
  {
    slug: "rejection",
    name: "Rejection & moving on",
    title: "When it goes wrong: rejection, ghosting, fading interest and getting over her",
    description:
      "How to handle rejection in the moment, “I don’t feel a spark,” being ghosted, fading interest, the friends offer, getting over a girl you really liked, and whether to win your ex back.",
    intro:
      "Every man goes through rejection, ghosting and the slow fade. What separates men isn’t whether it happens but how they handle it, and who they become afterward.",
    chapters: ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "1.7"],
  },
  {
    slug: "relationships",
    name: "Relationships",
    title: "Relationships that last: connection, conflict, jealousy and long-term attraction",
    description:
      "Research-backed relationship advice for men: bids for connection, listening when she’s upset, fighting fair, jealousy and trust, keeping attraction alive, and red flags.",
    intro:
      "Getting her is the beginning, not the finish line. The skills that keep a relationship alive for years are different from the ones that start it, and decades of research show which ones matter.",
    chapters: ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6"],
  },
  {
    slug: "attraction",
    name: "How attraction works",
    title: "How attraction actually works, and how to lead it honestly",
    description:
      "The psychology of attraction for men: neediness, clear intent, emotional leadership, warmth plus challenge, the investment principle, mystery without games, and why manipulation backfires.",
    intro:
      "Tactics built on wrong beliefs collapse the first time she doesn’t follow the script. This is the deep game: how attraction really works, and how to lead the dynamic with skills that make you more attractive the better she understands them.",
    chapters: ["1.1", "1.2", "1.3", "1.4", "1.8", "8.1", "8.2", "8.3", "8.4", "8.5", "8.6"],
  },
  {
    slug: "understanding-women",
    name: "Understanding women",
    title: "Understanding women: what research says she wants and what she won’t say",
    description:
      "What women report wanting, her safety math, why she doesn’t say it directly, emotions as information, the double binds women navigate, and the myths that keep men stuck.",
    intro:
      "Not decoding a mysterious species: women are people, with a perspective men have rarely been shown. See it clearly, and almost everything else gets easier.",
    chapters: ["11.1", "11.2", "11.3", "11.4", "11.5", "11.6"],
  },
  {
    slug: "self-improvement",
    name: "Becoming the man",
    title: "Self-improvement for men: purpose, body, money, friends and habits",
    description:
      "Practical self-improvement for men: purpose, training and sleep, money without the flex, friendship, emotional mastery, dopamine discipline, habits that stick and everyday charisma.",
    intro:
      "Every technique works better when the man using it has a life worth sharing. The foundations that make attraction a byproduct instead of a project, and that pay off far beyond dating.",
    chapters: ["2.1", "2.3", "2.4", "2.5", "2.6", "12.1", "12.2", "12.3", "12.4", "12.5", "12.6", "12.7", "12.8"],
  },
];

export function categoryBySlug(slug: string): Category | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}
