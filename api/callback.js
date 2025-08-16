// api/callback.js
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

// URL de callback utilisée pour Google OAuth (prod)
const PUBLIC_BASE_URL = "https://elegance-rho.vercel.app"; // prod
const CALLBACK_PATH = "/api/callback";
const REDIRECT_URI = `${PUBLIC_BASE_URL}${CALLBACK_PATH}`;

// Vercel Node functions get global fetch (Node 18+), no need for node-fetch

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: 'Missing code' });

    const redirectUri = REDIRECT_URI;

    // 1) Exchange authorization code -> tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,          
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('OAuth token exchange failed:', tokens);
      return res.status(400).json({ message: 'OAuth token exchange failed' });
    }

    // 2) Fetch Google user profile (email, name, picture, etc.)
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await userRes.json();
    if (!userRes.ok) {
      console.error('Userinfo error:', profile);
      return res.status(400).json({ message: 'Failed to fetch Google profile' });
    }

    // Profile fields we’ll use
    const email = profile.email;
    const firstName = profile.given_name || '';
    const lastName = profile.family_name || '';
    const picture = profile.picture || '';

    if (!email) {
      return res.status(400).json({ message: 'Google profile has no email' });
    }

    // 3) Ensure users table exists (id serial, email unique, etc.)
    //    You can remove this block after your schema is migrated.
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        avatar_url TEXT
      )
    `;

    // 4) Upsert user by email
    const upsert = await sql`
      INSERT INTO users (first_name, last_name, email, avatar_url)
      VALUES (${firstName}, ${lastName}, ${email}, ${picture})
      ON CONFLICT (email)
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name  = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url
      RETURNING id, email
    `;
    const user = upsert.rows[0];

    // 5) Create a signed session cookie (JWT)
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      console.error('SESSION_SECRET missing');
      return res.status(500).json({ message: 'Server misconfigured' });
    }

    const sessionToken = jwt.sign(
      { sub: String(user.id), email: user.email, provider: 'google' },
      secret,
      { expiresIn: '7d' }
    );

    const week = 7 * 24 * 60 * 60; // seconds
    res.setHeader('Set-Cookie',
      `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${week}`
    );

    // 6) Redirect home (or your dashboard)
    return res.redirect('/');

  } catch (e) {
    console.error('callback error', e);
    return res.status(500).json({ message: 'Internal error' });
  }
}
