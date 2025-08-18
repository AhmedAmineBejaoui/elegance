import { storage } from "../storage.js";
import { getDb } from "../db.js";

async function run() {
  const email = `test${Date.now()}@example.com`;
  console.log("first signup", await storage.createNewsletterSubscription(email));
  console.log("second signup", await storage.createNewsletterSubscription(email));
  const sub = await storage.getNewsletterSubscription(email);
  console.log("after signup", sub);

  const userId = `u_${Date.now()}`;
  await storage.upsertUser({ id: userId, email });

  const orderData = {
    orderNumber: `O${Date.now()}`,
    userId,
    subtotal: "100",
    tax: "0",
    shipping: "0",
    discount: "10",
    total: "90",
    shippingAddress: {},
    billingAddress: {},
    paymentStatus: "paid",
  } as any;

  const order = await storage.createOrder(orderData, email);
  console.log("first order", order.id);
  const subAfterOrder = await storage.getNewsletterSubscription(email);
  console.log("after order", subAfterOrder);

  const secondOrder = await storage.createOrder(
    { ...orderData, orderNumber: `O${Date.now()}b`, discount: "0", total: "100" },
    email,
  );
  console.log("second order", secondOrder.id);
  const db = getDb();
  await db.end?.();
}

run().catch(err => {
  console.error("test run failed", err);
  const db = getDb();
  db.end?.();
});
