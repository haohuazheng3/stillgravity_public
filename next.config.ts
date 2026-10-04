import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const indexable = process.env.VERCEL_ENV === "production" && process.env.SITE_INDEXABLE === "1";

const CLERK = ["https://clerk.stillgravity.com", "https://*.clerk.accounts.dev", "https://*.clerk.com", "https://img.clerk.com"];
const CLERK_WS = ["wss://clerk.stillgravity.com", "wss://*.clerk.accounts.dev"];
const STRIPE = ["https://js.stripe.com", "https://checkout.stripe.com", "https://api.stripe.com", "https://m.stripe.network"];
// FlowGlance loads from flowglance.com and posts to collect.flowglance.com (a blocked collector silently loses all analytics).
const FLOWGLANCE = ["https://flowglance.com", "https://*.flowglance.com"];
const TURNSTILE = ["https://challenges.cloudflare.com"];
const FILES = ["https://files.stillgravity.com"];

// Pages are statically generated (no per-request nonce), so Next's inline bootstrap needs 'unsafe-inline'.
const csp = [
  ["default-src", "'self'"],
  ["script-src", "'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...CLERK, ...STRIPE, ...FLOWGLANCE, ...TURNSTILE],
  ["style-src", "'self'", "'unsafe-inline'"],
  ["img-src", "'self'", "data:", "blob:", "https:"],
  ["font-src", "'self'", "data:"],
  ["connect-src", "'self'", ...CLERK, ...CLERK_WS, ...STRIPE, ...FLOWGLANCE, ...TURNSTILE, ...(isDev ? ["ws:", "http://localhost:*"] : [])],
  ["frame-src", "'self'", ...STRIPE.slice(0, 2), ...TURNSTILE, ...CLERK.slice(0, 3), ...FILES],
  ["worker-src", "'self'", "blob:"],
  ["media-src", "'self'"],
  ["object-src", "'none'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'", "https://checkout.stripe.com", ...CLERK.slice(0, 2)],
  ["frame-ancestors", "'none'"],
  ...(isDev ? [] : [["upgrade-insecure-requests"]]),
]
  .map((d) => d.join(" "))
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Permissions-Policy", value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self "https://js.stripe.com")' },
  // Until launch every environment says noindex at the header level as well as in <meta>.
  ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Most visitors arrive once from search: ship the (small, atomic) CSS inside the HTML
  // instead of a render-blocking stylesheet request.
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  outputFileTracingIncludes: {
    "/blog/**": ["./content/blog/**/*"],
    "/sitemap.xml": ["./content/blog/**/*"],
    "/llms.txt": ["./content/blog/**/*"],
    "/admin/**": ["./content/blog/**/*"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/book/:file(cover\\.webp|cover\\.png|page-\\d+\\.webp)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/brand/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/sign-up", destination: "/book", permanent: false },
      { source: "/login", destination: "/download", permanent: false },
      { source: "/library", destination: "/download", permanent: false },
      { source: "/account/:path*", destination: "/download", permanent: false },
      { source: "/sample", destination: "/book/sample", permanent: true },
    ];
  },
};

export default nextConfig;
