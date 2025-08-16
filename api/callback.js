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

    // 1) code -> tokens
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
      console.error("[TOKEN] status", tokenRes.status, tokens);
      return res.status(400).json({ step: "token", error: tokens });
    }

    // 2) userinfo
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();
    if (!userRes.ok) {
      console.error("[USERINFO] status", userRes.status, profile);
      return res.status(400).json({ step: "userinfo", error: profile });
    }

    const email = profile.email;
    const firstName = profile.given_name || "";
    const lastName = profile.family_name || "";
    const picture = profile.picture || "";

    if (!email) return res.status(400).json({ message: "Google profile has no email" });

    // 3) (Optionnel) Upsert DB — garde ton code si besoin, sinon commente pour tester
    // const upsert = await sql`...`;
    // const user = upsert.rows[0];
    // const userId = String(user.id);

    // Si tu n'utilises pas la DB, mets un id fake basé sur l'email
    const userId = email;

    // 🔴 ICI était l'erreur : on définit BIEN payload avant jwt.sign
    const payload = { sub: userId, email, provider: "google" };

    // 4) JWT
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      console.error("[JWT] SESSION_SECRET missing");
      return res.status(500).json({ step: "jwt", message: "SESSION_SECRET missing" });
    }

    const sessionToken = jwt.sign(payload, secret, { expiresIn: "7d" });

    res.setHeader(
      "Set-Cookie",
      `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    // 5) Redirect final
    return res.redirect("/");
  } catch (e) {
    console.error("[CALLBACK CRASH]", e);
    return res.status(500).json({ message: "Internal error", error: String(e) });
  }
}
