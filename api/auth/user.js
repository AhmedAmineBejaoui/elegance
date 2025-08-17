// /api/auth/user.js
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";

/** Récupère une valeur de cookie depuis l'en-tête "cookie" */
function getCookie(name, cookieHeader = "") {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Essaie de lire le cookie 'session' (compat req.cookies et header brut) */
function readSessionToken(req) {
  // Si un parseur de cookies est présent (rare sur Vercel Node pur)
  if (req.cookies?.session) return req.cookies.session;
  // Fallback : parser l'en-tête Cookie à la main
  return getCookie("session", req.headers.cookie || "");
}

/** Charge l'utilisateur courant depuis la DB */
async function fetchUserById(id) {
  // 1) Essaye avec la colonne "role"
  try {
    const { rows } = await sql`
      SELECT id, email, first_name, last_name, avatar_url, role
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    // 2) Si la colonne n'existe pas encore => fallback sans "role"
    // code SQLSTATE '42703' = undefined_column
    if (err?.code === "42703") {
      const { rows } = await sql`
        SELECT id, email, first_name, last_name, avatar_url
        FROM users
        WHERE id = ${id}
        LIMIT 1
      `;
      if (!rows[0]) return null;
      return { ...rows[0], role: "user" }; // défaut
    }
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 1) Lire et vérifier le JWT depuis le cookie
    const token = readSessionToken(req);
    if (!token) return res.status(401).json({ authenticated: false });

    const secret = process.env.SESSION_SECRET;
    const payload = jwt.verify(token, secret); // lève si invalide

    // 2) Charger l'utilisateur depuis la DB
    const user = await fetchUserById(payload.sub);
    if (!user) return res.status(401).json({ authenticated: false });

    // 3) Réponse standardisée
    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        role: user.role ?? "user",
      },
    });
  } catch (e) {
    console.error("[AUTH/USER]", e);
    return res.status(401).json({ authenticated: false });
  }
}
