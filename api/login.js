// api/login.js
// URL de callback utilisée pour Google OAuth (prod)
const PUBLIC_BASE_URL = "https://elegance-rho.vercel.app"; // prod
const CALLBACK_PATH = "/api/callback";
const REDIRECT_URI = `${PUBLIC_BASE_URL}${CALLBACK_PATH}`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const redirectUri = REDIRECT_URI;

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (e) {
    console.error('google start error', e);
    return res.status(500).json({ message: 'Internal error' });
  }
}
