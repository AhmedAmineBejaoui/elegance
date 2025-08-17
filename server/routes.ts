import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import paymentRouter from "./payments";
import contactRouter from "./routes/contact";
import { insertProductSchema, insertCategorySchema, insertOrderSchema, insertCartItemSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ------ Admin guard
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      req.adminUser = user;
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ------ Auth routes
  app.get("/api/auth/user", (req, res) => {
    const user = (req.user as any) ?? null;
    // 60s de cache navigateur (privé)
    res.set("Cache-Control", "private, max-age=60");
    res.json({ user });
  });

  // ------ Payments
  app.use("/api/payments", isAuthenticated, paymentRouter);

  // ------ Contact
  app.use("/api/contact", contactRouter);

  // ------ Newsletter: subscribe


// ------ Newsletter: subscribe (utilise l'email du compte si connecté)
app.post("/api/newsletter", async (req: any, res) => {
  const schema = z.object({ email: z.string().email() });

  try {
    const { email } = schema.parse(req.body);
    const typed = email.trim().toLowerCase();
    const accountEmail: string | undefined =
      (req.user?.email && String(req.user.email).toLowerCase()) || undefined;

    // si l'utilisateur est connecté, on prend son email de compte
    const emailToUse = accountEmail ?? typed;

    const result = await storage.createNewsletterSubscription(emailToUse);

    if (result.alreadyExists) {
      return res.status(200).json({ message: "Cet email est déjà inscrit à la newsletter" });
    }
    return res.status(201).json({ message: "Inscription réussie à la newsletter" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({ message: "Failed to subscribe to newsletter" });
  }
});

// ------ Newsletter: status (désactive le cache + normalise l'email)
app.get("/api/newsletter/status", isAuthenticated, async (req: any, res) => {
  try {
    res.set("Cache-Control", "no-store"); // pas de 304
    const user = await storage.getUser(req.user.id);
    const email = user?.email ? String(user.email).toLowerCase() : undefined;

    if (!email) {
      return res.json({ subscribed: false, discountAvailable: false });
    }

    const sub = await storage.getNewsletterSubscription(email);
    return res.json({
      subscribed: !!sub,
      discountAvailable: !!sub && !sub.discountUsed,
    });
  } catch (error) {
    console.error("Error fetching newsletter status:", error);
    return res.status(500).json({ message: "Failed to fetch newsletter status" });
  }
});


  // ------ Profile
  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const updatedUser = await storage.updateUserProfile(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ------ User orders (listing)
  app.get('/api/orders/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrdersWithItems(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // ------ Invoice PDF
  app.get('/api/orders/:id/invoice', isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const order = await storage.getOrderWithItems(id);
      if (!order || order.userId !== req.user.id) {
        return res.status(404).json({ message: "Order not found" });
      }
      const user = await storage.getUser(order.userId);
      const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('fr-FR')
        : '';

      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdf = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id}.pdf`);
        res.send(pdf);
      });

      const siteName = 'Tunisian Chic';
      const siteUrl = process.env.PUBLIC_BASE_URL ?? '';

      // Header
      doc.fontSize(20).text(siteName, { align: 'center' });
      if (siteUrl) doc.fontSize(10).text(siteUrl, { align: 'center' });
      doc.moveDown();

      doc.fontSize(16).text(`Facture - Commande #${order.id}`);
      doc.fontSize(12).text(`Date: ${createdAt}`);
      doc.moveDown();

      // Customer details
      doc.text(`Nom: ${(user?.firstName ?? '')} ${(user?.lastName ?? '')}`);
      if (user?.email) doc.text(`Email: ${user.email}`);
      const addr = order.shippingAddress as any;
      if (addr) {
        if (addr.address) doc.text(`Adresse: ${addr.address}`);
        if (addr.city || addr.postalCode) {
          doc.text(`Ville: ${addr.city ?? ''} ${addr.postalCode ?? ''}`);
        }
        if (addr.phone) doc.text(`Téléphone: ${addr.phone}`);
      }
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      const productX = 50;
      const qtyX = 300;
      const priceX = 370;
      const totalX = 450;

      doc.fontSize(12).text('Produit', productX, tableTop);
      doc.text('Quantité', qtyX, tableTop);
      doc.text('Prix', priceX, tableTop);
      doc.text('Total', totalX, tableTop);
      doc.moveTo(productX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 25;
      order.items.forEach((item: any) => {
        const lineTotal = (Number(item.price) * item.quantity).toFixed(2);
        doc.text(item.product.name, productX, y, { width: qtyX - productX - 10 });
        doc.text(String(item.quantity), qtyX, y);
        doc.text(`${item.price} DT`, priceX, y);
        doc.text(`${lineTotal} DT`, totalX, y);
        y += 20;
      });

      doc.moveTo(productX, y).lineTo(550, y).stroke();
      doc.moveDown();

      doc.fontSize(12).text(`Total: ${order.total} DT`, { align: 'right' });
      doc.end();
    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(500).json({ message: 'Failed to generate invoice' });
    }
  });

  // ------ Single order (une seule définition, avec contrôle admin)
  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const order = await storage.getOrderWithItems(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Admin peut tout voir ; sinon, l’utilisateur doit être propriétaire
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  });

  // ------ Categories
  app.get('/api/categories', async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // ------ Products
  app.get('/api/products', async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? Number(req.query.categoryId as string) : undefined,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice as string) : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : true,
        isFeatured: req.query.isFeatured ? req.query.isFeatured === 'true' : undefined,
        limit: req.query.limit ? Number(req.query.limit as string) : undefined,
      };
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await storage.getProductById(id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get('/api/products/slug/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      if ((error as any).code === '23505' && (error as any).constraint === 'products_sku_unique') {
        return res.status(409).json({ message: 'SKU déjà utilisé' });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = Number(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      if ((error as any).code === '23505' && (error as any).constraint === 'products_sku_unique') {
        return res.status(409).json({ message: 'SKU déjà utilisé' });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = Number(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // ------ Cart
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({ ...req.body, userId });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      await storage.removeFromCart(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // ------ Orders
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      const user = await storage.getUser(req.user.id);
      const userId = user?.role === 'admin' ? undefined : req.user.id;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put('/api/orders/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      const paramsSchema = z.object({ id: z.coerce.number().int() });
      const bodySchema = z.object({ status: z.string() });
      const { id } = paramsSchema.parse(req.params);
      const { status } = bodySchema.parse(req.body);
      const order = await storage.updateOrder(id, { status });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input' });
      }
      console.error('Error updating order:', error);
      return res.status(500).json({ message: 'Failed to update order' });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const orderData = insertOrderSchema.parse({ ...req.body, userId });

      const subtotal = Number(orderData.subtotal);
      const tax = Number(orderData.tax);
      const shipping = Number(orderData.shipping);
      let discount = 0;

      if (user?.email) {
        const sub = await storage.getNewsletterSubscription(user.email);
        if (sub && !sub.discountUsed) {
          discount = subtotal * 0.1; // 10%
        }
      }

      orderData.discount = Number(discount.toFixed(2)) as any;
      orderData.total = Number((subtotal + tax + shipping - discount).toFixed(2)) as any;

        const order = await storage.createOrder(orderData, user?.email ?? undefined);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
