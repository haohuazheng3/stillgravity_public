import type { Metadata } from "next";
import { BOOK, SITE } from "./site";
import type { Faq } from "@/content/faq";
import type { Post } from "./blog";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article" | "book";
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  // A page-level openGraph object replaces the inherited one, so every page names its image;
  // the root /opengraph-image is the default (segment-level opengraph-image files still win).
  const image = input.image ?? "/opengraph-image";
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE.name,
      type: input.type === "article" ? "article" : "website",
      locale: SITE.locale,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [absoluteUrl(image)],
    },
    ...(input.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo-512.png"), width: 512, height: 512 },
    email: SITE.email,
    description: SITE.description,
    foundingDate: String(SITE.foundingYear),
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: SITE.email, availableLanguage: ["English"] }],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function bookLd() {
  const offer = {
    "@type": "Offer",
    price: BOOK.price.toFixed(2),
    priceCurrency: BOOK.currency,
    availability: "https://schema.org/InStock",
    url: absoluteUrl("/book"),
    seller: { "@id": ORG_ID },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: BOOK.refundDays,
      returnFees: "https://schema.org/FreeReturn",
      refundType: "https://schema.org/FullRefund",
      returnMethod: "https://schema.org/ReturnByMail",
    },
  };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      "@id": `${SITE.url}/book#book`,
      name: BOOK.title,
      alternateName: BOOK.subtitle,
      url: absoluteUrl("/book"),
      image: [absoluteUrl("/book/cover.png"), absoluteUrl("/og/book")],
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      bookFormat: "https://schema.org/EBook",
      numberOfPages: BOOK.pages,
      inLanguage: "en",
      datePublished: "2026",
      bookEdition: BOOK.edition,
      description:
        "A field manual in twelve parts: 83 one-page chapters on approaching, texting, reading signals, dates, the talking stage, rejection and lasting relationships, plus the deeper skills that make scripts unnecessary.",
      offers: offer,
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${SITE.url}/book#product`,
      name: `${BOOK.title} (ebook)`,
      description: BOOK.subtitle,
      image: absoluteUrl("/book/cover.png"),
      sku: BOOK.sku,
      brand: { "@type": "Brand", name: SITE.name },
      offers: offer,
    },
  ];
}

export function faqLd(faqs: Pick<Faq, "q" | "a">[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function articleLd(post: Post, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(url) },
    url: absoluteUrl(url),
    image: absoluteUrl(post.image?.src ?? `/og/post/${post.category}/${post.slug}`),
    author: { "@type": "Organization", "@id": ORG_ID, name: SITE.name, url: SITE.url },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    wordCount: post.wordCount,
    keywords: post.keywords.join(", ") || undefined,
    isPartOf: { "@id": SITE_ID },
  };
}

export function serializeLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
