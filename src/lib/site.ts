/**
 * Brand and product constants. Everything user-facing that names the brand or the
 * book reads from here, so the entity stays consistent across pages, schema and emails.
 */

export const SITE = {
  name: "Still Gravity",
  legalName: "Still Gravity",
  domain: "stillgravity.com",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://stillgravity.com").replace(/\/$/, ""),
  tagline: "Attraction isn't a trick. It's gravity.",
  description:
    "Honest, research-backed guidance for men on attraction, texting, dating and relationships, and the deeper work of becoming a man worth choosing.",
  email: "contact@stillgravity.com",
  replyTime: "We reply to every message within two business days.",
  foundingYear: 2026,
  locale: "en_US",
} as const;

export const BOOK = {
  title: "What She Won't Tell You",
  shortTitle: "What She Won’t Tell You",
  /** Typographic title for headings and visible copy (curly apostrophe). */
  displayTitle: "What She Won’t Tell You",
  subtitle: "The complete playbook for attraction, dating, and becoming the man she chooses",
  edition: "First edition, 2026",
  price: 9.99,
  priceLabel: "$9.99",
  currency: "USD",
  pages: 115,
  chapters: 83,
  parts: 12,
  situations: 36,
  format: "PDF",
  sku: "wstty-ebook-v1",
  /** Object key of the master file in the private R2 bucket. */
  fileKey: "books/wstty-v1/What-She-Wont-Tell-You.pdf",
  fileName: "What-She-Wont-Tell-You.pdf",
  refundDays: 14,
} as const;

export const PRODUCT_ID = BOOK.sku;

/** Pages that must never be indexed or listed in the sitemap. */
export const PRIVATE_PATHS = ["/account", "/checkout", "/admin", "/sign-in", "/api/"] as const;

export const CONTENT_UPDATED = "2026-10-03";
