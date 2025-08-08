import { Router } from "express";
import Stripe from "stripe";

export const paymentRouter = Router();

// Initialisation Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-09-30" as any })
  : null;

/**
 * 🔹 Konnect Payment
 */
paymentRouter.post("/konnect", async (req, res) => {
  try {
    const { amount, orderId, returnUrl } = req.body as {
      amount: number;
      orderId: string;
      returnUrl: string;
    };

    const response = await fetch("https://api.konnect.network/api/v2/payments/init", {
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
    });

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
 * 🔹 Flouci Payment (nouvelle version API)
 */
paymentRouter.post("/flouci", async (req, res) => {
  try {
    const { amount, description, returnUrl } = req.body as {
      amount: number;
      description?: string;
      returnUrl: string;
    };

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
paymentRouter.post("/paymee", async (req, res) => {
  try {
    const { amount, note, returnUrl } = req.body as {
      amount: number;
      note?: string;
      returnUrl: string;
    };

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
paymentRouter.post("/stripe", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe non configuré" });
    }

    const { amount, currency = "usd", successUrl, cancelUrl } = req.body as {
      amount: number;
      currency?: string;
      successUrl: string;
      cancelUrl: string;
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Order" },
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

export default paymentRouter;
