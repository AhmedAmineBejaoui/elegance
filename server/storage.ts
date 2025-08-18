import {
  users,
  categories,
  products,
  orders,
  orderItems,
  cartItems,
  reviews,
  newsletterSubscriptions,
  type User,
  type UpsertUser,
  type UpdateUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type Review,
  type InsertReview,
  type NewsletterSubscription,
} from "@shared/schema";
import { drizzleDb as db } from "./db";
import { eq, desc, asc, and, like, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, userData: UpdateUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    limit?: number;
    sort?: string;
  }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Order operations
  getOrders(userId?: string): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  getUserOrdersWithItems(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  createOrder(order: InsertOrder, userEmail?: string): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Review operations
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Newsletter operations

  createNewsletterSubscription(email: string): Promise<{
    created: boolean;
    alreadyExists: boolean;
  }>;
  getNewsletterSubscription(
    email: string,
  ): Promise<NewsletterSubscription | undefined>;


  // Admin operations
  getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    salesByMonth: Array<{ month: string; thisYear: number; lastYear: number }>;
    ordersByChannel: Array<{ channel: string; value: number }>;
  }>;
  getProductStats(): Promise<{
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  }>;
  getCustomerStats(): Promise<{
    totalCustomers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // We upsert on the email field to avoid creating duplicate users when the
    // same person signs in with Google after registering with email/password.
    // The primary key (id) should remain stable, so we exclude it from the
    // update set in case of conflict.
    const updateData = { ...userData, updatedAt: new Date() } as any;
    delete updateData.id;

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: updateData,
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserProfile(id: string, userData: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = (await db
      .insert(categories)
      .values(category)
      .returning()) as Category[];
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    const conditions = [];

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters?.search) {
      conditions.push(
        sql`${products.name} ILIKE ${`%${filters.search}%`} OR ${products.description} ILIKE ${`%${filters.search}%`}`
      );
    }
    if (filters?.minPrice) {
      conditions.push(sql`${products.price} >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice) {
      conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }
    if (filters?.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, filters.isFeatured));
    }
    const baseQuery = conditions.length > 0
      ? db.select().from(products).where(and(...conditions))
      : db.select().from(products);

    const orderMap: Record<string, any> = {
      'newest': desc(products.createdAt),
      'price-asc': asc(products.price),
      'price-desc': desc(products.price),
    };
    const orderExpr = orderMap[filters?.sort ?? 'newest'];
    const orderedQuery = baseQuery.orderBy(orderExpr);

    const limitedQuery = filters?.limit
      ? orderedQuery.limit(filters.limit)
      : orderedQuery;

    return await limitedQuery;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order operations
  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    } else {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    }
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderWithItems(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items: items.map(item => ({
        ...item.order_items,
        product: item.products!,
      })),
    };
  }

  async getUserOrdersWithItems(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const userOrders = await this.getOrders(userId);
    const ordersWithItems = [];

    for (const order of userOrders) {
      const items = await db
        .select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      ordersWithItems.push({
        ...order,
        items: items.map(item => ({
          ...item.order_items,
          product: item.products!,
        })),
      });
    }

    return ordersWithItems;
  }

  async createOrder(order: InsertOrder, userEmail?: string): Promise<Order> {
    return db.transaction(async tx => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      if (userEmail && Number(order.discount) > 0) {
        await tx
          .update(newsletterSubscriptions)
          .set({ discountUsed: true })
          .where(sql`lower(${newsletterSubscriptions.email}) = ${userEmail.toLowerCase()}`);
      }
      return newOrder;
    });
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    return items.map(item => ({
      ...item.cart_items,
      product: item.products!,
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, item.userId),
          eq(cartItems.productId, item.productId),
          eq(cartItems.size, item.size || ""),
          eq(cartItems.color, item.color || "")
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + item.quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Review operations
  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    const reviewsData = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return reviewsData.map(review => ({
      ...review.reviews,
      user: review.users!,
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();

    // Update product aggregate rating and review count
    const [stats] = await db
      .select({
        avg: sql<number>`avg(${reviews.rating})`,
        count: sql<number>`count(*)`,
      })
      .from(reviews)
      .where(eq(reviews.productId, review.productId));

    await db
      .update(products)
      .set({
        averageRating: stats.avg ? stats.avg.toFixed(2) : "0",
        reviewsCount: stats.count,
      })
      .where(eq(products.id, review.productId));

    return newReview;
  }

  async createNewsletterSubscription(email: string): Promise<{
    created: boolean;
    alreadyExists: boolean;
  }> {
    const [inserted] = await db

      .insert(newsletterSubscriptions)
      .values({ email, discountUsed: false })
      .onConflictDoNothing()
      .returning({ id: newsletterSubscriptions.id });

    if (inserted) {
      return { created: true, alreadyExists: false };

    }

    const [existing] = await db
      .select({ id: newsletterSubscriptions.id })
      .from(newsletterSubscriptions)
      .where(sql`lower(${newsletterSubscriptions.email}) = ${email.toLowerCase()}`);

    return { created: false, alreadyExists: !!existing };
  }


  async getNewsletterSubscription(
    email: string,
  ): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)

      .where(sql`lower(${newsletterSubscriptions.email}) = ${email.toLowerCase()}`);
    return subscription;

  }

  // Admin operations
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    salesByMonth: Array<{ month: string; thisYear: number; lastYear: number }>;
    ordersByChannel: Array<{ channel: string; value: number }>;
  }> {
    const allOrders = await db.select().from(orders);

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;
    const completedOrders = allOrders.filter(o => o.status === "delivered").length;

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

    const salesByMonth = monthNames.map((name, idx) => {
      const thisYearTotal = allOrders
        .filter(o => {
          const d = new Date(o.createdAt!);
          return d.getFullYear() === currentYear && d.getMonth() === idx;
        })
        .reduce((acc, o) => acc + Number(o.total), 0);
      const lastYearTotal = allOrders
        .filter(o => {
          const d = new Date(o.createdAt!);
          return d.getFullYear() === lastYear && d.getMonth() === idx;
        })
        .reduce((acc, o) => acc + Number(o.total), 0);
      return { month: name, thisYear: thisYearTotal, lastYear: lastYearTotal };
    });

    const channelMap: Record<string, number> = {};
    for (const o of allOrders) {
      const channel = o.paymentMethod || "Autre";
      channelMap[channel] = (channelMap[channel] || 0) + 1;
    }
    const ordersByChannel = Object.entries(channelMap).map(([channel, value]) => ({ channel, value }));

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      salesByMonth,
      ordersByChannel,
    };
  }

  async getProductStats(): Promise<{
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  }> {
    const [totalProductsResult] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [lowStockResult] = await db.select({ count: sql<number>`count(*)` }).from(products).where(and(sql`${products.stockQuantity} > 0`, sql`${products.stockQuantity} <= 5`));
    const [outOfStockResult] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.stockQuantity, 0));

    return {
      totalProducts: totalProductsResult.count,
      lowStockProducts: lowStockResult.count,
      outOfStockProducts: outOfStockResult.count,
    };
  }

  async getCustomerStats(): Promise<{
    totalCustomers: number;
  }> {
    const [totalCustomersResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "customer"));

    return {
      totalCustomers: totalCustomersResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
