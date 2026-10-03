/**
 * Environment helpers. Values are read lazily (never at import time) so a missing
 * optional variable degrades one feature instead of crashing the whole app.
 */

export function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export function requireEnv(name: string): string {
  const v = env(name);
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

export const VERCEL_ENV = process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "development");
export const IS_PRODUCTION_DEPLOY = VERCEL_ENV === "production";

/**
 * The site is indexable only on the production deployment AND once SITE_INDEXABLE=1.
 * Until launch every environment sends noindex at both the meta and header level.
 */
export function isIndexable(): boolean {
  return IS_PRODUCTION_DEPLOY && process.env.SITE_INDEXABLE === "1";
}

export function adminEmails(): string[] {
  return (env("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

/** Variables the site needs to be fully functional; /api/health reports which are missing (names only). */
export const REQUIRED_ENV = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BOOK",
  "FILES_BASE_URL",
  "FILES_SIGNING_SECRET",
  "FILES_API_TOKEN",
  "MAIL_WORKER_URL",
  "MAIL_WORKER_TOKEN",
  "INBOX_INGEST_SECRET",
  "INBOX_READ_TOKEN",
  "CRON_SECRET",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_FLOWGLANCE_KEY",
] as const;

export function missingEnv(): string[] {
  return REQUIRED_ENV.filter((n) => !env(n));
}
