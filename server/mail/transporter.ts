import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER; // e.g. casadelmarguesthouse@gmail.com
const pass = process.env.SMTP_PASS; // Gmail App Password

if (!user || !pass) {
  throw new Error("SMTP_USER/SMTP_PASS manquants. Ajoutez-les dans .env");
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true pour 465, false pour 587
  auth: { user, pass },
});