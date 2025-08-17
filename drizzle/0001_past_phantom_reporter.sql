CREATE TABLE "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint

DROP INDEX "IDX_session_expire";
--> statement-breakpoint

ALTER TABLE "cart_items" ALTER COLUMN "size" SET DATA TYPE varchar(64);
--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "color" SET DATA TYPE varchar(64);
--> statement-breakpoint

ALTER TABLE "categories" ALTER COLUMN "image_url" SET DATA TYPE varchar(1024);
--> statement-breakpoint

ALTER TABLE "order_items" ALTER COLUMN "size" SET DATA TYPE varchar(64);
--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "color" SET DATA TYPE varchar(64);
--> statement-breakpoint

ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE varchar(32);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE varchar(64);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DATA TYPE varchar(32);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'pending';
--> statement-breakpoint

ALTER TABLE "products" ALTER COLUMN "images" SET DEFAULT ARRAY[]::text[];
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "images" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "sizes" SET DEFAULT ARRAY[]::text[];
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "sizes" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "colors" SET DEFAULT ARRAY[]::text[];
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "colors" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[];
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "tags" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "reviews" ALTER COLUMN "title" SET DATA TYPE varchar(255);
--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" SET DATA TYPE varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" SET DATA TYPE varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "profile_image_url" SET DATA TYPE varchar(1024);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" SET DATA TYPE varchar(64);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "city" SET DATA TYPE varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "postal_code" SET DATA TYPE varchar(32);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE varchar(32);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer';
--> statement-breakpoint

ALTER TABLE "products" ADD COLUMN "average_rating" numeric(2, 1) DEFAULT '0.0';
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "reviews_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255);
--> statement-breakpoint

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "idx_cart_user" ON "cart_items" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_cart_user_product" ON "cart_items" USING btree ("user_id","product_id");
--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "categories" USING btree ("parent_id");
--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX "idx_orders_user" ON "orders" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX "idx_reviews_product" ON "reviews" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "idx_reviews_user" ON "reviews" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_sessions_expire" ON "sessions" USING btree ("expire");
--> statement-breakpoint
CREATE INDEX "idx_users_email_null_ok" ON "users" USING btree ("email");
--> statement-breakpoint

-- ************* BACKFILL des anciennes colonnes vers les nouvelles *************
UPDATE "products"
SET "average_rating" = ROUND(COALESCE("rating"::numeric, 0), 1)
WHERE "rating" IS NOT NULL;
--> statement-breakpoint

UPDATE "products"
SET "reviews_count" = "review_count"
WHERE "review_count" IS NOT NULL;
--> statement-breakpoint
-- *****************************************************************************


ALTER TABLE "products" DROP COLUMN "rating";
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "review_count";
