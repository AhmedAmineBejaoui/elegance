// api/callback.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: 'Missing code' });

    const base = process.env.PUBLIC_BASE_URL;
    const redirectUri = `${base}${process.env.GOOGLE_CALLBACK_PATH}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('token error', tokens);
      return res.status(400).json({ message: 'OAuth token exchange failed' });
    }

    // TODO: lire le profil Google, créer la session, etc.
    return res.redirect('/'); // ou la page voulue
  } catch (e) {
    console.error('callback error', e);
    return res.status(500).json({ message: 'Internal error' });
  }
}
