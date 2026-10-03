import { ChapterShell, Chat, Compare, FieldDrill, Mistake, Points, SayThis, Science, Table, Truth } from "@/components/book/BookBlocks";

/**
 * Free sample: Part 1, "The truths nobody told you", reproduced from the first edition.
 * The rest of the book (Parts 2–12 and the toolkit) is only in the paid PDF.
 */

export const SAMPLE_CHAPTERS = [
  { id: "1.1", title: "Attraction isn’t earned. It’s felt." },
  { id: "1.2", title: "Clear intent, loose grip" },
  { id: "1.3", title: "Stop auditioning. Start selecting." },
  { id: "1.4", title: "Neediness is the universal repellent" },
  { id: "1.5", title: "Words lie. Effort doesn’t." },
  { id: "1.6", title: "Your texting problem is a meeting problem" },
  { id: "1.7", title: "Rejection is a filter, not a verdict" },
  { id: "1.8", title: "Lines don’t work. Presence does." },
] as const;

export function SampleChapters() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <ChapterShell
        id="1.1"
        title="Attraction isn’t earned. It’s felt."
        standfirst="The most expensive belief a man can hold is that attraction is a reward you collect for good behavior."
      >
        <p>
          Somewhere along the way, many men absorb an unspoken deal: be helpful, be agreeable, be there whenever she needs you,
          and eventually she’ll want you. So they drive her to the airport, fix her laptop, listen for hours about the guy she’s
          actually dating, and wait for a payoff that never comes.
        </p>
        <p>
          Attraction doesn’t work like a vending machine. It isn’t a debt she owes for services rendered. It’s a feeling that
          shows up, or doesn’t, in response to who you are and how it feels to be around you. You can’t invoice your way into it.
        </p>
        <Science title="kindness wins, approval-seeking doesn’t">
          <p>
            In David Buss’s landmark survey of mate preferences across 37 cultures, kindness and intelligence ranked near the top
            for women everywhere. So kindness was never the problem. The problem is kindness with a hidden invoice, what therapist
            Robert Glover calls a covert contract: “I’ll do nice things, and in exchange you’ll like me.” People can feel the invoice
            even when you never say it out loud.
          </p>
        </Science>
        <Compare
          left="Nice, with an invoice"
          right="Kind, with nothing owed"
          rows={[
            ["Agrees with everything to avoid friction", "Disagrees warmly when he disagrees"],
            ["Does favors hoping she’ll notice", "Does favors because he wanted to"],
            ["Hides his interest to stay “safe”", "Shows interest, accepts her answer"],
            ["Resents her when it doesn’t pay off", "Moves on without bitterness"],
          ]}
        />
        <Truth>Kindness is attractive. Kindness with a hidden invoice isn’t.</Truth>
      </ChapterShell>

      <ChapterShell
        id="1.2"
        title="Clear intent, loose grip"
        standfirst="The men who do best don’t hide their interest, and they don’t cling to it either. They show it, then hold it lightly."
      >
        <p>
          Men usually fail in one of two directions. The first hides his interest completely: he hangs out, chats, helps, and
          never once signals that he sees her as more than a friend. By the time he confesses, she filed him under “friend” months
          ago. The second shows interest so heavily, with constant texts, big declarations on the second date and visible panic
          when she’s slow to reply, that it lands as pressure.
        </p>
        <p>
          The sweet spot is a simple combination: clear intent, loose grip. She should never have to wonder whether you’re
          interested. She should also never feel that your mood depends on her answer.
        </p>
        <Chat
          kind="In person"
          label="Clear and light"
          lines={[
            { from: "me", text: "I’ve really enjoyed talking to you. I’d like to take you out sometime." },
            { from: "her", text: "Oh! Um, yeah, I think I’d like that." },
            { from: "note", text: "And if she hesitates instead:" },
            { from: "me", text: "No pressure at all. It was good meeting you either way." },
          ]}
        />
        <Mistake title="the “hang out” hedge">
          <p>
            “We should hang out sometime lol” feels safe because it can’t really be rejected. That’s exactly why it doesn’t work:
            it asks for nothing, so it creates nothing. Ambiguity protects your ego and quietly costs you the attraction.
          </p>
        </Mistake>
        <Truth>Make your interest obvious and your happiness independent of her answer.</Truth>
      </ChapterShell>

      <ChapterShell
        id="1.3"
        title="Stop auditioning. Start selecting."
        standfirst="Walk in trying to win her approval and you hand her all the power. Walk in curious about whether she fits your life, and everything changes."
      >
        <p>
          Auditioning looks like this: laughing at everything she says, agreeing with every opinion, reciting your résumé, and
          scanning her face for a verdict. It’s exhausting to do and, it turns out, unattractive to watch.
        </p>
        <Science title="wanting everyone backfires">
          <p>
            In speed-dating studies led by Paul Eastwick and Eli Finkel, people who felt attracted to nearly everyone they met were
            themselves rated as less desirable. But when someone liked a person specifically, more than they liked the others, that
            person tended to like them back. Being wanted indiscriminately is cheap. Being chosen is not.
          </p>
        </Science>
        <Points
          title="What selecting looks like"
          items={[
            { text: "You ask questions because you genuinely want to know if you’d get along, not to fill silence." },
            {
              text: "You notice what you like about her specifically, and say it: “I like how you talk about your sister. You clearly have each other’s back.”",
            },
            { text: "You have standards, and you’re willing to discover she doesn’t meet them." },
            { text: "You treat a mismatch as information, not a tragedy." },
          ]}
        />
        <FieldDrill title="write your three non-negotiables">
          <p>
            Before your next date, write down three qualities you need in a partner: curiosity, kindness to strangers, a sense of
            humor. During the date, look for them. Notice how differently you sit, listen and talk when you’re evaluating instead
            of pleading.
          </p>
        </FieldDrill>
        <Truth>Stop asking “does she like me?” Start asking “do I like her?”</Truth>
      </ChapterShell>

      <ChapterShell
        id="1.4"
        title="Neediness is the universal repellent"
        standfirst="One trait kills attraction faster than bad clothes or a bad joke. Almost every man has shown it at least once."
      >
        <p>
          Neediness is when your emotional state depends on her response. It isn’t one behavior; it leaks out everywhere. The
          triple text after an hour of silence. The compliment that’s a little too intense for a second conversation. Clearing
          your whole weekend on the off chance she’s free. Asking “are you mad at me?” when she’s simply busy.
        </p>
        <p>
          Women describe it the way men describe clinginess: as pressure. It signals that you have nothing else going on, which
          makes her wonder why. Worse, it tells her the relationship will run on her managing your feelings.
        </p>
        <Mistake title="faking indifference">
          <p>
            The usual fix is to fake it: wait exactly three hours to reply, pretend not to care, play it cool. But faked
            indifference is still neediness, just with a timer. She can feel the calculation.
          </p>
        </Mistake>
        <h3>The real fix: a full life</h3>
        <p>
          You can’t pretend not to need her. You can only build a life where you genuinely don’t: work you care about, friends you
          see every week, a body you train, projects that pull you forward. When she becomes one great part of a full life instead
          of the only bright spot in an empty one, the neediness fades on its own. It has nothing left to feed on.
        </p>
        <FieldDrill title="the full-life audit">
          <p>
            List what you’ll do this week that has nothing to do with dating. If the list is short, that’s your real dating problem,
            and it’s fixable.
          </p>
        </FieldDrill>
        <Truth>You can’t fake not needing her. You can only build a life where you don’t.</Truth>
      </ChapterShell>

      <ChapterShell
        id="1.5"
        title="Words lie. Effort doesn’t."
        standfirst="When what she says and what she does disagree, believe what she does. This one rule will save you months."
      >
        <p>
          “I’m just really busy right now.” “We should definitely hang out!” “Sorry, I’m terrible at texting.” Any of these can be
          true. Any of them can also be a polite way of saying no. Words are cheap, and they’re often chosen to be kind. Effort is
          expensive, and people spend it on what they want.
        </p>
        <h3>How to read effort</h3>
        <Table
          head={["Signal", "Interested", "Not interested"]}
          rows={[
            ["“Busy”", "“Busy this week, but I’m free Sunday?”", "“Busy,” and nothing after it"],
            ["Texting", "Asks questions back, keeps threads alive", "Answers, never asks"],
            ["Plans", "Reschedules when she cancels", "Cancels and goes quiet"],
            ["Initiation", "Sometimes texts first", "Never texts first"],
            ["Details", "Remembers what you told her", "Asks the same things again"],
          ]}
        />
        <SayThis title="the “busy” test">
          <p>
            When she says she’s busy, make one easy, open offer and let her fill the gap: “No worries. If a night next week works
            better, let me know.” Then stop. An interested woman will usually propose an alternative. A woman who isn’t will let it
            drift, and drift is an answer too.
          </p>
        </SayThis>
        <p>
          None of this means she’s playing you. Most people find a direct no uncomfortable, so they send soft ones. Your job is to
          hear them without needing them spelled out.
        </p>
        <Truth>Judge interest by effort, not explanations. People make time for what they want.</Truth>
      </ChapterShell>

      <ChapterShell
        id="1.6"
        title="Your texting problem is a meeting problem"
        standfirst="Men spend hours perfecting texts to women they’ve met once. The texts aren’t the problem. The texting is."
      >
        <p>
          Texting feels productive. It’s safe, it can be edited, and it lets you feel like something is happening. But attraction
          is built mostly from things a screen can’t carry: your voice, your eye contact, how you react in the moment, a shared
          laugh. Two people can text brilliantly for three weeks and have no chemistry in person, or text awkwardly and click
          instantly over a drink.
        </p>
        <p>
          The longer you stay in text-only mode, the more pressure builds on the eventual meeting, and the more likely the whole
          thing quietly fades. Endless texting turns you into a pen pal, and pen pals don’t get kissed.
        </p>
        <p>
          The rule of thumb: use texting for two things, light playful rapport and logistics. After a few good back-and-forths,
          usually within the first several days, suggest meeting. If you’ve been texting for two weeks without a plan, the plan is
          the problem to solve, not the next message.
        </p>
        <Chat
          kind="Text"
          label="Moving it offline"
          lines={[
            { from: "me", text: "Ok, this debate about the best tacos in town needs to be settled in person" },
            { from: "her", text: "lol is that a challenge?" },
            { from: "me", text: "It is. Thursday after work? Loser buys round two" },
            { from: "her", text: "deal 😂" },
          ]}
        />
        <Mistake title="the good-morning routine">
          <p>
            Daily good-morning texts before you’ve even had a date create a fake relationship that lives on a phone. It feels
            intimate and leads nowhere. Save the routine for when there’s something real.
          </p>
        </Mistake>
        <Truth>Texting is for setting up the date, not replacing it.</Truth>
      </ChapterShell>

      <ChapterShell
        id="1.7"
        title="Rejection is a filter, not a verdict"
        standfirst="A “no” feels like a judgment on your worth. It’s almost always something much smaller."
      >
        <p>
          When she says no, the story your brain tells is total: you’re not attractive, not good enough, never will be. But her no
          contains far less information than that. She might be seeing someone. She might be having a hard month. You might not be
          her type, the same way plenty of attractive, kind women aren’t yours. Rejection is usually about fit and timing, not your
          value as a person.
        </p>
        <Science title="why it stings, and why you misread it">
          <p>
            Brain-imaging research by Naomi Eisenberger and colleagues found that social rejection activates some of the same
            neural regions as physical pain, so the sting is real. But your read on it is often wrong. In studies of the “liking
            gap,” people consistently underestimated how much their conversation partners liked them. You walk away replaying your
            awkward moment; she walks away thinking it was a nice chat.
          </p>
        </Science>
        <p>
          Think of every no as a filter doing its job. It removes a mismatch from your path and makes room for someone who actually
          fits. The men who end up with great partners aren’t the men who were never rejected. They’re the ones who could take a
          no gracefully and keep going.
        </p>
        <FieldDrill title="count your nos">
          <p>
            For one month, keep a tally of every invitation that gets declined. Treat it like reps at the gym. The goal isn’t to
            keep the number low; it’s to notice how little each one actually costs you.
          </p>
        </FieldDrill>
        <Truth>Every no is a mismatch you didn’t have to discover the hard way.</Truth>
      </ChapterShell>

      <ChapterShell
        id="1.8"
        title="Lines don’t work. Presence does."
        standfirst="Two men can say the exact same sentence to the same woman and get opposite results. The difference was never the sentence."
      >
        <p>
          The internet is full of “the perfect opener” and “texts that make her obsessed.” They sell because they promise control.
          But a line is only words, and words are a small part of what she’s actually reading. She’s reading your tone, your
          timing, your eye contact, whether you seem relaxed or rehearsed, and whether you’re listening or just waiting to deliver
          your next bit.
        </p>
        <p>
          Presence means being genuinely in the moment with her: reacting to what she actually said, noticing what’s in front of
          you, comfortable with a pause. It’s what makes an ordinary sentence feel electric and a clever one feel creepy.
        </p>
        <Science title="what actually creates closeness">
          <p>
            In Arthur Aron’s well-known closeness experiments, pairs of strangers who took turns answering increasingly personal
            questions felt markedly closer after about 45 minutes. The questions were simple. What created the closeness was mutual
            attention and gradual openness: two people actually present with each other.
          </p>
        </Science>
        <Points
          title="Three ways to be more present tonight"
          items={[
            { lead: "Put your phone out of sight.", text: "Not face-down on the table. Gone." },
            {
              lead: "React before you respond.",
              text: "Let her words land, then answer what she actually said, not what you planned to say.",
            },
            { lead: "Get comfortable with a two-second pause.", text: "Silence feels much longer to you than it does to her." },
          ]}
        />
        <Truth>She’ll forget your best line. She’ll remember how it felt to be around you.</Truth>
      </ChapterShell>
    </div>
  );
}
