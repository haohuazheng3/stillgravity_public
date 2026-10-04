# Still Gravity

Honest, research-backed guidance for men on attraction, dating and relationships, and the home of the field manual *What She Won't Tell You*. Live at [stillgravity.com](https://stillgravity.com).

This repository is the complete web app: a statically generated content site with a free sample of the book, an interactive Situation Finder, a blog system, passwordless accounts, one-time checkout, and private delivery of a personalized PDF.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19) and **Tailwind CSS v4**
- **Neon Postgres** with **Drizzle ORM** (HTTP driver; migrations in `drizzle/`)
- **Clerk** for passwordless email-code sign-in (one combined sign-in-or-up flow)
- **Stripe Checkout** for the one-time purchase; the success page verifies the session server-side and unlocks immediately. Stripe events (missed unlocks, refunds, disputes) are applied exactly once through a signed webhook or, when no endpoint is configured, a scheduled pull of the Stripe event log; a signed-in buyer whose success page never loaded is also recovered on their next visit, and a daily reconcile job compares Stripe with the database
- **Cloudflare**: R2 for private files behind a small Worker that serves short-lived HMAC-signed links, and an Email Worker for a test inbox and owner alerts
- Self-hosted error inbox, health endpoint, Postgres rate limiting, and MDX articles with automatic internal links and structured data

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values for your own services
npm run db:migrate           # creates the tables in your Postgres database
npm run dev
```

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Applies migrations (if a database is configured), then builds |
| `npm run check` | Type check, lint and unit tests |
| `npm run db:generate` | Generates a SQL migration after a schema change |
| `npm run icons` | Regenerates every favicon and app icon from the logo mark |

The Cloudflare Workers live in `infra/workers` (`mail/` and `files/`); deploy them with Wrangler after creating your own `wrangler.toml` for each (bindings: an R2 bucket for files; a `send_email` binding and a cron trigger for mail).

## Writing articles

Each article is one file at `content/blog/<category>/<slug>.mdx` with frontmatter (`title`, `description`, `publishedAt`, `updatedAt`, `keywords`, `chapters`, `faq`, `draft`). See `content/blog/texting/article-template.mdx`. Category hubs, the sitemap and `llms.txt` update on the next build.

## License

The code is MIT-licensed. The book, its sample chapters, the Situation Finder copy, the brand name and logo, and all editorial content are © Still Gravity, all rights reserved. See `LICENSE`.
