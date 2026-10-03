/**
 * The book's structure, verbatim from the first edition's contents pages.
 * Used by the sales page, the Situation Finder and structured data.
 */

export type Layer = "field" | "deep";

export interface Chapter {
  id: string;
  title: string;
  page: number;
}

export interface Part {
  n: number;
  title: string;
  layer: Layer;
  intro: string;
  chapters: Chapter[];
}

export const PARTS: Part[] = [
  {
    n: 1,
    title: "The truths nobody told you",
    layer: "deep",
    intro:
      "Most dating advice fails because it starts with tactics. Tactics built on wrong beliefs collapse the first time she doesn’t follow the script. These eight truths come first because everything else is built on them.",
    chapters: [
      { id: "1.1", title: "Attraction isn’t earned. It’s felt.", page: 13 },
      { id: "1.2", title: "Clear intent, loose grip", page: 14 },
      { id: "1.3", title: "Stop auditioning. Start selecting.", page: 15 },
      { id: "1.4", title: "Neediness is the universal repellent", page: 16 },
      { id: "1.5", title: "Words lie. Effort doesn’t.", page: 17 },
      { id: "1.6", title: "Your texting problem is a meeting problem", page: 18 },
      { id: "1.7", title: "Rejection is a filter, not a verdict", page: 19 },
      { id: "1.8", title: "Lines don’t work. Presence does.", page: 20 },
    ],
  },
  {
    n: 2,
    title: "The man she notices",
    layer: "field",
    intro:
      "Before you say a word, she’s already reading you: how you stand, how you dress, how you move through a room, whether people seem glad you’re there.",
    chapters: [
      { id: "2.1", title: "Confidence is a track record, not a feeling", page: 22 },
      { id: "2.2", title: "Approach anxiety: why your brain lies to you", page: 23 },
      { id: "2.3", title: "Body language that says “relaxed, not needy”", page: 24 },
      { id: "2.4", title: "Style: the 80/20 of looking good", page: 25 },
      { id: "2.5", title: "Social proof: why she notices the guy everyone likes", page: 26 },
      { id: "2.6", title: "How to be more fun (humor is a skill)", page: 27 },
    ],
  },
  {
    n: 3,
    title: "Opening: from hello to her number",
    layer: "field",
    intro:
      "Most men never lose a woman’s interest. They never start the conversation in the first place. From the moment you notice her to the moment you have a way to see her again, in person and on the apps.",
    chapters: [
      { id: "3.1", title: "How to approach a woman without being creepy", page: 29 },
      { id: "3.2", title: "What to say first: openers that actually work", page: 30 },
      { id: "3.3", title: "How to never run out of things to say", page: 31 },
      { id: "3.4", title: "Flirting 101: turning a chat romantic", page: 32 },
      { id: "3.5", title: "How to get her number naturally", page: 33 },
      { id: "3.6", title: "The underrated path: meeting through your social life", page: 34 },
      { id: "3.7", title: "Dating apps I: photos and profile", page: 35 },
      { id: "3.8", title: "Dating apps II: openers and getting off the app", page: 36 },
    ],
  },
  {
    n: 4,
    title: "The texting playbook",
    layer: "field",
    intro:
      "Texting is where men lose women they already won over in person. Not with one terrible message, but with dozens of small signals of anxiety. Rules, scripts and recoveries for the moments that cause the most 2 a.m. panic.",
    chapters: [
      { id: "4.1", title: "The first text after you get her number", page: 38 },
      { id: "4.2", title: "The rules of texting rhythm", page: 39 },
      { id: "4.3", title: "How to keep a text conversation from dying", page: 40 },
      { id: "4.4", title: "She left you on read: what it means, what to do", page: 41 },
      { id: "4.5", title: "She takes hours to reply (or texts like a robot)", page: 42 },
      { id: "4.6", title: "Double texting: when it’s fine and when it kills", page: 43 },
      { id: "4.7", title: "How to ask her out over text", page: 44 },
      { id: "4.8", title: "Ten texts that quietly kill attraction", page: 45 },
    ],
  },
  {
    n: 5,
    title: "Reading her: signals and mixed messages",
    layer: "field",
    intro:
      "Most men aren’t bad at talking to women. They’re bad at reading the answer. Read interest the way women do: through patterns of behavior, not single moments.",
    chapters: [
      { id: "5.1", title: "How to tell if she likes you", page: 47 },
      { id: "5.2", title: "Signs she’s not interested (that men explain away)", page: 48 },
      { id: "5.3", title: "Mixed signals: decode them or drop them", page: 49 },
      { id: "5.4", title: "Is she testing you?", page: 50 },
      { id: "5.5", title: "The friend zone: how you got there, the honest way out", page: 51 },
      { id: "5.6", title: "She’s talking to other guys", page: 52 },
    ],
  },
  {
    n: 6,
    title: "The date",
    layer: "field",
    intro:
      "A first date isn’t a job interview or an audition. It’s a chance to find out whether you enjoy each other in person. How to plan it, lead it, build chemistry, and end it on a high.",
    chapters: [
      { id: "6.1", title: "Plan a first date that creates chemistry", page: 54 },
      { id: "6.2", title: "What to talk about on a first date", page: 55 },
      { id: "6.3", title: "Leading the date without being controlling", page: 56 },
      { id: "6.4", title: "Building chemistry: teasing, tension and touch", page: 57 },
      { id: "6.5", title: "How to end the date, and whether to kiss her", page: 58 },
      { id: "6.6", title: "What to text after the first date", page: 59 },
      { id: "6.7", title: "Second and third dates: going deeper", page: 60 },
    ],
  },
  {
    n: 7,
    title: "The talking stage",
    layer: "field",
    intro:
      "You’ve had a few dates. You text most days. Nobody has said what this is. Pacing, physical intimacy, and turning “talking” into something with a name, without breaking what you’ve built.",
    chapters: [
      { id: "7.1", title: "Pacing: why rushing kills it (and so does stalling)", page: 62 },
      { id: "7.2", title: "Physical escalation and consent", page: 63 },
      { id: "7.3", title: "The situationship: is this going anywhere?", page: 64 },
      { id: "7.4", title: "The DTR talk, word for word", page: 65 },
      { id: "7.5", title: "She’s hot and cold: what’s going on", page: 66 },
      { id: "7.6", title: "Attachment styles: why you obsess over some women", page: 67 },
    ],
  },
  {
    n: 8,
    title: "Leading the dynamic",
    layer: "deep",
    intro:
      "Most dating advice fails here in one of two ways: it tells you to be passive and “just be yourself,” or it sells manipulation scripts. This is the third path: you lead the emotional rhythm honestly, with skills that make you more attractive the better she understands them.",
    chapters: [
      { id: "8.1", title: "Emotional leadership: set the tone", page: 69 },
      { id: "8.2", title: "Warmth plus challenge: the tension behind attraction", page: 70 },
      { id: "8.3", title: "The investment principle", page: 71 },
      { id: "8.4", title: "Mystery without games", page: 72 },
      { id: "8.5", title: "Make her feel something", page: 73 },
      { id: "8.6", title: "The counterfeit table: why manipulation backfires", page: 74 },
      { id: "8.7", title: "When she pulls away", page: 75 },
    ],
  },
  {
    n: 9,
    title: "When it goes wrong",
    layer: "field",
    intro:
      "Rejection, ghosting, the slow fade, the breakup you didn’t see coming. Every man goes through these. What separates men isn’t whether it happens, but how they handle it, and who they become afterward.",
    chapters: [
      { id: "9.1", title: "Handling rejection in the moment", page: 77 },
      { id: "9.2", title: "“I don’t feel a spark”: what to say back", page: 78 },
      { id: "9.3", title: "She ghosted you", page: 79 },
      { id: "9.4", title: "She’s losing interest: what actually helps", page: 80 },
      { id: "9.5", title: "“Let’s just be friends”: should you?", page: 81 },
      { id: "9.6", title: "How to get over a girl you really liked", page: 82 },
      { id: "9.7", title: "Should you try to get your ex back?", page: 83 },
    ],
  },
  {
    n: 10,
    title: "Relationships that last",
    layer: "deep",
    intro:
      "Getting her is the beginning, not the finish line. The skills that win a woman’s interest are different from the ones that keep a relationship alive for years, drawn from decades of research into which couples thrive, and why.",
    chapters: [
      { id: "10.1", title: "Bids for connection: the tiny moments that decide it", page: 85 },
      { id: "10.2", title: "When she’s upset: listen first, fix later", page: 86 },
      { id: "10.3", title: "How to fight fair", page: 87 },
      { id: "10.4", title: "Jealousy, trust and her phone", page: 88 },
      { id: "10.5", title: "Keeping attraction alive long-term", page: 89 },
      { id: "10.6", title: "Red flags, green flags, and when to walk away", page: 90 },
    ],
  },
  {
    n: 11,
    title: "Understanding women",
    layer: "deep",
    intro:
      "You can’t connect with someone you’ve never tried to understand. Not decoding a mysterious species: women are people, with a perspective you’ve rarely been shown. See it clearly, and almost everything else gets easier.",
    chapters: [
      { id: "11.1", title: "What women actually want, according to research", page: 92 },
      { id: "11.2", title: "Her safety math", page: 93 },
      { id: "11.3", title: "Why she doesn’t say it directly", page: 94 },
      { id: "11.4", title: "Her emotions are information, not attacks", page: 95 },
      { id: "11.5", title: "The double binds women navigate", page: 96 },
      { id: "11.6", title: "Five myths about women that keep men stuck", page: 97 },
    ],
  },
  {
    n: 12,
    title: "The man behind it all",
    layer: "deep",
    intro:
      "Every technique works better when the man using it has a life worth sharing. Purpose, body, money, friends, emotions, attention and habits: the foundations that make attraction a byproduct instead of a project.",
    chapters: [
      { id: "12.1", title: "Purpose: put her in your life, not at the center of it", page: 99 },
      { id: "12.2", title: "Your body: training, sleep and the testosterone myth", page: 100 },
      { id: "12.3", title: "Money and ambition without the flex", page: 101 },
      { id: "12.4", title: "Friendships: the brotherhood you need", page: 102 },
      { id: "12.5", title: "Emotional mastery: name it, tame it, lead it", page: 103 },
      { id: "12.6", title: "Dopamine discipline: porn, scrolling and swiping", page: 104 },
      { id: "12.7", title: "Habits: the 66-day truth", page: 105 },
      { id: "12.8", title: "Charisma beyond dating", page: 106 },
    ],
  },
];

