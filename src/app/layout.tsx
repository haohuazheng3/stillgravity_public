import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ConsentManager } from "@/components/Consent";
import { THEME_SCRIPT } from "@/components/ThemeToggle";
import { SITE } from "@/lib/site";
import { isIndexable } from "@/lib/env";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-barlow-condensed",
  display: "swap",
  preload: false, // numerals below the fold only
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  variable: "--font-source-serif",
  display: "swap",
});

// Italic is loaded as its own face and not preloaded: it decorates, it never carries the first paint.
const sourceSerifItalic = Source_Serif_4({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-source-serif-italic",
  display: "swap",
  preload: false,
});

const indexable = isIndexable();

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Attraction, dating and becoming the man she chooses`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  robots: indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
    : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  category: "relationships",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070d" },
    { media: "(prefers-color-scheme: light)", color: "#e7e9ef" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${barlow.variable} ${barlowCondensed.variable} ${sourceSerif.variable} ${sourceSerifItalic.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <div className="void-bg" aria-hidden="true" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>
        {children}
        <ConsentManager />
      </body>
    </html>
  );
}
