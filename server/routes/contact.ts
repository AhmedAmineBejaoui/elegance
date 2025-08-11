import { Router, type Request, type Response } from "express";
import { transporter } from "../mail/transporter";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  message: z.string().min(1, "Message requis").max(5000),
  website: z.string().optional(), // champ honey-pot anti-spam
});

function escapeHtml(input: string) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Données invalides", details: parsed.error.flatten() });
  }

  const { name, email, message, website } = parsed.data;

  // Honey-pot rempli => on répond "ok" sans rien faire (bot probable)
  if (website && website.trim() !== "") {
    return res.json({ ok: true });
  }

  const to = process.env.CONTACT_TO || "casadelmarguesthouse@gmail.com";
  const fromUser = process.env.SMTP_USER!;

  const html = `
    <div style="font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
      <h2 style="margin:0 0 12px">Nouveau message depuis le site</h2>
      <p style="margin:0 0 8px"><strong>Nom:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:16px 0 8px"><strong>Message:</strong></p>
      <div style="white-space:pre-wrap; border:1px solid #eee; padding:12px; border-radius:8px; background:#fafafa;">
        ${escapeHtml(message)}
      </div>
      <p style="margin-top:16px; font-size:12px; color:#888">Envoyé automatiquement par le formulaire de contact.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `Website Contact <${fromUser}>`, // Gmail exige que "from" corresponde à l’utilisateur authentifié
      to,
      subject: `📩 Nouveau message de ${name}`,
      replyTo: email, // cliquer "Répondre" répondra au visiteur
      text: `Nom: ${name}\nEmail: ${email}\n\n${message}`,
      html,
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("sendMail error:", e);
    return res.status(500).json({ error: "Erreur lors de l'envoi. Réessayez plus tard." });
  }
});

export default router;