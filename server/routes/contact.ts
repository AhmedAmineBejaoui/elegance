import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  // Utilise une connexion sécurisée si le port 465 est utilisé (SMTPs)
  secure: Number(process.env.SMTP_PORT) === 465,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
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
      // Expéditeur : adresse SMTP authentifiée
      from: process.env.SMTP_FROM || process.env.SMTP_USER || email,
      // Destinataire : adresse de contact configurée
      to: process.env.CONTACT_TO || process.env.SMTP_USER || "",
      replyTo: email,
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
