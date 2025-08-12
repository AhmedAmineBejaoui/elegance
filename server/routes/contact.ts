import { Router } from "express";
import nodemailer from "nodemailer";
import { z } from "zod";
import "dotenv/config";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  website: z.string().optional(),
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

router.post("/", async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);

    // Honey pot: if website field filled, pretend success without sending
    if (data.website) {
      return res.status(200).json({ message: "Message sent" });
    }

    const to = process.env.CONTACT_RECIPIENT || process.env.SMTP_USER;
    if (!to) {
      throw new Error("Missing CONTACT_RECIPIENT or SMTP_USER env variable");
    }

    await transporter.sendMail({
      from: `${data.name} <${data.email}>`,
      to,
      subject: "New contact message",
      text: data.message,
      replyTo: data.email,
    });

    res.json({ message: "Message sent" });
  } catch (error) {
    console.error("Error sending contact message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
