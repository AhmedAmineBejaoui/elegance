// /api/callback.js
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: "Missing code" });

    const base = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`;
    const redirect_uri = `${base}/api/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("[TOKEN]", tokenRes.status, tokens);
      return res.status(400).json({ step: "token", error: tokens });
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();
    if (!userRes.ok) {
      console.error("[USERINFO]", userRes.status, profile);
      return res.status(400).json({ step: "userinfo", error: profile });
    }

    const email = profile.email;
    if (!email) return res.status(400).json({ message: "Google profile has no email" });

    // Si tu n'utilises pas encore la DB, on peut mettre l'email comme sub
    const payload = { sub: email, email, provider: "google" };

    const secret = process.env.SESSION_SECRET;
    if (!secret) return res.status(500).json({ step: "jwt", message: "SESSION_SECRET missing" });

    const sessionToken = jwt.sign(payload, secret, { expiresIn: "7d" });

    res.setHeader(
      "Set-Cookie",
      `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.redirect(302, "/");
  } catch (e) {
    console.error("[CALLBACK CRASH]", e);
    return res.status(500).json({ message: "Internal error", error: String(e) });
  }
}
