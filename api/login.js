// /api/login.js
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  // Vérifier que les variables d'environnement sont configurées
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("[LOGIN ERROR] GOOGLE_CLIENT_ID not configured");
    return res.status(500).json({ message: "OAuth not configured" });
  }

  // utilise PUBLIC_BASE_URL en production (évite les preview Vercel)
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const base = process.env.PUBLIC_BASE_URL || `${proto}://${host}`;
  const redirectUri = `${base}/api/callback`;

  console.log(`[LOGIN] Redirecting to Google OAuth with callback: ${redirectUri}`);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    prompt: "consent",
    access_type: "online",
    state: Math.random().toString(36).slice(2)
  });

  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
