import { BOOK } from "@/lib/site";

export interface Faq {
  q: string;
  a: string;
  tags: ("book" | "buying" | "account" | "general")[];
}

export const FAQS: Faq[] = [
  {
    q: "What exactly do I get?",
    a: `The full first edition of ${BOOK.displayTitle} as a ${BOOK.pages}-page PDF: ${BOOK.chapters} one-page chapters in twelve parts, the Situation Finder that maps 36 real situations to the right chapter, and the toolkit (a 30-day reset, a texting cheat sheet, a first-date checklist, a glossary and a further-reading list). Read it in your browser or download it.`,
    tags: ["book", "buying"],
  },
  {
    q: "How much is it? Is it a subscription?",
    a: `${BOOK.priceLabel}, once. No subscription and no upsells. Updates to this edition are free and go to the email you bought with.`,
    tags: ["buying"],
  },
  {
    q: "How do I get the book after paying?",
    a: "Two ways, at once. The page you land on after paying has the download, and we email your PDF to the address you entered at checkout, usually within a minute. Lost the email later? Enter that address at stillgravity.com/download and we send it again with a fresh link.",
    tags: ["buying", "account"],
  },
  {
    q: "Do I need an account to buy?",
    a: "No. There is nothing to sign up for and no password. You enter your email on Stripe’s secure checkout page; that email is where the PDF goes, and it’s how we find your order if you ever need the file again.",
    tags: ["account", "buying"],
  },
  {
    q: "Will this teach me pickup lines or mind games?",
    a: "No. The book has three rules it never breaks: respect is the baseline, consent is the floor, and influence never becomes manipulation. It teaches how attraction actually works, honest words you adapt to your own voice, and why manipulation backfires on the men who use it.",
    tags: ["book", "general"],
  },
  {
    q: "Is the advice backed by research?",
    a: "Where research exists, yes. Chapters include “The science”: studies summarized in plain language with the researchers named, including when a famous finding is debated or hasn’t replicated well. You deserve to know why something works, not just that someone said so.",
    tags: ["book", "general"],
  },
  {
    q: "Is it only about getting a girlfriend?",
    a: "No. It covers the whole arc, from approaching and texting to dates, the talking stage, rejection and relationships that last. The last part is about the man behind it all: purpose, body, money, friendships, emotions, attention and habits.",
    tags: ["book"],
  },
  {
    q: "I’m already in a relationship. Is it still useful?",
    a: "Part 10 is written for you: bids for connection, listening when she’s upset, fighting fair, jealousy and trust, and keeping attraction alive long-term. Parts 11 and 12 are useful to any man, single or not.",
    tags: ["book"],
  },
  {
    q: "Can I read some of it before I buy?",
    a: "Yes. All eight chapters of Part 1, “The truths nobody told you,” are free to read on the site, laid out the way they are in the book.",
    tags: ["book", "buying"],
  },
  {
    q: "What can I read it on?",
    a: "Anything that opens a PDF: phones, tablets, e-readers (Send to Kindle works), laptops. The pages are 6 × 9 inches, so they read comfortably on a phone.",
    tags: ["book"],
  },
  {
    q: "What will my card statement show?",
    a: "A short, discreet merchant descriptor that includes our name. The book’s title never appears on your statement.",
    tags: ["buying"],
  },
  {
    q: "Is my copy personalized?",
    a: "Yes. Every page carries a small line at the very bottom with a masked version of your email and your order reference. It never gets in the way of reading; it simply discourages casual sharing.",
    tags: ["book", "buying"],
  },
  {
    q: "What’s your refund policy?",
    a: `If the book isn’t for you, email us within ${BOOK.refundDays} days of purchase and we’ll refund you in full. No forms, no arguments. Refunds go back to the original payment method and your download links stop working.`,
    tags: ["buying"],
  },
  {
    q: "Who is behind Still Gravity?",
    a: "Still Gravity is an independent publisher of practical, research-backed guides for men. We don’t invent experts, ratings or testimonials: what we publish has to stand on its own reasoning and on the research it cites. Questions go to contact@stillgravity.com and are answered by a real person.",
    tags: ["general"],
  },
  {
    q: "Is this a substitute for therapy?",
    a: "No. The book offers general guidance on dating, relationships and personal growth. If you’re struggling with your mental health, please reach out to a qualified professional or someone you trust.",
    tags: ["general"],
  },
];

export function faqsFor(tag: Faq["tags"][number], limit?: number): Faq[] {
  const list = FAQS.filter((f) => f.tags.includes(tag));
  return typeof limit === "number" ? list.slice(0, limit) : list;
}
