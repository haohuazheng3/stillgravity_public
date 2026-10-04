import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  doublePrecision,
  date,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** A buyer, keyed by a hash of their checkout email (guest checkout: no accounts). */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // `b_` + sha256(normalised email), see src/lib/buyers.ts
  email: text("email").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: createdAt(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    product: text("product").notNull(),
    stripeSessionId: text("stripe_session_id").notNull(),
    stripePaymentIntent: text("stripe_payment_intent"),
    stripeCustomerId: text("stripe_customer_id"),
    amountTotal: integer("amount_total").notNull().default(0), // cents
    currency: text("currency").notNull().default("usd"),
    status: text("status").notNull().default("paid"), // paid | refunded | disputed
    promoCode: text("promo_code"),
    receiptUrl: text("receipt_url"),
    email: text("email"),
    source: text("source").notNull(), // success_page | webhook | reconcile
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    // Delivery email (the PDF goes to the checkout email). Claimed before sending so the
    // success page, the webhook and the reconcile job never send it twice.
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    emailClaimedAt: timestamp("email_claimed_at", { withTimezone: true }),
    emailAttempts: integer("email_attempts").notNull().default(0),
    emailError: text("email_error"),
  },
  (t) => [
    uniqueIndex("orders_session_uq").on(t.stripeSessionId),
    index("orders_user_idx").on(t.userId),
    index("orders_pi_idx").on(t.stripePaymentIntent),
  ],
);

export const entitlements = pgTable(
  "entitlements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    product: text("product").notNull(),
    orderId: text("order_id").notNull(),
    status: text("status").notNull().default("active"), // active | revoked
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokeReason: text("revoke_reason"),
  },
  (t) => [uniqueIndex("entitlements_user_product_uq").on(t.userId, t.product)],
);

/** Every Stripe event we accepted, keyed by event id: the webhook's idempotency ledger. */
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status").notNull().default("received"), // received | processed | ignored | failed
  error: text("error"),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

/** Open Checkout Sessions per user, so a double click reuses the same session instead of opening two. */
export const checkoutAttempts = pgTable(
  "checkout_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    sessionId: text("session_id").notNull(),
    url: text("url").notNull(),
    createdAt: createdAt(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [uniqueIndex("checkout_attempts_session_uq").on(t.sessionId), index("checkout_attempts_user_idx").on(t.userId)],
);

/** Personalised (watermarked) copies stored in R2, one per user and edition. */
export const licensedCopies = pgTable(
  "licensed_copies",
  {
    userId: text("user_id").notNull(),
    product: text("product").notNull(),
    objectKey: text("object_key").notNull(),
    bytes: integer("bytes").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.product] })],
);

export const downloads = pgTable(
  "downloads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    product: text("product").notNull(),
    mode: text("mode").notNull(), // read | download
    country: text("country"),
    createdAt: createdAt(),
  },
  (t) => [index("downloads_user_idx").on(t.userId)],
);

/** Self-hosted error inbox: one row per fingerprint (error name + first stack frame + route). */
export const errorGroups = pgTable(
  "error_groups",
  {
    id: text("id").primaryKey(),
    fingerprint: text("fingerprint").notNull(),
    name: text("name").notNull(),
    message: text("message").notNull(),
    route: text("route"),
    source: text("source").notNull(), // server | client | edge | worker | cron
    severity: text("severity").notNull().default("error"), // error | warn
    firstFrame: text("first_frame"),
    stack: text("stack"),
    context: jsonb("context").$type<Record<string, unknown>>(),
    count: integer("count").notNull().default(1),
    firstSeen: timestamp("first_seen", { withTimezone: true }).notNull().defaultNow(),
    lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("error_groups_fingerprint_uq").on(t.fingerprint), index("error_groups_resolved_idx").on(t.resolvedAt)],
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    topic: text("topic").notNull(),
    message: text("message").notNull(),
    userId: text("user_id"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    status: text("status").notNull().default("new"), // new | replied | archived
    notified: integer("notified").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("contact_messages_created_idx").on(t.createdAt)],
);

/** Test inbox: mail routed by Cloudflare Email Routing → Email Worker → /api/inbox/ingest. */
export const inboxMessages = pgTable(
  "inbox_messages",
  {
    id: text("id").primaryKey(),
    toAddr: text("to_addr").notNull(),
    fromAddr: text("from_addr").notNull(),
    subject: text("subject"),
    textBody: text("text_body"),
    htmlBody: text("html_body"),
    spf: text("spf"),
    dkim: text("dkim"),
    dmarc: text("dmarc"),
    authResults: text("auth_results"),
    headers: jsonb("headers").$type<Record<string, string>>(),
    rawSize: integer("raw_size").notNull().default(0),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inbox_messages_to_idx").on(t.toAddr, t.receivedAt)],
);

/** Fixed-window rate limiter state. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  count: integer("count").notNull().default(0),
});

/** Daily Search Console rows pulled by the GSC job. */
export const gscDaily = pgTable(
  "gsc_daily",
  {
    day: date("day").notNull(),
    page: text("page").notNull(),
    query: text("query").notNull(),
    clicks: integer("clicks").notNull().default(0),
    impressions: integer("impressions").notNull().default(0),
    ctr: doublePrecision("ctr").notNull().default(0),
    position: doublePrecision("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.page, t.query] })],
);

/** Small key/value store for operational state (alert throttles, last reconcile run…). */
export const appState = pgTable("app_state", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
