// /api/callback.js
import jwt from "jsonwebtoken";
import { createPool } from '@vercel/postgres';

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

    // Créer ou récupérer l'utilisateur dans la base de données
    const db = createPool({ connectionString: process.env.DATABASE_URL });
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    let user;
    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
    } else {
      // Créer un nouvel utilisateur
      const newUser = await db.sql`
        INSERT INTO users (email, first_name, last_name, profile_image_url, created_at, updated_at)
        VALUES (${email}, ${profile.given_name || null}, ${profile.family_name || null}, ${profile.picture || null}, NOW(), NOW())
        RETURNING *
      `;
      user = newUser.rows[0];
    }

    // Créer un token JWT avec les informations de l'utilisateur
    const payload = { 
      sub: user.id, 
      email: user.email, 
      provider: "google",
      firstName: user.first_name,
      lastName: user.last_name
    };

    const secret = process.env.SESSION_SECRET;
    if (!secret) return res.status(500).json({ step: "jwt", message: "SESSION_SECRET missing" });

    const sessionToken = jwt.sign(payload, secret, { expiresIn: "7d" });

    const isProd = process.env.NODE_ENV === "production";
    const cookieParts = [
      `session=${sessionToken}`,
      "Path=/",
      "HttpOnly",
      isProd ? "Secure" : undefined,
      "SameSite=Lax",
      `Max-Age=${7 * 24 * 60 * 60}`,
    ].filter(Boolean);

    res.setHeader("Set-Cookie", cookieParts.join("; "));

    // Rediriger vers la page d'accueil avec un paramètre de succès
    return res.redirect(302, "/?auth=success");
  } catch (e) {
    console.error("[CALLBACK CRASH]", e);
    return res.status(500).json({ message: "Internal error", error: String(e) });
  }
}
