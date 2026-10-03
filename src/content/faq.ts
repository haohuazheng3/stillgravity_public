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
    a: `${BOOK.priceLabel}, once. No subscription and no upsells. Your copy stays in your library, and updates to this edition are free.`,
    tags: ["buying"],
  },
  {
    q: "How do I get the book after paying?",
    a: "Instantly. Checkout sends you straight back to your library, where you can read it in the browser or download the PDF. It stays one click away in your account on any device.",
    tags: ["buying", "account"],
  },
  {
    q: "Why do I need an account to buy?",
    a: "So your purchase is tied to you and can never get lost. There is no password: enter your email, type the six-digit code we send, and you’re in. The same email brings you back to your library on any device.",
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
    a: `If the book isn’t for you, email us within ${BOOK.refundDays} days of purchase and we’ll refund you in full. No forms, no arguments. Refunds go back to the original payment method and access to the copy ends.`,
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
