// /api/callback.js

import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();


  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: 'Missing code' });


    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const base = process.env.PUBLIC_BASE_URL || `${proto}://${host}`;
    const redirectUri = `${base}/api/callback`;


    // 1) échange code -> tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,

        grant_type: "authorization_code",
      }),

    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {

      console.error("[OAUTH TOKEN ERROR]", {
        status: tokenRes.status,
        redirectUri,
        clientIdTail: process.env.GOOGLE_CLIENT_ID?.slice(-8),
        err: tokens,
      });
      return res.status(400).json({ step: "token", error: tokens });
    }

    const uRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await uRes.json();
    if (!uRes.ok) {
      console.error("[USERINFO ERROR]", profile);
      return res.status(400).json({ step: "userinfo", error: profile });
    }

    const email = profile.email;
    const firstName = profile.given_name || "";
    const lastName = profile.family_name || "";
    const picture = profile.picture || "";


    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT,
        last_name  TEXT,
        email      TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'user'
      )
    `;
    const { rows } = await sql`
      INSERT INTO users (first_name, last_name, email, avatar_url)
      VALUES (${firstName}, ${lastName}, ${email}, ${picture})
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name  = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url
      RETURNING id, email
    `;


    const secret = process.env.SESSION_SECRET;
    const session = jwt.sign(
      { sub: String(rows[0].id), email: rows[0].email, provider: "google" },
      secret,
      { expiresIn: "7d" }
    );

    res.setHeader(
      "Set-Cookie",
      `session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.redirect("/");
  } catch (e) {
    console.error("[CALLBACK ERROR]", e);
    return res.status(500).json({ message: "Internal error" });

  }
}
