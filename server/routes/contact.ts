import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

router.post("/", async (req, res) => {
  const { name, email, message, website } = req.body ?? {};

  if (website) {
    return res.status(400).json({ error: "Spam detected" });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER || "",
      subject: `Contact form submission from ${name}`,
      text: message,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending contact message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
