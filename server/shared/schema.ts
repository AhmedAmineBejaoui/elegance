// @ts-nocheck
// drizzle/schema.ts
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ----------------------------- Auth / Sessions ----------------------------- */

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { withTimezone: false }).notNull(),
  },
  (table) => [index("idx_sessions_expire").on(table.expire)],
);

export const users = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    profileImageUrl: varchar("profile_image_url", { length: 1024 }),
    phone: varchar("phone", { length: 64 }),
    address: text("address"),
    city: varchar("city", { length: 255 }),
    postalCode: varchar("postal_code", { length: 32 }),
    role: varchar("role", { length: 32 }).notNull().default("customer"), // customer | admin
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [index("idx_users_email_null_ok").on(t.email)],
);

/* -------------------------------- Categories -------------------------------- */

export const categories: any = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 1024 }),
    parentId: integer("parent_id").references((): any => categories.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [index("idx_categories_parent").on(t.parentId)],
);

/* --------------------------------- Products --------------------------------- */

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    shortDescription: text("short_description"),

    // Prix en numeric (Postgres -> renvoyé en string par pg : on coerced côté code)
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),

    sku: varchar("sku", { length: 100 }).unique(),
    stockQuantity: integer("stock_quantity").notNull().default(0),

    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),

    // Tableaux: default SQL corrects
    images: text("images")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    sizes: text("sizes")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    colors: text("colors")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),

    // ✅ On stocke une moyenne d’étoiles et un compteur
    averageRating: numeric("average_rating", { precision: 2, scale: 1 }).default("0.0"),
    reviewsCount: integer("reviews_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [index("idx_products_category").on(t.categoryId)],
);

/* ---------------------------------- Orders ---------------------------------- */

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    status: varchar("status", { length: 32 }).notNull().default("pending"), // pending, processing, shipped, delivered, cancelled

    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
    shipping: numeric("shipping", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),

    shippingAddress: jsonb("shipping_address").notNull(),
    billingAddress: jsonb("billing_address"),

    paymentMethod: varchar("payment_method", { length: 64 }),
    paymentStatus: varchar("payment_status", { length: 32 })
      .notNull()
      .default("pending"), // pending, paid, failed, refunded

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [index("idx_orders_user").on(t.userId)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),

    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),

    size: varchar("size", { length: 64 }),
    color: varchar("color", { length: 64 }),

    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [index("idx_order_items_order").on(t.orderId)],
);

/* ---------------------------------- Cart ----------------------------------- */

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),

    quantity: integer("quantity").notNull(),

    size: varchar("size", { length: 64 }),
    color: varchar("color", { length: 64 }),

    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [
    index("idx_cart_user").on(t.userId),
    index("idx_cart_user_product").on(t.userId, t.productId),
  ],
);

/* --------------------------------- Reviews --------------------------------- */

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    rating: integer("rating").notNull(), // 1..5
    title: varchar("title", { length: 255 }),
    comment: text("comment"),
    isVerified: boolean("is_verified").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [
    index("idx_reviews_product").on(t.productId),
    index("idx_reviews_user").on(t.userId),
  ],
);

/* ------------------------ Newsletter subscriptions ------------------------- */

export const newsletterSubscriptions = pgTable(
  "newsletter_subscriptions",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    discountUsed: boolean("discount_used").notNull().default(false),
  },
);

/* --------------------------------- Relations -------------------------------- */

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),
  children: many(categories, {
    relationName: "categoryHierarchy",
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

/* --------------------------------- Zod Schemas ------------------------------ */

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    // averageRating / reviewsCount sont calculés côté serveur
    averageRating: true,
    reviewsCount: true,
  })
  .extend({
    // Accepter number | string -> stocker en string (pg numeric)
    price: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : String(v)),
      z.string(),
    ),
    salePrice: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? null : String(v)),
      z.string().nullable(),
    ),
  });

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterSchema = createInsertSchema(
  newsletterSubscriptions,
).omit({
  id: true,
  createdAt: true,
  discountUsed: true,
});

/* ---------------------------------- Types ---------------------------------- */

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UpdateUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
