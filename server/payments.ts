import { Router, Request, Response } from "express";
import Stripe from "stripe";
import express from "express"; // pour le webhook en raw body

export const paymentRouter = Router();

// Stripe initialization
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-09-30" as any,
    })
  : null;

// Helper: validate amount
const isValidAmount = (amount: any): amount is number =>
  typeof amount === "number" && Number.isInteger(amount) && amount > 0;

/**
 * 🔹 Konnect Payment
 */
paymentRouter.post("/konnect", async (req: Request, res: Response) => {
  try {
    const { amount, orderId, returnUrl } = req.body;

    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const response = await fetch(
      "https://api.konnect.network/api/v2/payments/init",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.KONNECT_API_KEY}`,
        },
        body: JSON.stringify({
          amount,
          note: orderId,
          url: returnUrl,
        }),
      }
    );

    const data = await response.json();
    const url = data?.payment_url || data?.redirect_url || data?.result?.link;

    if (!url) {
      return res.status(500).json({ message: "Konnect response invalide" });
    }

    res.json({ url });
  } catch (err) {
    console.error("Konnect error", err);
    res.status(500).json({ message: "Konnect payment failed" });
  }
});

/**
 * 🔹 Flouci Payment (v2 API)
 */
paymentRouter.post("/flouci", async (req: Request, res: Response) => {
  try {
    const { amount, description, returnUrl } = req.body;

    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const response = await fetch("https://api.flouci.com/api/generate_payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        store_id: process.env.FLOUCI_STORE_ID || "",
        store_secret: process.env.FLOUCI_STORE_SECRET || "",
      },
      body: JSON.stringify({
        amount,
        accept_card: true,
        session_timeout_secs: 1200,
        description,
        success_link: returnUrl,
        fail_link: returnUrl,
      }),
    });

    const data = await response.json();
    const url = data?.result?.link || data?.link;

    if (!url) {
      return res.status(500).json({ message: "Flouci response invalide" });
    }

    res.json({ url });
  } catch (err) {
    console.error("Flouci error", err);
    res.status(500).json({ message: "Flouci payment failed" });
  }
});

/**
 * 🔹 Paymee Payment
 */
paymentRouter.post("/paymee", async (req: Request, res: Response) => {
  try {
    const { amount, note, returnUrl } = req.body;

    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const response = await fetch("https://sandbox.paymee.tn/api/v2/payments/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.PAYMEE_API_KEY}`,
      },
      body: JSON.stringify({
        amount,
        note,
        url: returnUrl,
      }),
    });

    const data = await response.json();
    const url = data?.data?.payment_url || data?.payment_url || data?.result?.link;

    if (!url) {
      return res.status(500).json({ message: "Paymee response invalide" });
    }

    res.json({ url });
  } catch (err) {
    console.error("Paymee error", err);
    res.status(500).json({ message: "Paymee payment failed" });
  }
});

/**
 * 🔹 Stripe Payment (Checkout Session)
 */
paymentRouter.post("/stripe", async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe non configuré" });
    }

    const { amount, currency = "usd", successUrl, cancelUrl } = req.body;

    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Commande TUNISIANCHIC" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error", err);
    res.status(500).json({ message: "Stripe checkout failed" });
  }
});

/**
 * 🔹 Stripe Webhook (paiement sécurisé)
 */
paymentRouter.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    if (!sig || !stripe) {
      return res.status(400).send("Signature ou Stripe manquant");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("❌ Webhook signature invalide :", err.message);
      return res.status(400).send("Webhook Error");
    }

    // ✅ Gérer l'événement de paiement réussi
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;
      const customerEmail = session.customer_details?.email;

      console.log("✅ Paiement Stripe réussi pour :", sessionId, customerEmail);
      // 👉 Tu peux ici :
      // - activer la commande
      // - envoyer un email de confirmation
      // - créer une facture, etc.
    }

    res.status(200).send("Webhook reçu");
  }
);

export default paymentRouter;
