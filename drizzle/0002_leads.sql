CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text,
	"chapter" text,
	"updates" integer DEFAULT 0 NOT NULL,
	"step" integer DEFAULT 0 NOT NULL,
	"next_send_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"token" text NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "leads_token_uq" ON "leads" USING btree ("token");--> statement-breakpoint
CREATE INDEX "leads_next_send_idx" ON "leads" USING btree ("next_send_at");