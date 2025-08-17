// /api/login.js
export default async function handler(req, res) {
  const base = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`; // ex: https://elegance-rho.vercel.app
  const redirectUri = `${base}/api/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  console.log('[LOGIN] client_id=', process.env.GOOGLE_CLIENT_ID);
  console.log('[LOGIN] redirect_uri=', redirectUri);
  return res.redirect(authUrl);
}