export const ALL_CHAPTERS = PARTS.flatMap((p) => p.chapters.map((c) => ({ ...c, part: p.n, partTitle: p.title })));

export function chapterById(id: string) {
  return ALL_CHAPTERS.find((c) => c.id === id) ?? null;
}

export const TOOLKIT = [
  { title: "The 30-day reset", pages: "108–109", blurb: "Week one builds the man, week two opens the door, week three takes you on a date, week four makes it who you are." },
  { title: "Texting cheat sheet", pages: "110", blurb: "For the moment you’re staring at the screen with your thumb hovering: twelve situations, twelve moves." },
  { title: "First-date checklist", pages: "111", blurb: "Before, during and after. Run it before you leave the house; finish it the next morning." },
  { title: "Field glossary", pages: "112", blurb: "Covert contract, liking gap, peak-end rule, soft no: the book’s vocabulary in one place." },
  { title: "Further reading", pages: "113", blurb: "The nine books this one stands on, from Attached to The Charisma Myth, and why each is worth your time." },
] as const;

export const TOOLS = [
  { name: "The science", blurb: "The research behind the advice, summarized honestly, including when a famous study is debated." },
  { name: "Say this", blurb: "Exact words for texts and conversations, to adapt to your own voice." },
  { name: "Field drill", blurb: "A small action you can take today. Drills change what you do." },
  { name: "Mistake", blurb: "The most common ways men sabotage themselves, flagged before you make them." },
  { name: "The truth", blurb: "The one idea to remember if you forget everything else on the page." },
] as const;

/** The four promises printed on the cover. */
export const COVER_PROMISES = [
  "Why she went cold, and what to send instead",
  "The signals she likes you, and the ones men explain away",
  "How to turn a dead chat into a real date",
  "The honest way out of the friend zone",
] as const;

export const BACK_COVER = [
  "83 chapters, each one solving a single problem",
  "A Situation Finder that maps 36 real situations to the exact page",
  "Word-for-word texts and conversations, with the weak version beside the good one",
  "The psychology of attraction, including why manipulation always backfires",
  "A 30-day reset, a texting cheat sheet, and a first-date checklist",
] as const;

export const THREE_RULES = [
  { title: "Respect is the baseline.", body: "Every line in the book assumes she is a person with her own mind, not a target." },
  { title: "Consent is the floor, not a formality.", body: "Enthusiasm, not the absence of no. Every step is its own yes." },
  { title: "Influence, never manipulation.", body: "Skills that make you more attractive the better she understands them." },
] as const;
