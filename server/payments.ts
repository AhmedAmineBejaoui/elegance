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

paymentRouter.post("/flouci", async (req, res) => {
  try {
    const { amount, orderId, returnUrl } = req.body as {
      amount: number;
      orderId: string;
      returnUrl: string;
    };

    const response = await fetch(
      "https://developers.flouci.com/api/gateway/v1/payments/authorize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          app_token: process.env.FLOUCI_APP_TOKEN,
          app_secret: process.env.FLOUCI_APP_SECRET,
          accept_card: true,
          amount,
          session_timeout_secs: 1200,
          success_link: returnUrl,
          fail_link: returnUrl,
          developer_tracking_id: orderId,
        }),
      }
    );

    const data = await response.json();
    const url = data?.result?.link;
    if (!url) {
      return res.status(500).json({ message: "Flouci response invalide" });
    }

    res.json({ url });
  } catch (err) {
    console.error("Flouci error", err);
    res.status(500).json({ message: "Flouci payment failed" });
  }
});

export default paymentRouter;
