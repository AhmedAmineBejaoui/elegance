import { Router } from "express";

export const paymentRouter = Router();

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

export default paymentRouter;
