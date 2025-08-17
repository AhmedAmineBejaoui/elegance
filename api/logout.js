// /api/logout.js
export default async function handler(req, res) {
  // On accepte GET (si tu cliques un lien) et POST (si tu fais fetch côté client)
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Supprime le cookie "session" en l'écrasant avec Max-Age=0
  res.setHeader(
    "Set-Cookie",
    "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );

  // Empêche toute mise en cache
  res.setHeader("Cache-Control", "no-store");

  // Redirige vers la home (tu peux changer vers /login si tu veux)
  return res.redirect(302, "/");
}
