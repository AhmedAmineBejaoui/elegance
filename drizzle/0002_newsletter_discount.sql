ALTER TABLE "newsletter_subscriptions" ADD COLUMN "discount_used" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount" numeric(10,2) DEFAULT '0' NOT NULL;
