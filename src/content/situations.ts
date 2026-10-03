/**
 * The Situation Finder: the 36 thoughts that keep men up at night, mapped to the
 * chapter that handles each one (from the book's own Situation Finder, pp. 10–11).
 * `first` is our short, honest first move; the full playbook lives in the chapter.
 */

export interface Situation {
  slug: string;
  quote: string;
  chapter: string;
  first: string;
}

export interface SituationGroup {
  id: string;
  title: string;
  items: Situation[];
}

export const SITUATION_GROUPS: SituationGroup[] = [
  {
    id: "meeting",
    title: "Meeting and talking",
    items: [
      {
        slug: "freeze-up",
        quote: "I freeze up every time I want to talk to her.",
        chapter: "2.2",
        first:
          "Your brain is treating four seconds of awkwardness like a threat to survival. Move within a few seconds, shrink the goal to a simple hello, and warm up with two or three easy conversations first.",
      },
      {
        slug: "what-to-say-first",
        quote: "I never know what to say first.",
        chapter: "3.2",
        first:
          "Cute lines lose; simple, situational or direct openers win, and the research has said so since the 1980s. Comment on what you’re both experiencing, say it slower than feels natural, then follow up on her answer.",
      },
      {
        slug: "conversations-die",
        quote: "Our conversations die after two minutes.",
        chapter: "3.3",
        first:
          "You’re interviewing her. Pull a thread from her last answer, share a little of yourself before you ask, and ask why instead of what. Why-questions get stories; what-questions get facts.",
      },
      {
        slug: "flirt-without-being-weird",
        quote: "I don’t know how to flirt without being weird.",
        chapter: "3.4",
        first:
          "Flirting is friendliness plus visible intent: hold eye contact a beat longer, compliment something she chose, tease with obvious affection. If she stops playing, you stop too.",
      },
      {
        slug: "scared-to-ask-for-her-number",
        quote: "I want her number but I’m scared to ask.",
        chapter: "3.5",
        first:
          "Ask at a high point, not after the conversation sags, and attach a plan: a drink this week. Then text her right away so she has yours, and accept any answer like a gentleman.",
      },
      {
        slug: "matches-but-nothing-happens",
        quote: "I get matches, but nothing ever happens.",
        chapter: "3.8",
        first:
          "“Hey” puts all the work on her. Open with something specific from her profile that’s fun to answer, and suggest meeting within a few good exchanges. The app is the front door, not the living room.",
      },
    ],
  },
  {
    id: "texting",
    title: "Texting",
    items: [
      {
        slug: "first-text-after-number",
        quote: "I got her number. Now what do I text?",
        chapter: "4.1",
        first:
          "Forget the three-day rule. Text that evening or the next day with a callback to something fun you shared, in one or two lines. It should feel like a continuation, not a cold start.",
      },
      {
        slug: "texts-fizzle-out",
        quote: "Our texts keep fizzling out.",
        chapter: "4.3",
        first:
          "Closed questions kill threads. Send a playful assumption, a story instead of a status, or a fun either-or. Give her something fun to answer, not something she has to answer.",
      },
      {
        slug: "left-on-read",
        quote: "She left me on read.",
        chapter: "4.4",
        first:
          "One message tells you nothing, so decide nothing from it. No “??”. Check whether your last text even needed a reply, wait a day or two, then re-open once with something fresh. If that meets silence too, she has answered.",
      },
      {
        slug: "takes-hours-to-reply",
        quote: "She takes hours to reply.",
        chapter: "4.5",
        first:
          "Separate texting style from interest. Slow but warm, with questions back and yes to plans, is fine. Slow, flat and plan-avoiding is an answer. Judge her by the date she agrees to, not the speed of her texts.",
      },
      {
        slug: "should-i-double-text",
        quote: "Should I double text?",
        chapter: "4.6",
        first:
          "One follow-up after silence, a day or more later, with something new, is fine. Two unanswered messages in a row is the limit. Before you send, ask: would I send this if I weren’t anxious?",
      },
      {
        slug: "ask-her-out-without-awkward",
        quote: "How do I ask her out without it being awkward?",
        chapter: "4.7",
        first:
          "Be specific: a day, a time and a place, tied to something from your conversation, ending with “Does that work?” A good invitation is specific enough to say yes to and easy enough to say no to.",
      },
    ],
  },
  {
    id: "reading-her",
    title: "Reading her",
    items: [
      {
        slug: "cant-tell-if-she-likes-me",
        quote: "I can’t tell if she likes me.",
        chapter: "5.1",
        first:
          "Read clusters, not single signals: eye contact, proximity, questions back, light touch, initiating plans, remembering details. One laugh is a guess. A repeated pattern is an answer.",
      },
      {
        slug: "mixed-signals",
        quote: "She’s sending mixed signals.",
        chapter: "5.3",
        first:
          "Stop decoding. Make one clear, specific invitation and let her response do the work. Two clear invitations over about two weeks with no real plan is your answer, and your evenings back.",
      },
      {
        slug: "friend-zone",
        quote: "I think I’m in the friend zone.",
        chapter: "5.5",
        first:
          "The friend zone forms when interest stays hidden. Change the frame first, then say it once, clearly, and accept the answer. Then decide honestly whether you can be her friend.",
      },
      {
        slug: "she-says-shes-busy",
        quote: "She says she’s busy. Is that a no?",
        chapter: "1.5",
        first:
          "Judge effort, not explanations. Make one easy, open offer (“If a night next week works better, let me know”) and stop. Interested women usually propose an alternative. Drift is an answer too.",
      },
      {
        slug: "talking-to-other-guys",
        quote: "She’s talking to other guys.",
        chapter: "5.6",
        first:
          "Before an exclusivity conversation, that’s normal. Don’t compete, compare or interrogate. Run your own race, make your time together great, and have the conversation once it’s real.",
      },
    ],
  },
  {
    id: "dates",
    title: "Dates and the talking stage",
    items: [
      {
        slug: "first-date-where-to-go",
        quote: "We have a first date. Where do we go?",
        chapter: "6.1",
        first:
          "Skip dinner and a movie. Pick something short, inexpensive and easy to extend, with a little novelty, then move together to a second spot nearby. Shared movement feels like a shared adventure.",
      },
      {
        slug: "what-to-talk-about-on-a-date",
        quote: "What do I even talk about on a date?",
        chapter: "6.2",
        first:
          "Go in steps: light for the first twenty minutes, personal in the middle, deeper if it’s flowing. And answer your own questions. A date where only she shares feels like a deposition.",
      },
      {
        slug: "should-i-kiss-her",
        quote: "Should I try to kiss her?",
        chapter: "6.5",
        first:
          "Read the moment: she lingers, faces you, the pause gets comfortable. If you’re unsure, say it with a smile: “I’d really like to kiss you.” Confident, and it gives her an easy yes or an easy no.",
      },
      {
        slug: "text-after-first-date",
        quote: "What do I text after the date?",
        chapter: "6.6",
        first:
          "No games. That night or the next morning: warm, specific, short. Mention a moment from the date, then propose date two within a day or two. Clarity is the most attractive thing you can send.",
      },
      {
        slug: "talking-for-weeks-what-are-we",
        quote: "We’ve been “talking” for weeks. What are we?",
        chapter: "7.3",
        first:
          "Look at the signs: does she bring you into her life, plan beyond a few days, make weekend time? You can’t fix a situationship by being patient, only by being honest. Write down what you want first.",
      },
      {
        slug: "bring-up-exclusive",
        quote: "How do I bring up being exclusive?",
        chapter: "7.4",
        first:
          "In person, at a relaxed moment, never by text or mid-argument. Lead with how you feel, say what you want, ask how she feels, then stop talking and let her answer fully.",
      },
      {
        slug: "hot-and-cold",
        quote: "She’s hot one day and cold the next.",
        chapter: "7.5",
        first:
          "Stay consistent, give space when she pulls back, and name it once, calmly. If the weather never settles and you’re anxious more often than happy, choose a different climate.",
      },
      {
        slug: "pulling-away-panicking",
        quote: "She’s pulling away and I’m panicking.",
        chapter: "8.7",
        first:
          "Every instinct says chase, and pressure on someone retreating speeds the retreat. Bring your attention home, stay warm at a lower volume, and make one clear, light invitation.",
      },
    ],
  },
  {
    id: "goes-wrong",
    title: "When it goes wrong",
    items: [
      {
        slug: "she-rejected-me",
        quote: "She rejected me.",
        chapter: "9.1",
        first:
          "You have about three seconds to show who you are. Don’t argue, sulk or turn bitter: “No worries at all. Thanks for being straight with me.” A graceful no is never a loss. It’s a reputation.",
      },
      {
        slug: "no-spark",
        quote: "She said she doesn’t feel a spark.",
        chapter: "9.2",
        first:
          "Chemistry isn’t a debate she lost, so don’t negotiate or promise to change. Thank her for being honest, exit with your dignity, then take care of yourself.",
      },
      {
        slug: "she-ghosted-me",
        quote: "She ghosted me.",
        chapter: "9.3",
        first:
          "Ghosting is common, and usually about avoiding an awkward conversation rather than about your worth. Send one closing line if you want it, don’t investigate, and close the loop yourself.",
      },
      {
        slug: "losing-interest",
        quote: "I can feel her losing interest.",
        chapter: "9.4",
        first:
          "Trying harder usually makes it worse. Refill your own life, propose something genuinely new, stop seeking reassurance, and if it continues, ask once, honestly, then listen.",
      },
      {
        slug: "just-be-friends",
        quote: "She wants to “just be friends.”",
        chapter: "9.5",
        first:
          "The real question is about you: could you be her friend without waiting, hoping or hurting? If not, asking for some space is kind to both of you, and often what makes a real friendship possible later.",
      },
      {
        slug: "cant-stop-thinking-about-her",
        quote: "I can’t stop thinking about her.",
        chapter: "9.6",
        first:
          "Heartbreak is physical, and structure helps it fade: go no contact for a while, write it out for a few evenings, rebuild your routine, lean on people, and reflect instead of ruminating.",
      },
      {
        slug: "want-my-ex-back",
        quote: "I want my ex back.",
        chapter: "9.7",
        first:
          "Sometimes, but never with tactics. Ask why it ended, what has actually changed, and whether you miss her or just being in a relationship. Only a genuinely different man gets a genuinely different relationship.",
      },
    ],
  },
  {
    id: "relationships",
    title: "Relationships and you",
    items: [
      {
        slug: "same-fight",
        quote: "We keep having the same fight.",
        chapter: "10.3",
        first:
          "Swap criticism for a complaint, contempt for respect, defensiveness for responsibility and stonewalling for a 20-minute break. The goal of a fight isn’t to win. It’s to stay on the same team.",
      },
      {
        slug: "jealous",
        quote: "I get jealous, and I hate it.",
        chapter: "10.4",
        first:
          "Treat jealousy as information: write what happened, what you assumed, and what you actually know. Agree on boundaries while you’re both calm, raise real concerns directly, and never police her phone.",
      },
      {
        slug: "spark-is-gone",
        quote: "The spark is gone in my relationship.",
        chapter: "10.5",
        first:
          "Passion fades by default, not by fate. Keep dating her, do new things together, keep a life of your own and keep flirting. Comfort is the foundation, not the whole house.",
      },
      {
        slug: "where-my-life-is-going",
        quote: "I don’t know where my life is going.",
        chapter: "12.1",
        first:
          "A man whose life revolves around finding a woman has nothing to offer the woman he finds. Build a direction: a mission that pulls you forward, protected time for it, and one thing that’s only yours.",
      },
    ],
  },
];

export const ALL_SITUATIONS = SITUATION_GROUPS.flatMap((g) => g.items.map((s) => ({ ...s, group: g.id, groupTitle: g.title })));
