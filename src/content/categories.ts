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
  /** The hub's own target keyword, validated like any page's. */
  keyword?: string;
  /** The framework a reader needs before picking a guide: answer-first, one idea per block. */
  guide?: { q: string; a: string }[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "texting",
    name: "Texting",
    title: "How to text women: what to send, when to wait, and what silence means",
    description:
      "How to text women without the anxiety: first texts, rhythm, slow replies, dry texters, double texting, and asking her out over text, with exact words to adapt.",
    intro:
      "Texting is where men lose women they already won over in person, rarely with one terrible message and usually with a dozen small signals of anxiety. These guides give you rules of rhythm, exact words, and calm recoveries for the 2 a.m. moments.",
    chapters: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "1.6"],
    keyword: "how to text women",
    guide: [
      { q: "What is texting actually for?", a: "Setting up the next time you see her. Texting builds a little momentum between meetings; it can’t replace them. Men who try to win her over text usually lose the in-person spark they already had." },
      { q: "How often should I text her?", a: "Roughly match her rhythm and keep it light. If her replies are shorter and slower than yours for a week, stop adding volume and make one clear plan instead. Long silences after a good date are normal; a pattern of one-word replies is information." },
      { q: "What do slow or dry replies mean?", a: "Usually less than you fear, sometimes exactly what you fear. A busy week reads very differently from a steady drop in effort. Look at the trend over several days, not one message, and never send a question mark." },
      { q: "Which tool do I need tonight?", a: "Unsure whether to send anything: Should I Text Her. No reply yet: the Double Texting tool. She’s short and flat: the Dry Texter test. Ready to make plans: How to Ask Her Out Over Text." },
    ],
  },
  {
    slug: "approaching",
    name: "Approaching & apps",
    title: "How to talk to women: approaching, opening and dating apps without the cringe",
    description:
      "How to talk to women in person and on the apps: where to meet them, what to say first, Hinge prompts and openers that get replies, and fixing a profile that gets no matches.",
    intro:
      "Most men never lose a woman’s interest; they never start the conversation. From the first hello to a way to see her again, in person and on the apps, with openers that sound like you on a good day.",
    chapters: ["2.2", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"],
    keyword: "how to talk to women",
    guide: [
      { q: "How do I talk to a woman I don’t know?", a: "Simply and specifically. Comment on what you’re both experiencing, ask one real question, and listen to the answer. Research on opening lines has favored plain, direct openers over clever ones since the 1980s; the delivery matters more than the words." },
      { q: "Is it better to meet women online or in person?", a: "Both work; most men need both. Meeting online became the most common way US couples met around 2013, but the apps reward men with a strong profile and punish the rest. Real life rewards men who show up to the same places repeatedly." },
      { q: "Why am I not getting matches?", a: "Usually the first photo, then the prompts. A clear, smiling first photo and specific, answerable prompts beat a long bio. Run the profile diagnosis before you pay for any app feature." },
      { q: "Where should I start?", a: "Pick by your bottleneck: no idea where to go, the Where to Meet Women finder; no matches, the profile diagnosis and Hinge prompts picker; matches but no replies, the Tinder and Hinge opener generators." },
    ],
  },
  {
    slug: "signals",
    name: "Reading her signals",
    title: "Signs she likes you: reading her signals, mixed messages and the friend zone",
    description:
      "The signs she likes you are patterns of effort, not single moments. Read interest the way women do, decode mixed signals, and stop guessing with a clear offer.",
    intro:
      "Most men aren’t bad at talking to women. They’re bad at reading the answer. Learn to read interest the way women do: in clusters and patterns, not single moments, and to make a clear offer instead of decoding forever.",
    chapters: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "1.5"],
    keyword: "signs she likes you",
    guide: [
      { q: "What are the real signs she likes you?", a: "Effort and reciprocity. She answers with substance, asks questions back, makes time to see you and sometimes starts the contact. One sign means little; three or four that repeat over two weeks mean a lot. Judge what she does, not what she says she’ll do." },
      { q: "Why do men misread interest so often?", a: "Mostly in the pessimistic direction. Studies of first conversations find people underestimate how much the other person liked them, a bias researchers call the liking gap. The cure isn’t more decoding; it’s a small, clear invitation that lets her show you." },
      { q: "What do mixed signals usually mean?", a: "A soft answer. Hot-then-cold behavior often means she likes the attention more than the plan, or she’s unsure. Give it one clear chance to become a date. If the pattern doesn’t change, the mixed signal was the answer." },
      { q: "Where should I start?", a: "Take the Does She Like Me quiz for a read on the pattern, then follow its first move. If you already know you like her, use the Should I Ask Her Out tool: a direct, low-pressure ask beats weeks of analysis." },
    ],
  },
  {
    slug: "dates",
    name: "Dates",
    title: "First date tips: where to go, what to talk about, and how to end it well",
    description:
      "First date tips for men: ideas that create chemistry, questions that make her open up, second date ideas, what to text after, and how to end the night on a high.",
    intro:
      "A first date isn’t a job interview or an audition. It’s a chance to find out whether you enjoy each other in person. Plan it, lead it, build chemistry honestly, and end it on a high.",
    chapters: ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"],
    keyword: "first date tips",
    guide: [
      { q: "What makes a good first date?", a: "Short, close and easy to extend. Pick a place where you can talk and stand or sit at an angle, have a second stop in mind, and keep it to about 90 minutes unless it’s going well. Novelty and light activity beat a long dinner." },
      { q: "What should we talk about?", a: "Her answers, not your résumé. People who ask more follow-up questions are liked more, according to a Harvard study of speed dates. Ask one real question, follow up twice, then share something of your own." },
      { q: "How do I end the date?", a: "On a high and with intent. Leave while it’s still good, say you had a great time, and if you want to see her again, say so plainly. What you text afterwards matters less than how the date ended." },
      { q: "Which tool should I use?", a: "Planning: the First Date Ideas generator by budget and vibe. Nervous about talk: First Date Questions. It went well: Second Date Ideas and What to Text After a First Date." },
    ],
  },
  {
    slug: "talking-stage",
    name: "The talking stage",
    title: "The talking stage: pacing, situationships and when to define the relationship",
    description:
      "The talking stage explained for men: how long it should last, how to tell a situationship from a relationship, attachment styles, and how to have the DTR talk.",
    intro:
      "You’ve had a few dates, you text most days, and nobody has said what this is. These guides are about pacing, consent, and turning “talking” into something with a name without breaking what you’ve built.",
    chapters: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"],
    keyword: "talking stage",
    guide: [
      { q: "What is the talking stage?", a: "The stretch between the first dates and an agreed relationship: you see each other and text, but nobody has said what this is. It’s normal for a few weeks; it becomes a problem when one person treats it as a destination." },
      { q: "How long should it last?", a: "Usually weeks, not months. If you’ve been seeing each other regularly for six to eight weeks and still avoid the question, the ambiguity is doing the deciding for you. The timeline calculator gives you a fair range." },
      { q: "Is this a situationship?", a: "If there’s intimacy but no plans, no introductions and no shared future, probably yes. A situationship isn’t wrong if both of you chose it; it hurts when one of you is waiting for more." },
      { q: "Why do I chase some women and freeze with others?", a: "Often attachment style. Anxious patterns chase uncertainty; avoidant patterns pull away as things get real. Knowing yours is the fastest way to stop repeating the same talking-stage story." },
    ],
  },
  {
    slug: "rejection",
    name: "Rejection & moving on",
    title: "How to get over someone: rejection, ghosting, an ex, and moving on",
    description:
      "How to get over someone for men: handling rejection, being ghosted, whether to text your ex, blocking or muting, and an honest estimate of how long recovery takes.",
    intro:
      "Every man goes through rejection, ghosting and the slow fade. What separates men isn’t whether it happens but how they handle it, and who they become afterward.",
    chapters: ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "1.7"],
    keyword: "how to get over someone",
    guide: [
      { q: "How do I get over someone faster?", a: "Cut the inputs and rebuild the routine. Checking her profile, rereading messages and replaying conversations all keep the wound open. Research on breakup recovery links ongoing contact and online monitoring to slower recovery." },
      { q: "Should I text my ex?", a: "Only if you can say what you want and accept any answer, including none. Texting to test whether she still cares usually restarts the pain. The decision tool walks you through it in a minute." },
      { q: "How long will this hurt?", a: "Less long than you predict. People consistently overestimate how bad and how lasting a breakup will feel. Most report feeling markedly better within a few months, faster with good sleep, exercise and friends." },
      { q: "What if she comes back?", a: "Judge what changed, not how much you missed her. A return without a change in the reason you ended is usually a rerun. The Will She Come Back quiz helps you separate hope from evidence." },
    ],
  },
  {
    slug: "relationships",
    name: "Relationships",
    title: "How to be a better boyfriend: connection, conflict, trust and lasting attraction",
    description:
      "How to be a better boyfriend, backed by relationship research: responding to her bids, fighting fair, jealousy and trust, red flags, and when to stay or leave.",
    intro:
      "Getting her is the beginning, not the finish line. The skills that keep a relationship alive for years are different from the ones that start it, and decades of research show which ones matter.",
    chapters: ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6"],
    keyword: "how to be a better boyfriend",
    guide: [
      { q: "What makes someone a good boyfriend?", a: "Responsiveness. Couples who stay together turn toward each other’s small bids for attention far more often than couples who split. Noticing, listening and following through on small things matters more than grand gestures." },
      { q: "How do we stop having the same fight?", a: "Start softer and repair faster. Criticism, contempt, defensiveness and stonewalling predict breakups; a gentle start-up and a quick repair attempt predict staying together. Most recurring fights are about a need that never got said plainly." },
      { q: "How do I know if it’s healthy?", a: "You both feel safe, respected and free. Use the healthy relationship quiz for a calm read, and the red-flags checklist if something feels off. Both check your side as well as hers." },
      { q: "Should I stay or go?", a: "Decide on the pattern, not the latest fight. The break-up quiz asks about the things that predict whether a relationship can recover. If the answer is to stay, the work is specific; if it’s to go, go kindly." },
    ],
  },
  {
    slug: "attraction",
    name: "How attraction works",
    title: "How to attract women: how attraction actually works, and how to lead it honestly",
    description:
      "How to attract women without games: what research says women find attractive, why neediness repels, emotional leadership, and the honest skills behind lasting attraction.",
    intro:
      "Tactics built on wrong beliefs collapse the first time she doesn’t follow the script. This is the deep game: how attraction really works, and how to lead the dynamic with skills that make you more attractive the better she understands them.",
    chapters: ["1.1", "1.2", "1.3", "1.4", "1.8", "8.1", "8.2", "8.3", "8.4", "8.5", "8.6"],
    keyword: "how to attract women",
    guide: [
      { q: "What actually attracts women?", a: "Warmth plus competence, read through how you treat people. Studies of what women want consistently rank kindness, humor, intelligence and confidence above looks or money, though looks open doors. Most of it is learnable." },
      { q: "Why do tricks stop working?", a: "Because she notices. Manipulation works only while it’s hidden, and the women worth keeping always notice. Skills that make you more attractive the better she understands them are the only ones that last." },
      { q: "Is confidence something I can build?", a: "Yes, as a track record rather than a feeling. Confidence grows from doing slightly uncomfortable things repeatedly: talking first, making plans, hearing no and being fine." },
      { q: "Where should I start?", a: "Take the research scorecard to see where you stand on what women report finding attractive, then work on the one area with the biggest gap. Small, visible changes compound fastest." },
    ],
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
